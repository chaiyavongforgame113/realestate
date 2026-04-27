"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter as FilterIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/ui/container";
import { SearchBar } from "@/components/search/search-bar";
import { AIInterpretation, type ParsedChips } from "@/components/search/ai-interpretation";
import { AIClarification } from "@/components/search/ai-clarification";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { ResultsToolbar, type ViewMode, type SortKey } from "@/components/search/results-toolbar";
import { ListingCard } from "@/components/listing-card";
import { DynamicSearchMap } from "@/components/search/search-map-dynamic";
import { fetchListings } from "@/lib/listings/client";
import { toCardView } from "@/lib/listings/adapter";
import type { SampleListing } from "@/lib/sample-data";
import type { ListingDTO } from "@/lib/listings/transform";
import { cn } from "@/lib/utils";

interface Clarification {
  question: string;
  quick_replies: string[];
  field_asking_about: string;
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQuery = params.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // AI state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [chips, setChips] = useState<ParsedChips | null>(null);
  const [clarification, setClarification] = useState<Clarification | null>(null);
  const [listings, setListings] = useState<SampleListing[]>([]);
  const [matchReasons, setMatchReasons] = useState<Record<string, string>>({});
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rawIntent, setRawIntent] = useState<Record<string, unknown> | null>(null);
  const [saved, setSaved] = useState(false);
  // React StrictMode runs effects twice in dev — track per-mount whether the
  // chat handoff has been consumed so the second pass doesn't trigger
  // runAISearch on an already-loaded result set.
  const handoffConsumed = useRef(false);

  async function saveSearch() {
    if (!query || !rawIntent) return;
    const name = prompt("ตั้งชื่อการค้นหานี้:", query.slice(0, 60));
    if (!name) return;
    const res = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, query, intent: rawIntent, notifyOnNew: true }),
    });
    if (res.status === 401) {
      window.location.href = "/login?reason=account&redirect=" + encodeURIComponent(window.location.pathname + window.location.search);
      return;
    }
    if (res.ok) setSaved(true);
  }

  async function runAISearch(message: string, clarificationAnswer = false) {
    setLoading(true);
    setClarification(null);
    try {
      const res = await fetch("/api/search/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          session_id: clarificationAnswer ? sessionId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "AI search ล้มเหลว");
      setSessionId(data.session_id);

      if (data.type === "clarification") {
        setClarification({
          question: data.question,
          quick_replies: data.quick_replies,
          field_asking_about: data.field_asking_about,
        });
        if (data.partial_intent) setChips(partialToChips(data.partial_intent));
      } else if (data.type === "results") {
        const dtos = data.listings as (ListingDTO & { match_reason: string | null })[];
        setListings(dtos.map((l) => toCardView(l)));
        setMatchReasons(
          Object.fromEntries(dtos.map((l) => [l.id, l.match_reason ?? ""]).filter(([, r]) => r))
        );
        setInterpretation(data.explanation);
        setChips(intentToChips(data.intent, data.relaxed));
        setRawIntent(data.intent);
        setTotalCount(data.total);
        setSaved(false);
      }
    } catch (e) {
      console.error(e);
      // Fallback to keyword search
      const fb = await fetchListings({ limit: 20 });
      setListings(fb.listings.map(toCardView));
      setTotalCount(fb.pagination.total);
    } finally {
      setLoading(false);
    }
  }

  // Re-fetch whenever any URL search param changes (listing_type, property_types, q, etc.)
  const paramsString = params.toString();

  useEffect(() => {
    const q = params.get("q") ?? "";
    const fromChat = params.get("from_chat") === "1";

    // Hand-off path: chat on home page already produced results — read them
    // from sessionStorage instead of re-querying. Avoids re-asking clarifications.
    // If we've already consumed it this mount (StrictMode double-effect), bail —
    // the existing state already reflects the handoff.
    if (fromChat && handoffConsumed.current) {
      return;
    }
    if (fromChat && typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("estate.ai-search-handoff");
        if (raw) {
          const handoff = JSON.parse(raw) as {
            sessionId: string;
            intent: Record<string, unknown>;
            explanation: string;
            listings: (ListingDTO & { match_reason: string | null })[];
            total: number;
            relaxed: { key: string; label: string }[];
            ts: number;
          };
          // Treat handoff as fresh only within 5 minutes
          if (Date.now() - handoff.ts < 5 * 60 * 1000) {
            setQuery(q);
            setSessionId(handoff.sessionId);
            setListings(handoff.listings.map((l) => toCardView(l)));
            setMatchReasons(
              Object.fromEntries(
                handoff.listings
                  .map((l) => [l.id, l.match_reason ?? ""])
                  .filter(([, r]) => r)
              )
            );
            setInterpretation(handoff.explanation);
            setChips(intentToChips(handoff.intent, handoff.relaxed));
            setRawIntent(handoff.intent);
            setTotalCount(handoff.total);
            setLoading(false);
            sessionStorage.removeItem("estate.ai-search-handoff");
            handoffConsumed.current = true;
            // Strip ?from_chat=1 from URL so a paramsString change later doesn't
            // re-trigger runAISearch (which would re-ask the same clarifications).
            const url = new URL(window.location.href);
            url.searchParams.delete("from_chat");
            window.history.replaceState({}, "", url.toString());
            return;
          }
        }
      } catch {
        // fall through to normal AI search
      }
    }

    if (q) {
      setQuery(q);
      runAISearch(q);
    } else {
      setQuery("");
      setInterpretation(null);
      setChips(null);
      setClarification(null);
      setRawIntent(null);
      const listingType = params.get("listing_type") as "sale" | "rent" | null;
      const propTypes = params.get("property_types")?.split(",").filter(Boolean);
      const districts = params.get("districts")?.split(",").filter(Boolean);
      setLoading(true);
      fetchListings({
        limit: 20,
        ...(listingType && { listing_type: listingType }),
        ...(propTypes?.length && { property_types: propTypes }),
        ...(districts?.length && { districts }),
      }).then((res) => {
        setListings(res.listings.map(toCardView));
        setTotalCount(res.pagination.total);
      }).finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsString]);

  const handleMapClick = useCallback((id: string) => {
    router.push(`/listing/${id}`);
  }, [router]);

  const handleMapHover = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  return (
    <main>
      <Navbar />

      <div className="pt-24 md:pt-28">
        <Container>
          <div className="mb-5">
            <SearchBar
              initial={query}
              onSubmit={(q) => {
                setQuery(q);
                runAISearch(q);
              }}
            />
          </div>

          {clarification ? (
            <AIClarification
              question={clarification.question}
              quickReplies={clarification.quick_replies}
              onAnswer={(ans) => {
                setQuery(ans);
                runAISearch(ans, true);
              }}
            />
          ) : interpretation ? (
            <AIInterpretation
              interpreted={interpretation}
              chips={chips ?? {}}
              resultCount={totalCount}
              onSave={rawIntent ? saveSearch : undefined}
              saved={saved}
            />
          ) : null}

          <div className="mt-6 grid grid-cols-1 gap-6 pb-32 lg:grid-cols-[280px_1fr]">
            <div className="hidden lg:block">
              <FilterSidebar />
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between gap-3 lg:mb-5">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium shadow-soft lg:hidden"
                >
                  <FilterIcon className="h-4 w-4" />
                  ตัวกรอง
                </button>

                <div className="flex-1">
                  <ResultsToolbar
                    view={view}
                    onViewChange={setView}
                    sort={sort}
                    onSortChange={setSort}
                    totalCount={loading ? 0 : totalCount || listings.length}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="search-skeletons"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
                        <div className="skeleton aspect-[4/3] w-full rounded-none" />
                        <div className="space-y-3 p-4">
                          <div className="flex items-center justify-between">
                            <div className="skeleton h-5 w-28" />
                            <div className="skeleton h-4 w-14 rounded-full" />
                          </div>
                          <div className="skeleton h-4 w-[85%]" />
                          <div className="skeleton h-4 w-[60%]" />
                          <div className="flex items-center gap-4 pt-2">
                            <div className="skeleton h-4 w-12" />
                            <div className="skeleton h-4 w-12" />
                            <div className="skeleton h-4 w-14" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : view === "map" ? (
                  <div className="flex h-[75vh] min-h-[520px] gap-4 overflow-hidden rounded-2xl border border-line">
                    {/* Left: scrollable listing cards */}
                    <div className="w-[380px] shrink-0 overflow-y-auto bg-white p-3 no-scrollbar">
                      <p className="mb-3 px-1 text-xs font-semibold text-ink-muted">
                        {listings.length} รายการบนแผนที่
                      </p>
                      <div className="space-y-3">
                        {listings.map((l, i) => (
                          <div
                            key={l.id}
                            onMouseEnter={() => setHoveredId(l.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={cn(
                              "rounded-xl transition-all duration-200",
                              hoveredId === l.id && "ring-2 ring-brand-500 ring-offset-1"
                            )}
                          >
                            <ListingCard
                              listing={{
                                ...l,
                                aiRecommended: !!matchReasons[l.id],
                                matchReason: matchReasons[l.id],
                              }}
                              index={i}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Right: interactive map */}
                    <div className="flex-1 overflow-hidden rounded-r-2xl bg-surface-sunken">
                      <DynamicSearchMap
                        listings={listings.map((l) => ({
                          ...l,
                          aiRecommended: !!matchReasons[l.id],
                          matchReason: matchReasons[l.id],
                        }))}
                        hoveredId={hoveredId}
                        onHoverListing={handleMapHover}
                        onClickListing={handleMapClick}
                      />
                    </div>
                  </div>
                ) : listings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-line bg-white/60 p-10 text-center">
                    <p className="font-display text-lg font-bold text-ink">ไม่พบทรัพย์ที่ตรงกับเงื่อนไข</p>
                    <p className="mt-1 text-sm text-ink-muted">ลองปรับเงื่อนไขหรือใช้ AI Search อีกครั้ง</p>
                  </div>
                ) : (
                  <motion.div
                    key="search-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "grid gap-4 md:gap-5",
                      view === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                        : "grid-cols-1"
                    )}
                  >
                    {listings.map((l, i) => (
                      <ListingCard
                        key={l.id}
                        listing={{
                          ...l,
                          aiRecommended: !!matchReasons[l.id],
                          matchReason: matchReasons[l.id],
                        }}
                        index={i}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Container>
      </div>

      <Footer />

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm overflow-y-auto bg-white p-4 shadow-lift lg:hidden"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">ตัวกรอง</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-sunken"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterSidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function intentToChips(intent: any, relaxed?: { key: string; label: string }[]): ParsedChips {
  const propLabels: Record<string, string> = {
    condo: "คอนโด",
    house: "บ้านเดี่ยว",
    townhouse: "ทาวน์เฮาส์",
    land: "ที่ดิน",
    commercial: "พาณิชย์",
  };
  return {
    search_goal: intent.search_goal,
    property_types: (intent.property_types ?? []).map((t: string) => propLabels[t] ?? t),
    budget_max: intent.budget_max,
    bedrooms: intent.bedrooms,
    preferred_stations: intent.preferred_stations ?? [],
    preferred_districts: intent.preferred_districts ?? [],
    required_amenities: intent.required_amenities ?? [],
    nice_to_have_amenities: intent.nice_to_have_amenities ?? [],
    neighborhood_vibe: intent.neighborhood_vibe ?? [],
    nearby_poi: intent.nearby_poi ?? [],
    view_preference: intent.view_preference ?? [],
    floor_preference: intent.floor_preference ?? null,
    building_age_max_years: intent.building_age_max_years ?? null,
    max_distance_to_transit_m: intent.max_distance_to_transit_m ?? null,
    raw_keywords: intent.raw_keywords ?? [],
    relaxed: relaxed ?? [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function partialToChips(partial: any): ParsedChips {
  return intentToChips(partial);
}

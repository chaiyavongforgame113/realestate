"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, ExternalLink, RefreshCw, Zap } from "lucide-react";
import { MessageBubble, QuickReplyChips } from "./message-bubble";
import { TypingDots } from "./typing-dots";
import { InlineListingCard, type InlineListing } from "./inline-listing-card";
import { VoiceInputButton } from "@/components/voice/voice-input-button";
import { cn } from "@/lib/utils";

type ChatTurn =
  | { role: "user"; content: string }
  | {
      role: "assistant";
      content: string;
      quickReplies?: string[];
      listings?: InlineListing[];
      relaxed?: { key: string; label: string }[];
      total?: number;
    };

const HANDOFF_KEY = "estate.ai-search-handoff";

export function ChatModal({
  open,
  onClose,
  initialMessage,
}: {
  open: boolean;
  onClose: () => void;
  /** First user message — auto-sent when modal opens */
  initialMessage?: string;
}) {
  const router = useRouter();
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [intent, setIntent] = useState<Record<string, unknown> | null>(null);
  const [pending, setPending] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialSentRef = useRef(false);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, pending]);

  // Auto-greet OR auto-send initial message when modal opens
  useEffect(() => {
    if (!open) {
      // Reset state when closed
      initialSentRef.current = false;
      return;
    }
    if (initialSentRef.current) return;
    initialSentRef.current = true;

    if (initialMessage && initialMessage.trim()) {
      void sendMessage(initialMessage.trim());
    } else {
      // Greet without user input — request agent's first turn
      void sendMessage("สวัสดีครับ");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setPending(true);
    setTurns((t) => [...t, { role: "user", content: trimmed }]);

    // Hard timeout — never let the UI hang on a slow/dead Gemini call.
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 30_000);

    try {
      const res = await fetch("/api/chat/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          ...(sessionId && { session_id: sessionId }),
        }),
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      setSessionId(data.session_id);
      setIntent(data.intent ?? null);
      if (data.fallback) setUsingFallback(true);

      if (data.type === "results") {
        setTurns((t) => [
          ...t,
          {
            role: "assistant",
            content: data.reply,
            listings: (data.listings ?? []).slice(0, 3) as InlineListing[],
            relaxed: data.relaxed ?? [],
            total: data.total ?? 0,
          },
        ]);
      } else {
        setTurns((t) => [
          ...t,
          {
            role: "assistant",
            content: data.reply,
            quickReplies: data.quick_replies ?? [],
          },
        ]);
      }
    } catch (e) {
      const isAbort =
        (e instanceof Error && e.name === "AbortError") ||
        (typeof e === "object" && e !== null && "name" in e && (e as { name?: string }).name === "AbortError");
      const msg = isAbort
        ? "AI ตอบช้าเกินไป (timeout) ลองพิมพ์ใหม่อีกครั้งได้ไหมครับ?"
        : e instanceof Error
        ? `ขออภัยครับ มีปัญหาเกิดขึ้น (${e.message}) ลองอีกครั้งได้ไหมครับ?`
        : "ขออภัยครับ ลองพิมพ์อีกครั้งได้ไหม";
      setTurns((t) => [...t, { role: "assistant", content: msg }]);
    } finally {
      clearTimeout(timeoutId);
      setPending(false);
    }
  }

  function handleSubmit() {
    if (!input.trim() || pending) return;
    void sendMessage(input);
    setInput("");
  }

  function handleViewAllResults() {
    // Find the most recent results turn
    const lastResults = [...turns]
      .reverse()
      .find((t): t is Extract<ChatTurn, { role: "assistant"; listings?: InlineListing[] }> =>
        "listings" in t && Array.isArray(t.listings)
      );
    if (!lastResults || !sessionId) return;
    try {
      sessionStorage.setItem(
        HANDOFF_KEY,
        JSON.stringify({
          sessionId,
          intent,
          explanation: lastResults.content,
          listings: lastResults.listings,
          total: lastResults.total ?? lastResults.listings?.length ?? 0,
          relaxed: lastResults.relaxed ?? [],
          ts: Date.now(),
        })
      );
    } catch {
      // storage disabled — ok, /search will fetch fresh
    }
    const q =
      (intent && typeof intent.interpreted_as === "string" && intent.interpreted_as) ||
      "ผลลัพธ์จากแชท";
    router.push(`/search?from_chat=1&session=${sessionId}&q=${encodeURIComponent(q)}`);
    onClose();
  }

  function handleStartOver() {
    setTurns([]);
    setSessionId(null);
    setIntent(null);
    setUsingFallback(false);
    initialSentRef.current = false;
    setTimeout(() => {
      initialSentRef.current = true;
      void sendMessage("สวัสดีครับ");
    }, 100);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={cn(
              "fixed z-[101] flex flex-col bg-white shadow-2xl",
              "inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[88vh] sm:w-[min(640px,94vw)] sm:max-w-[640px]",
              "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:border-line"
            )}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-soft">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-ink">ผู้ช่วย AI</h2>
                  {usingFallback && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                      <Zap className="h-3 w-3" /> โหมดเร็ว
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-muted">
                  {pending ? "กำลังคิด..." : "พร้อมช่วยหาที่อยู่อาศัยที่ใช่"}
                </p>
              </div>
              <button
                onClick={handleStartOver}
                disabled={pending}
                title="เริ่มใหม่"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-sunken hover:text-ink disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-sunken hover:text-ink"
                aria-label="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Message thread */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {turns.map((t, i) => {
                if (t.role === "user") {
                  return (
                    <MessageBubble key={i} role="user">
                      {t.content}
                    </MessageBubble>
                  );
                }
                return (
                  <div key={i} className="space-y-2">
                    <MessageBubble role="assistant">{t.content}</MessageBubble>
                    {t.quickReplies && t.quickReplies.length > 0 && (
                      <QuickReplyChips
                        replies={t.quickReplies}
                        onPick={(r) => sendMessage(r)}
                        disabled={pending}
                      />
                    )}
                    {t.relaxed && t.relaxed.length > 0 && (
                      <div className="ml-10 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-900 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-200">
                        <span className="font-semibold">ปรับเงื่อนไขเล็กน้อย: </span>
                        {t.relaxed.map((r) => r.label).join(" · ")}
                      </div>
                    )}
                    {t.listings && t.listings.length > 0 && (
                      <>
                        <div className="space-y-2">
                          {t.listings.map((l, idx) => (
                            <InlineListingCard key={l.id} listing={l} index={idx} />
                          ))}
                        </div>
                        <div className="ml-10 flex flex-wrap gap-2">
                          <button
                            onClick={handleViewAllResults}
                            className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-800"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            ดูทั้งหมด ({t.total ?? t.listings.length})
                          </button>
                          <button
                            disabled={pending}
                            onClick={() => sendMessage("ขอเงื่อนไขเพิ่ม")}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink-soft hover:border-brand-300 hover:bg-brand-50 disabled:opacity-50"
                          >
                            ปรับเงื่อนไข
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              {pending && (
                <div className="flex items-end gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white shadow-soft">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <TypingDots />
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="shrink-0 border-t border-line bg-surface-sunken/40 p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-line bg-white p-2 transition-shadow focus-within:shadow-glow">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  rows={1}
                  placeholder="พิมพ์คำถามหรือบอกเงื่อนไขเพิ่มเติม..."
                  disabled={pending}
                  className="min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-[15px] text-ink placeholder:text-ink-subtle focus:outline-none disabled:opacity-60"
                />
                <VoiceInputButton
                  onTranscript={(text) => {
                    setInput((prev) => (prev ? prev + " " + text : text));
                    inputRef.current?.focus();
                  }}
                  onLiveUpdate={(text) => setInput(text)}
                  className="hidden sm:flex"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim() || pending}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-700 px-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-800 disabled:opacity-50"
                  aria-label="ส่ง"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

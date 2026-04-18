"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Search, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { quickSuggestions } from "@/lib/sample-data";
import { cn } from "@/lib/utils";
import { VoiceInputButton } from "@/components/voice/voice-input-button";

const placeholders = [
  "อยากได้คอนโดใกล้ BTS ไม่เกิน 3 ล้าน 1 ห้องนอน",
  "บ้านเดี่ยว 3 ห้องนอน แถวรามอินทรา งบ 8 ล้าน",
  "คอนโดให้เช่า สุขุมวิท เฟอร์ครบ 25,000/เดือน",
  "ที่ดินใกล้ถนนหลัก บางนา-ตราด",
];

const tabs = [
  { key: "buy", label: "ซื้อ" },
  { key: "rent", label: "เช่า" },
  { key: "new", label: "โครงการใหม่" },
] as const;

export function AISearchBox() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("buy");
  const [value, setValue] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % placeholders.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const submit = () => {
    if (!value.trim() || submitting) return;
    setSubmitting(true);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div
        className={cn(
          "relative rounded-[28px] bg-white p-2 transition-all duration-300",
          focused ? "shadow-glow" : "shadow-lift"
        )}
      >
        {/* Tab row */}
        <div className="flex items-center gap-1 px-3 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab.key ? "text-white" : "text-ink-muted hover:text-ink"
              )}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tabBg"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
            </span>
            <span className="text-[11px] font-semibold text-brand-800">AI พร้อม</span>
          </div>
        </div>

        {/* Input row */}
        <div className="flex items-end gap-2 p-3">
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              className="block w-full resize-none bg-transparent px-2 py-3 text-[17px] font-medium text-ink placeholder:text-ink-subtle focus:outline-none"
              placeholder=""
            />
            {/* Animated placeholder (only when empty) */}
            {!value && (
              <div className="pointer-events-none absolute inset-0 flex items-center px-2">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={placeholderIdx}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="block truncate text-[17px] text-ink-subtle"
                  >
                    {placeholders[placeholderIdx]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
          </div>

          <VoiceInputButton
            onTranscript={(text) => {
              setValue((prev) => (prev ? prev + " " + text : text));
              inputRef.current?.focus();
            }}
            onLiveUpdate={(text) => setValue(text)}
            className="hidden sm:flex"
          />
          <button
            onClick={submit}
            className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-brand-700 px-5 font-semibold text-white shadow-soft transition-all hover:bg-brand-800 hover:shadow-lift active:translate-y-px"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">ค้นหา</span>
            <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
          </button>
        </div>
      </div>

      {/* Quick suggestions */}
      <div className="mt-5 space-y-2">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-ink-muted">
          ลองค้นหาแบบนี้
        </p>
        <div className="mask-fade-r overflow-hidden md:mask-[none]">
          <div className="flex flex-wrap justify-center gap-2">
            {quickSuggestions.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                onClick={() => {
                  setValue(s);
                  inputRef.current?.focus();
                }}
                className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-sm text-ink-soft backdrop-blur-sm transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
              >
                <Sparkles className="h-3 w-3 text-accent-500 transition-transform group-hover:rotate-12" />
                {s}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

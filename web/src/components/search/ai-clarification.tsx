"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function AIClarification({
  question,
  quickReplies,
  onAnswer,
}: {
  question: string;
  quickReplies: string[];
  onAnswer: (answer: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-brand-200 bg-white p-5 shadow-card"
    >
      {/* decorative corner */}
      <div
        aria-hidden
        className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-100/60 blur-2xl"
      />

      <div className="relative flex items-start gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-soft">
          <Sparkles className="h-5 w-5" />
          <span className="absolute inset-0 animate-pulse-ring rounded-xl ring-2 ring-brand-500" />
        </div>

        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            AI ขอข้อมูลเพิ่มเติม
          </div>
          <p className="mt-1 text-lg font-medium text-ink">{question}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickReplies.map((r) => (
              <button
                key={r}
                onClick={() => onAnswer(r)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink-soft shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 hover:shadow-lift"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

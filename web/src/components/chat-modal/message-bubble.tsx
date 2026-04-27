"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function MessageBubble({
  role,
  children,
  showAvatar = true,
}: {
  role: "user" | "assistant";
  children: ReactNode;
  showAvatar?: boolean;
}) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex items-end gap-2", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && showAvatar && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white shadow-soft">
          <Sparkles className="h-4 w-4" />
        </div>
      )}
      {!isUser && !showAvatar && <div className="h-8 w-8 shrink-0" />}

      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
          isUser
            ? "rounded-br-md bg-brand-700 text-white shadow-soft"
            : "rounded-bl-md border border-brand-100 bg-brand-50 text-stone-900 dark:border-brand-700/40 dark:bg-brand-900/40 dark:text-stone-50"
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

export function QuickReplyChips({
  replies,
  onPick,
  disabled,
}: {
  replies: string[];
  onPick: (r: string) => void;
  disabled: boolean;
}) {
  if (!replies.length) return null;
  return (
    <div className="ml-10 flex flex-wrap gap-2">
      {replies.map((r, i) => (
        <motion.button
          key={r}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          disabled={disabled}
          onClick={() => onPick(r)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-sm font-medium text-brand-800 shadow-soft transition-all",
            "hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-50 hover:shadow-lift",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {r}
        </motion.button>
      ))}
    </div>
  );
}

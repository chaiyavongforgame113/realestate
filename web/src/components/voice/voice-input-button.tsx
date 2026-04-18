"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useSpeech } from "@/lib/voice/use-speech";
import { cn } from "@/lib/utils";

type Props = {
  lang?: string;
  onTranscript: (text: string) => void;
  onLiveUpdate?: (text: string) => void;
  className?: string;
  size?: "sm" | "md";
  continuous?: boolean;
};

export function VoiceInputButton({
  lang = "th-TH",
  onTranscript,
  onLiveUpdate,
  className,
  size = "md",
  continuous = false,
}: Props) {
  const { supported, listening, transcript, error, start, stop } = useSpeech({
    lang,
    continuous,
    interim: true,
    onFinalText: (text) => onTranscript(text),
  });

  useEffect(() => {
    if (listening && transcript) onLiveUpdate?.(transcript);
  }, [transcript, listening, onLiveUpdate]);

  if (!supported) return null;

  const sizeCls = size === "sm" ? "h-9 w-9" : "h-10 w-10";

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={listening ? stop : start}
        aria-label={listening ? "หยุดฟังเสียง" : "พูดเพื่อค้นหา"}
        title={listening ? "หยุดฟัง" : "พูดค้นหา (TH)"}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center rounded-xl transition-all",
          sizeCls,
          listening
            ? "bg-red-50 text-red-600 ring-2 ring-red-300/70 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-600/40"
            : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
        )}
      >
        {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        {listening && (
          <>
            <span className="absolute inset-0 -z-[1] animate-ping rounded-xl bg-red-500/30" />
            <span className="absolute -right-1 -top-1 inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </>
        )}
      </button>

      <AnimatePresence>
        {(listening || error) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 top-full z-40 mt-2 w-72 rounded-2xl border border-line bg-surface p-3 shadow-lift"
          >
            {error ? (
              <div className="text-xs text-red-600">{error}</div>
            ) : (
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-red-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  กำลังฟัง... พูดได้เลย
                </div>
                <div className="mt-1.5 text-sm text-ink">
                  {transcript || (
                    <span className="italic text-ink-subtle">
                      เช่น "คอนโด 1 ห้องนอน ใกล้ BTS ราคาไม่เกิน 3 ล้าน"
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

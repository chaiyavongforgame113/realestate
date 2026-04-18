"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Video, Phone, Sparkles, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { VoiceInputButton } from "@/components/voice/voice-input-button";

type Msg = {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  at: number;
};

const OPENING: Msg = {
  id: "open",
  role: "agent",
  content: "สวัสดีค่ะ ฉันคือผู้ช่วยจาก Estate AI 🌟 มีทรัพย์หรือย่านไหนที่สนใจบ้างคะ?",
  at: Date.now(),
};

/**
 * Floating chat widget — bottom right. AI + agent messages.
 * Posts to /api/chat (AI fallback) and stores session in localStorage.
 * A future video-call CTA links to /api/call/token for WebRTC signaling.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([OPENING]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("estate-chat");
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("estate-chat", JSON.stringify(messages.slice(-40)));
    } catch {}
    // autoscroll
    requestAnimationFrame(() => {
      if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text, at: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply: Msg = {
        id: crypto.randomUUID(),
        role: "agent",
        content:
          data?.reply ??
          "ขอบคุณที่ส่งข้อความค่ะ — ตอนนี้ agent ยังไม่ว่างช่วยตอบ ขอให้ลองพิมพ์ใหม่ภายหลัง หรือลองใช้ AI Search ได้ค่ะ 💬",
        at: Date.now(),
      };
      setMessages((m) => [...m, reply]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "agent",
          content: "ขออภัย ระบบแชทมีปัญหาชั่วคราว ลองใหม่อีกครั้งนะคะ 🙏",
          at: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Toggle bubble */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        initial={{ scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.4 }}
        aria-label={open ? "ปิดแชท" : "เปิดแชท"}
        className="fixed bottom-5 right-5 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-white shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="msg"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              className="relative"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent-500" />
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="glass-card fixed bottom-24 right-5 z-[54] flex h-[540px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden shadow-lift"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-line/50 bg-gradient-brand px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-brand-700 bg-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Estate AI · Live Chat</div>
                  <div className="text-[11px] text-white/80">ตอบกลับไวๆ · มี agent online</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  title="วิดีโอคอล (beta)"
                  onClick={() => (window.location.href = "/enquiries")}
                  className="rounded-full p-1.5 hover:bg-white/20"
                >
                  <Video className="h-4 w-4" />
                </button>
                <button
                  title="โทรหา agent"
                  onClick={() => (window.location.href = "tel:+6620000000")}
                  className="rounded-full p-1.5 hover:bg-white/20"
                >
                  <Phone className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollerRef}
              className="flex-1 space-y-2.5 overflow-y-auto bg-surface-soft/60 p-4"
            >
              {messages.map((m) => (
                <Bubble key={m.id} msg={m} />
              ))}
              {sending && (
                <div className="flex items-center gap-2 text-xs text-ink-muted">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-brand-500" />
                  agent กำลังพิมพ์...
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 border-t border-line/50 bg-surface p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์ข้อความ..."
                className="flex-1 rounded-full border border-line bg-surface-soft px-4 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-brand-500 focus:outline-none"
              />
              <VoiceInputButton
                size="sm"
                onTranscript={(text) => setInput((prev) => (prev ? prev + " " + text : text))}
                onLiveUpdate={(text) => setInput(text)}
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-white shadow-soft hover:shadow-lift disabled:opacity-50"
                aria-label="ส่ง"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex items-end gap-2", isUser && "justify-end")}>
      {!isUser && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white">
          <Sparkles className="h-3 w-3" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-soft",
          isUser
            ? "rounded-br-sm bg-gradient-brand text-white"
            : "rounded-bl-sm bg-surface text-ink border border-line"
        )}
      >
        {msg.content}
      </div>
      {isUser && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-white">
          <UserIcon className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}

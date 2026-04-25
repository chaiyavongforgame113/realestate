"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  senderRole: "user" | "agent";
  body: string;
  readAt: string | null;
  createdAt: string;
};

export function ConversationThread({
  enquiryId,
  viewerRole,
}: {
  enquiryId: string;
  viewerRole: "user" | "agent";
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/enquiries/${enquiryId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiryId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function send() {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/enquiries/${enquiryId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ส่งไม่สำเร็จ");
      setBody("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-white">
      <div
        ref={scrollRef}
        className="max-h-[400px] min-h-[200px] space-y-2 overflow-y-auto p-4"
      >
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังโหลด...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center text-sm text-ink-muted">
            ยังไม่มีข้อความ — เริ่มบทสนทนาด้านล่าง
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderRole === viewerRole;
            return (
              <div
                key={m.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-soft",
                    mine
                      ? "rounded-br-sm bg-brand-700 text-white"
                      : "rounded-bl-sm bg-surface-soft text-ink"
                  )}
                >
                  <div className="whitespace-pre-wrap break-words">{m.body}</div>
                  <div
                    className={cn(
                      "mt-1 text-[10px]",
                      mine ? "text-white/60" : "text-ink-subtle"
                    )}
                  >
                    {new Date(m.createdAt).toLocaleString("th-TH", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {mine && m.readAt && " · อ่านแล้ว"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-line p-3">
        <div className="flex gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            maxLength={2000}
            placeholder="พิมพ์ข้อความ... (Enter ส่ง, Shift+Enter ขึ้นบรรทัดใหม่)"
            className="flex-1 resize-none rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            onClick={send}
            disabled={!body.trim() || sending}
            className="inline-flex h-10 items-center gap-1 self-end rounded-lg bg-brand-700 px-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-800 disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            ส่ง
          </button>
        </div>
        {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
        <div className="mt-1 text-right text-[10px] text-ink-subtle">{body.length}/2000</div>
      </div>
    </div>
  );
}

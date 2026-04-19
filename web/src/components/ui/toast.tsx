"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastCtx {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES: Record<ToastVariant, string> = {
  success:
    "border-green-200 bg-white dark:border-green-800/40 dark:bg-surface-raised",
  error:
    "border-red-200 bg-white dark:border-red-800/40 dark:bg-surface-raised",
  info: "border-brand-200 bg-white dark:border-brand-800/40 dark:bg-surface-raised",
};

const ICON_STYLES: Record<ToastVariant, string> = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-brand-500",
};

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (opts: Omit<Toast, "id">) => {
      const id = `toast-${++counter}`;
      setToasts((prev) => [...prev.slice(-2), { ...opts, id }]); // max 3
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const ctx: ToastCtx = {
    toast: add,
    success: (message, description) =>
      add({ message, description, variant: "success" }),
    error: (message, description) =>
      add({ message, description, variant: "error" }),
    info: (message, description) =>
      add({ message, description, variant: "info" }),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast container — top-right */}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col items-end gap-2 md:right-6 md:top-6">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.variant];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "pointer-events-auto flex w-80 items-start gap-3 rounded-2xl border p-4 shadow-lift",
                  STYLES[t.variant]
                )}
              >
                <Icon
                  className={cn("mt-0.5 h-5 w-5 shrink-0", ICON_STYLES[t.variant])}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{t.message}</p>
                  {t.description && (
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="shrink-0 rounded-full p-1 text-ink-subtle hover:bg-surface-sunken hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {/* Auto-dismiss progress bar */}
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 4, ease: "linear" }}
                  className={cn(
                    "absolute bottom-0 left-0 h-[3px] w-full origin-left rounded-b-2xl",
                    t.variant === "success" && "bg-green-400",
                    t.variant === "error" && "bg-red-400",
                    t.variant === "info" && "bg-brand-400"
                  )}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

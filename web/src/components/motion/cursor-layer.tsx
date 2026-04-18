"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Custom cursor layer — renders a small outer ring + inner dot that follows
 * the pointer with spring smoothing. Grows/changes color when hovering over
 * elements with [data-cursor="link"] or interactive tags (a, button).
 *
 * Automatically disables on touch devices and when reduce-motion is set.
 */
export function CursorLayer() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<"default" | "link" | "text">("default");

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const sx = useSpring(mx, { stiffness: 500, damping: 40, mass: 0.3 });
  const sy = useSpring(my, { stiffness: 500, damping: 40, mass: 0.3 });

  useEffect(() => {
    const canHover =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(canHover);
    if (!canHover) return;

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const interactive = t.closest(
        'a, button, [role="button"], input, textarea, select, [data-cursor]'
      ) as HTMLElement | null;
      if (!interactive) {
        setVariant("default");
        return;
      }
      const forced = interactive.getAttribute("data-cursor");
      if (forced === "text") setVariant("text");
      else if (forced === "link" || /a|button/i.test(interactive.tagName))
        setVariant("link");
      else setVariant("default");
    };
    const onLeaveWindow = () => {
      mx.set(-100);
      my.set(-100);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseleave", onLeaveWindow);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseleave", onLeaveWindow);
    };
  }, [mx, my]);

  if (!enabled) return null;

  const ringSize = variant === "link" ? 44 : variant === "text" ? 6 : 28;
  const dotOpacity = variant === "text" ? 0 : 1;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200] hidden md:block">
      {/* Outer ring */}
      <motion.div
        style={{ x: sx, y: sy }}
        className="absolute left-0 top-0 will-change-transform"
      >
        <motion.div
          animate={{ width: ringSize, height: ringSize, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-500/50 mix-blend-difference"
          style={{
            boxShadow:
              variant === "link"
                ? "0 0 20px 2px rgba(220,38,38,0.35)"
                : "0 0 8px rgba(220,38,38,0.25)",
          }}
        />
      </motion.div>
      {/* Inner dot — follows faster */}
      <motion.div
        style={{ x: mx, y: my, opacity: dotOpacity }}
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600 mix-blend-difference will-change-transform"
        animate={{ width: variant === "link" ? 4 : 6, height: variant === "link" ? 4 : 6 }}
        transition={{ type: "spring", stiffness: 800, damping: 40 }}
      />
    </div>
  );
}

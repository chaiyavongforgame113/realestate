"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring, motion } from "framer-motion";

/**
 * Animated count-up component.
 * Counts from 0 to `to` when the element scrolls into view.
 * Supports suffix (e.g. "+", "%") and locale-formatted output.
 */
export function CountUp({
  to,
  suffix = "",
  duration = 2,
  className,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, {
    stiffness: 60,
    damping: 30,
    duration: duration * 1000,
  });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) {
      motionVal.set(to);
    }
  }, [inView, motionVal, to]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      setDisplay(Math.round(v).toLocaleString());
    });
    return unsub;
  }, [spring]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
      {suffix}
    </motion.span>
  );
}

"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const DIST = 18;

function offsets(dir: Direction) {
  switch (dir) {
    case "up":
      return { x: 0, y: DIST };
    case "down":
      return { x: 0, y: -DIST };
    case "left":
      return { x: DIST, y: 0 };
    case "right":
      return { x: -DIST, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

/** Reveal child on scroll into view. Respects prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  duration = 0.6,
  direction = "up",
  once = true,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: Direction;
  once?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const off = reduce ? { x: 0, y: 0 } : offsets(direction);
  return (
    <motion.div
      initial={{ opacity: 0, ...off }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-60px 0px" }}
      transition={{ duration: reduce ? 0 : duration, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container — use with Item children to get sequenced reveal. */
export function Stagger({
  children,
  delay = 0,
  step = 0.08,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  step?: number;
  className?: string;
  once?: boolean;
}) {
  const variants: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: step, delayChildren: delay },
    },
  };
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px 0px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Item({
  children,
  direction = "up",
  className,
}: {
  children: ReactNode;
  direction?: Direction;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const off = reduce ? { x: 0, y: 0 } : offsets(direction);
  const variants: Variants = {
    hidden: { opacity: 0, ...off },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: reduce ? 0 : 0.55, ease: [0.2, 0.8, 0.2, 1] },
    },
  };
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

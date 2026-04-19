"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Premium page transition with direction-aware animation.
 * - Entering: content fades in + slides up slightly + subtle scale
 * - Uses key={pathname} to re-trigger on each navigation
 * - Avoids AnimatePresence mode="wait" which causes blank-page bugs in Next.js App Router
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Determine animation direction/style based on route depth
  const isDetail = pathname.startsWith("/listing/");
  const isSearch = pathname.startsWith("/search");

  return (
    <motion.div
      key={pathname}
      initial={{
        opacity: 0,
        y: isDetail ? 12 : 6,
        scale: isDetail ? 0.98 : 1,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: isDetail ? 0.4 : 0.3,
        ease: [0.2, 0.8, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

/** Fade + rise into view once. Respects prefers-reduced-motion. */
export function Reveal({
  delay = 0,
  y = 28,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    />
  );
}

/** Same as Reveal, rendered as a list item so it can sit directly inside ul/ol. */
export function RevealLi({
  delay = 0,
  y = 28,
  ...props
}: HTMLMotionProps<"li"> & { delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    />
  );
}

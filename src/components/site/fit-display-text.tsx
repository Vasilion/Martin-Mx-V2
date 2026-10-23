"use client";

import { useEffect } from "react";

const SELECTOR = ".display, .font-display";

/** True when a word in this element's own text wraps onto two lines (overflow-wrap rescued it mid-word). */
function hasSplitWord(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.parentElement?.closest(SELECTOR) !== el) continue;
    for (const m of (n.textContent ?? "").matchAll(/\S{2,}/g)) {
      range.setStart(n, m.index);
      range.setEnd(n, m.index + m[0].length);
      const tops = new Set([...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top)));
      if (tops.size > 1) return true;
    }
  }
  return false;
}

function fitAll() {
  for (const el of document.querySelectorAll<HTMLElement>(SELECTOR)) {
    el.style.removeProperty("font-size");
    if (el.closest("[aria-hidden=true]") || !el.getClientRects().length || !hasSplitWord(el)) continue;
    const base = parseFloat(getComputedStyle(el).fontSize);
    for (let scale = 0.94; scale > 0.45; scale -= 0.04) {
      el.style.fontSize = `${(base * scale).toFixed(1)}px`;
      if (!hasSplitWord(el)) break;
    }
  }
}

/**
 * Owners edit every heading, and phones with large text zoom can be ~250px wide. Sizes are tuned so the
 * default copy fits; this catches anything longer by shrinking a heading until no word splits mid-word.
 */
export function FitDisplayText() {
  useEffect(() => {
    let frame = 0;
    let width = window.innerWidth;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fitAll);
    };
    const onResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      schedule();
    };
    schedule();
    document.fonts?.ready.then(schedule);
    window.addEventListener("resize", onResize);
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, []);
  return null;
}

"use client";

import { useEffect } from "react";

/**
 * Tapping a section link whose #hash is already in the URL ("Waivers" after you've been to #waivers once)
 * changes nothing, so the browser and router don't scroll. Scroll to the section ourselves in that case.
 */
export function SameHashScroll() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href*='#']");
      if (!(a instanceof HTMLAnchorElement) || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash || url.hash !== location.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      // From the mobile menu, wait for the sheet to close and release its scroll lock first.
      const delay = a.closest("[role=dialog]") ? 350 : 0;
      setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), delay);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}

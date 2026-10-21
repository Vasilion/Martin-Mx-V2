"use client";

import { Toaster as Sonner } from "sonner";

/** Toasts sit above the phone tab bar and use the dashboard's light theme. */
export function Toaster() {
  return (
    <Sonner
      position="top-center"
      theme="light"
      richColors
      closeButton
      toastOptions={{ style: { fontFamily: "var(--font-archivo)", fontSize: "15px" } }}
    />
  );
}

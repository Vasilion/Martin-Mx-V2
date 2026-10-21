"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ActionState } from "@/app/admin/actions";

/** Local draft + dirty tracking + save, with a warning before leaving unsaved changes. */
export function useEditor<T>(initial: T, save: (value: T) => Promise<ActionState>) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(value) !== saved;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const onSave = () =>
    start(async () => {
      const res = await save(value);
      if (res.error) toast.error(res.error);
      else {
        setSaved(JSON.stringify(value));
        toast.success(res.message ?? "Saved.");
      }
    });

  const patch = (p: Partial<T>) => setValue((v) => ({ ...v, ...p }));
  return { value, setValue, patch, dirty, pending, onSave };
}

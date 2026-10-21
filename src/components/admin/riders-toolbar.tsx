"use client";

import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DayPicker({ value, options }: { value: string; options: { value: string; label: string }[] }) {
  const router = useRouter();
  return (
    <select
      aria-label="Ride day"
      value={value}
      onChange={(e) => router.push(`/admin/riders?date=${e.target.value}`)}
      className="h-11 w-full rounded-md border border-input bg-card px-3 text-base sm:w-56"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function PrintButton() {
  return (
    <Button variant="outline" className="h-11 flex-1 bg-card sm:flex-none" onClick={() => window.print()}>
      <Printer /> Print
    </Button>
  );
}

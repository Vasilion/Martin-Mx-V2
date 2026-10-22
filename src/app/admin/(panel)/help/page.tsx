import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Download, FileText, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { guides } from "@/lib/admin/guides";

export const metadata: Metadata = { title: "Help & guides" };

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/admin/more" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> All sections
      </Link>
      <header>
        <h1 className="text-3xl font-bold">Help &amp; guides</h1>
        <p className="mt-1 text-muted-foreground">Open on your phone or print them out.</p>
      </header>
      <ul className="space-y-3">
        {guides.map((g) => (
          <li key={g.file} className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
            <FileText className="size-8 shrink-0 text-brand" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{g.title}</p>
              <p className="text-sm text-muted-foreground">{g.desc}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="h-11 flex-1 sm:flex-none">
                <a href={`/admin/guides/${g.file}`} target="_blank" rel="noreferrer">
                  Open
                </a>
              </Button>
              <Button asChild variant="outline" className="h-11 bg-card" aria-label={`Download ${g.title}`}>
                <a href={`/admin/guides/${g.file}?download`}>
                  <Download />
                </a>
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <section className="flex gap-4 rounded-lg border bg-card p-4">
        <LifeBuoy className="size-6 shrink-0 text-brand" aria-hidden />
        <div>
          <p className="font-semibold">Need a hand?</p>
          <p className="text-sm text-muted-foreground">
            Your site is built and supported by Unyx Web Solutions. Email{" "}
            <a href="mailto:luke@unyxwebsolutions.com" className="font-semibold text-brand underline-offset-4 hover:underline">
              luke@unyxwebsolutions.com
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

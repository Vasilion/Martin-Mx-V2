import Link from "next/link";
import { getSuccessContent } from "@/lib/content/loader";

type PageProps = {
  searchParams: Promise<{ referenceId?: string }>;
};

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const [content, params] = await Promise.all([getSuccessContent(), searchParams]);

  return (
    <section className="space-y-4 text-white">
      <h1 className="text-3xl font-bold">{content.practiceTitle}</h1>
      <article className="rounded border border-zinc-700 bg-zinc-900 p-4 text-zinc-300">
        <p>{content.practiceDescription}</p>
        <p className="mt-3 text-sm text-zinc-400">
          Reference: {params.referenceId ?? "Will appear after signup callback"}
        </p>
      </article>
      <div className="flex flex-wrap gap-3">
        <Link href="/schedule" className="rounded bg-red-700 px-4 py-2 text-sm font-medium">
          View Schedule
        </Link>
        <Link href="/track-info" className="rounded bg-zinc-800 px-4 py-2 text-sm">
          Track Info
        </Link>
      </div>
    </section>
  );
}

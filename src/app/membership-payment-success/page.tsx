import Link from "next/link";
import { getSuccessContent } from "@/lib/content/loader";

type PageProps = {
  searchParams: Promise<{ referenceId?: string }>;
};

export default async function MembershipPaymentSuccessPage({ searchParams }: PageProps) {
  const [content, params] = await Promise.all([getSuccessContent(), searchParams]);

  return (
    <section className="space-y-4 text-white">
      <h1 className="text-3xl font-bold">{content.membershipTitle}</h1>
      <article className="rounded border border-zinc-700 bg-zinc-900 p-4 text-zinc-300">
        <p>{content.membershipDescription}</p>
        <p className="mt-3 text-sm text-zinc-400">
          Reference: {params.referenceId ?? "Will appear after signup callback"}
        </p>
      </article>
      <div className="flex flex-wrap gap-3">
        <Link href="/register" className="rounded bg-green-700 px-4 py-2 text-sm font-medium">
          Back to Registration
        </Link>
        <Link href="/contact" className="rounded bg-zinc-800 px-4 py-2 text-sm">
          Contact Support
        </Link>
      </div>
    </section>
  );
}

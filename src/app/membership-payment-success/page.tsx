import Link from "next/link";
import { getSuccessContent } from "@/lib/content/loader";

type PageProps = {
  searchParams: Promise<{ referenceId?: string }>;
};

export default async function MembershipPaymentSuccessPage({ searchParams }: PageProps) {
  const [content, params] = await Promise.all([getSuccessContent(), searchParams]);

  return (
    <section className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <h1 className="text-3xl font-bold md:text-4xl">{content.membershipTitle}</h1>
      </header>
      <article className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5 text-zinc-300 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
        <p>{content.membershipDescription}</p>
        <p className="mt-3 text-sm text-zinc-400">
          Reference: {params.referenceId ?? "Will appear after signup callback"}
        </p>
      </article>
      <div className="flex flex-wrap gap-3">
        <Link href="/register" className="rounded-xl bg-green-700 px-4 py-2 text-sm font-medium">
          Back to Registration
        </Link>
        <Link href="/contact" className="rounded-xl bg-zinc-800 px-4 py-2 text-sm">
          Contact Support
        </Link>
      </div>
    </section>
  );
}

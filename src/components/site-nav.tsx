import Link from "next/link";
import { getNavigationContent } from "@/lib/content/loader";

export async function SiteNav() {
  const navigation = await getNavigationContent();
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 text-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap gap-4 p-4 text-sm">
        {navigation.navLinks.map((item) => (
          <Link key={item.href} href={item.href} className="rounded px-2 py-1 hover:bg-zinc-800">
            {item.label}
          </Link>
        ))}
        <Link
          href="/admin"
          className="ml-auto rounded bg-red-700 px-3 py-1 font-medium hover:bg-red-600"
        >
          {navigation.cmsButtonLabel}
        </Link>
      </nav>
    </header>
  );
}

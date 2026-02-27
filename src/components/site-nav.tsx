import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/track-info", label: "Track Info" },
  { href: "/register", label: "Register" },
  { href: "/schedule", label: "Schedule" },
  { href: "/gallery", label: "Gallery" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/hiring", label: "Hiring" },
  { href: "/daily-signup", label: "Daily Signup" },
  { href: "/contact", label: "Contact" },
  { href: "/print", label: "Print List" },
];

export function SiteNav() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 text-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap gap-4 p-4 text-sm">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="rounded px-2 py-1 hover:bg-zinc-800">
            {item.label}
          </Link>
        ))}
        <Link
          href="/admin"
          className="ml-auto rounded bg-red-700 px-3 py-1 font-medium hover:bg-red-600"
        >
          CMS
        </Link>
      </nav>
    </header>
  );
}

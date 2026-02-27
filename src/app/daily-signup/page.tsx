import Image from "next/image";
import { FormSubmit } from "@/components/form-submit";
import { getTrackInfoContent } from "@/lib/content/loader";

export default async function DailySignupPage() {
  const trackInfo = await getTrackInfoContent();

  return (
    <section className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <h1 className="text-3xl font-bold md:text-4xl">Daily Signup</h1>
        <p className="mt-2 text-sm text-zinc-300 md:text-base">
          Same-day rider registration with direct waiver access and full confirmation email details.
        </p>
      </header>
      <article className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
        <p className="text-sm text-zinc-300">
          Use this form for day-of registration. A confirmation email will include all submitted rider details.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {trackInfo.waiverLinks.map((link) => (
            <a key={link.label} href={link.href} className="rounded-xl bg-zinc-800 px-3 py-2 text-sm">
              {link.label}
            </a>
          ))}
        </div>
      </article>
      <article className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/75 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
        <div className="relative aspect-[5/2] w-full bg-zinc-800">
          <Image
            src="/media/gallery/blog-2.jpg"
            alt="Daily signup track session visual"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </article>
      <FormSubmit
        formType="daily"
        fields={[
          { name: "riderFullName", label: "Rider Name" },
          { name: "riderEmail", label: "Email", type: "email" },
          { name: "riderPhone", label: "Phone" },
          { name: "riderAge", label: "Rider Age" },
          { name: "bikeClass", label: "Bike Class", type: "select", options: ["A/B", "C", "Mini", "Jr Track"] },
          { name: "bikeSize", label: "Bike Size", type: "select", options: ["50cc", "65cc", "85cc", "125cc", "250cc", "450cc"] },
          { name: "selectedDate", label: "Selected Date", type: "date" },
          { name: "waiverAcknowledgement", label: "Waiver Acknowledgement", type: "checkbox" },
        ]}
      />
    </section>
  );
}

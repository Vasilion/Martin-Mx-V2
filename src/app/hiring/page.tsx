import Image from "next/image";
import { FormSubmit } from "@/components/form-submit";

export default function HiringPage() {
  return (
    <section className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <h1 className="text-3xl font-bold md:text-4xl">Hiring</h1>
        <p className="mt-2 text-sm text-zinc-300 md:text-base">
          Join the Martin MX team. Tell us about your background and preferred role at the track.
        </p>
      </header>
      <article className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/75 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
        <div className="relative aspect-[5/2] w-full bg-zinc-800">
          <Image
            src="/media/gallery/blog-1.jpg"
            alt="Martin MX team and operations visual"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </article>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { role: "Track Crew", detail: "Prep and maintain riding surfaces through operating windows." },
          { role: "Gate + Check-In", detail: "Support rider flow, waivers, and registration accuracy." },
          { role: "Event Support", detail: "Help with race-day setup, transitions, and guest service." },
        ].map((item) => (
          <article
            key={item.role}
            className="rounded-2xl border border-white/10 bg-zinc-900/75 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.3)]"
          >
            <h2 className="text-base font-semibold">{item.role}</h2>
            <p className="mt-2 text-sm text-zinc-300">{item.detail}</p>
          </article>
        ))}
      </section>
      <FormSubmit
        formType="hiring"
        fields={[
          { name: "fullName", label: "Full Name" },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone" },
          { name: "preferredPosition", label: "Preferred Position" },
          { name: "availability", label: "Availability" },
          { name: "experienceSummary", label: "Experience Summary", type: "textarea" },
        ]}
      />
    </section>
  );
}

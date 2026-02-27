import Image from "next/image";
import Link from "next/link";
import { FormSubmit } from "@/components/form-submit";
import {
  getAnnouncements,
  getOperationsContent,
  getPricingConfig,
  getSiteSettings,
} from "@/lib/content/loader";

type RegisterPageProps = {
  searchParams?: Promise<{
    tab?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const [settings, pricing, operations, rawAnnouncements] = await Promise.all([
    getSiteSettings(),
    getPricingConfig(),
    getOperationsContent(),
    getAnnouncements(),
  ]);
  const params = (await searchParams) ?? {};
  const activeTab = params.tab === "membership" ? "membership" : "practice";
  const announcements = rawAnnouncements.filter((item) => item.active);

  return (
    <section className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <h1 className="text-3xl font-bold md:text-4xl">Register</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-300 md:text-base">
          Complete practice or membership signups below. All submission details are emailed to riders with a
          reference ID for support and verification.
        </p>
      </header>
      {announcements.length > 0 ? (
        <div className="space-y-2">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className={`rounded border p-3 text-sm ${
                announcement.severity === "warning"
                  ? "border-amber-700 bg-amber-900/20 text-amber-100"
                  : announcement.severity === "success"
                    ? "border-green-700 bg-green-900/20 text-green-100"
                    : "border-zinc-700 bg-zinc-900 text-zinc-200"
              }`}
            >
              <p className="font-semibold">{announcement.title}</p>
              <p className="mt-1">{announcement.message}</p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { title: "Fast Check-In", text: "Pre-register online so gate operations stay smooth on ride day." },
          { title: "Verified Details", text: "Every submission sends full rider details and a reference ID." },
        ].map((item) => (
          <article
            key={item.title}
            className="mx-card-interactive rounded-2xl border border-white/10 bg-zinc-900/75 p-4 text-white shadow-[0_14px_40px_rgba(0,0,0,0.3)]"
          >
            <h2 className="text-base font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-zinc-300">{item.text}</p>
          </article>
        ))}
      </div>

      <section className="rounded-3xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-700 pb-4">
          <h2 className="text-xl font-semibold">Register To Ride</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/register?tab=practice#practice-signup"
              className={`rounded px-4 py-2 text-sm font-semibold uppercase tracking-wide ${
                activeTab === "practice"
                  ? "bg-green-700 text-white"
                  : "border border-zinc-600 bg-zinc-800 text-zinc-200"
              }`}
            >
              Register For Practice
            </Link>
            <Link
              href="/register?tab=membership#membership-signup"
              className={`rounded px-4 py-2 text-sm font-semibold uppercase tracking-wide ${
                activeTab === "membership"
                  ? "bg-green-700 text-white"
                  : "border border-zinc-600 bg-zinc-800 text-zinc-200"
              }`}
            >
              Unlimited Membership
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <article className="mx-card-interactive overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/75 shadow-[0_14px_40px_rgba(0,0,0,0.3)]">
            <div className="relative aspect-[16/10] w-full bg-zinc-800 md:aspect-[16/9]">
              <Image
                src={activeTab === "practice" ? "/media/gallery/strapi-main-3.jpg" : "/media/gallery/strapi-youth-3.jpg"}
                alt={activeTab === "practice" ? "Practice registration visual" : "Membership registration visual"}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
          </article>
          <article className="mx-card-interactive rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Current Section</p>
            <p className="mt-2 text-2xl font-bold">{activeTab === "practice" ? "Practice Registration" : "Unlimited Membership"}</p>
            <p className="mt-3 text-sm text-zinc-300">
              {activeTab === "practice"
                ? settings.practiceOpen && !settings.practiceCancelled
                  ? operations.practiceStatusLabel
                  : "Online Registration is unavailable at this time."
                : settings.membershipOpen
                  ? operations.membershipStatusLabel
                  : "Member Registration is unavailable at this time."}
            </p>
          </article>
        </div>
      </section>

      {activeTab === "practice" ? (
        <article
          id="practice-signup"
          className="mx-card-interactive rounded-3xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur"
        >
          <h2 className="text-xl font-semibold">Practice Signup</h2>
          <p className="mb-4 mt-2 text-sm text-zinc-300">
            {settings.practiceOpen && !settings.practiceCancelled
              ? operations.practiceStatusLabel
              : "Online Registration is unavailable at this time."}
          </p>
          {operations.practiceCashOnly ? (
            <p className="mb-4 text-sm text-amber-300">Cash-only mode is active for this practice window.</p>
          ) : null}
          {settings.practiceCancelled ? (
            <p className="mb-4 text-sm text-red-300">Cancellation notice: {settings.practiceCancelReason}</p>
          ) : null}
          {operations.practiceSessions.length > 0 ? (
            <div className="mb-4 space-y-2 rounded border border-zinc-700 bg-zinc-950 p-3 text-xs text-zinc-300">
              {operations.practiceSessions.map((session) => (
                <p key={session.label}>
                  {session.label}: {session.date} {session.startTime}-{session.endTime}
                </p>
              ))}
            </div>
          ) : null}
          <FormSubmit
            formType="practice"
            disabled={!settings.practiceOpen || settings.practiceCancelled}
            successRedirectPath="/payment-success"
            fields={[
              { name: "riderFullName", label: "Rider Name" },
              { name: "riderEmail", label: "Email", type: "email" },
              { name: "riderPhone", label: "Phone" },
              { name: "riderAge", label: "Rider Age" },
              {
                name: "bikeClass",
                label: "Bike Class",
                type: "select",
                options: pricing.bikeClasses,
              },
              {
                name: "bikeSize",
                label: "Bike Size",
                type: "select",
                options: pricing.bikeSizes,
              },
              { name: "selectedDate", label: "Practice Date", type: "date" },
              {
                name: "selectedSessionOrTimeWindow",
                label: "Session",
                type: "select",
                options: operations.practiceSessions.map((s) => s.label),
              },
              { name: "trackType", label: "Track Type", type: "select", options: ["Main", "Junior"] },
              {
                name: "priceShownAtCheckout",
                label: "Price",
                type: "number",
                defaultValue: pricing.practicePrice,
              },
              { name: "paymentStatus", label: "Payment Status", type: "select", options: ["pending", "paid"] },
            ]}
          />
        </article>
      ) : (
        <article
          id="membership-signup"
          className="mx-card-interactive rounded-3xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur"
        >
          <h2 className="text-xl font-semibold">Membership Signup</h2>
          <p className="mb-4 mt-2 text-sm text-zinc-300">
            {settings.membershipOpen ? operations.membershipStatusLabel : "Member Registration is unavailable at this time."}
          </p>
          <p className="mb-4 text-sm text-zinc-400">{operations.membershipCtaLabel}</p>
          <FormSubmit
            formType="membership"
            disabled={!settings.membershipOpen}
            successRedirectPath="/membership-payment-success"
            fields={[
              { name: "riderFullName", label: "Rider Name" },
              { name: "riderEmail", label: "Email", type: "email" },
              { name: "riderPhone", label: "Phone" },
              { name: "riderAge", label: "Rider Age" },
              { name: "bikeClass", label: "Bike Class", type: "select", options: pricing.bikeClasses },
              { name: "bikeSize", label: "Bike Size", type: "select", options: pricing.bikeSizes },
              { name: "membershipType", label: "Membership Type", type: "select", options: ["Unlimited"] },
              { name: "membershipPrice", label: "Membership Price", type: "number", defaultValue: pricing.membershipPrice },
              { name: "paymentStatus", label: "Payment Status", type: "select", options: ["pending", "paid"] },
            ]}
          />
        </article>
      )}
    </section>
  );
}

import { FormSubmit } from "@/components/form-submit";
import {
  getAnnouncements,
  getOperationsContent,
  getPricingConfig,
  getSiteSettings,
} from "@/lib/content/loader";

export default async function RegisterPage() {
  const [settings, pricing, operations, rawAnnouncements] = await Promise.all([
    getSiteSettings(),
    getPricingConfig(),
    getOperationsContent(),
    getAnnouncements(),
  ]);
  const announcements = rawAnnouncements.filter((item) => item.active);

  return (
    <section className="space-y-6 text-white">
      <h1 className="text-3xl font-bold">Register</h1>
      {announcements.length > 0 ? (
        <div className="space-y-2">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className={`rounded border p-3 text-sm ${
                announcement.severity === "warning"
                  ? "border-amber-700 bg-amber-900/20 text-amber-100"
                  : announcement.severity === "success"
                    ? "border-emerald-700 bg-emerald-900/20 text-emerald-100"
                    : "border-zinc-700 bg-zinc-900 text-zinc-200"
              }`}
            >
              <p className="font-semibold">{announcement.title}</p>
              <p className="mt-1">{announcement.message}</p>
            </article>
          ))}
        </div>
      ) : null}
      <div className="grid gap-6 md:grid-cols-2">
        <article id="practice-signup" className="rounded border border-zinc-700 bg-zinc-900 p-4">
          <h2 className="text-xl font-semibold">Practice Signup</h2>
          <p className="mb-4 mt-2 text-sm text-zinc-300">
            {settings.practiceOpen ? operations.practiceStatusLabel : "Practice is currently closed."}
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
        <article id="membership-signup" className="rounded border border-zinc-700 bg-zinc-900 p-4">
          <h2 className="text-xl font-semibold">Membership Signup</h2>
          <p className="mb-4 mt-2 text-sm text-zinc-300">
            {settings.membershipOpen ? operations.membershipStatusLabel : "Membership is currently closed."}
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
      </div>
    </section>
  );
}

export default function PaymentSuccessPage() {
  return (
    <section className="space-y-4 text-white">
      <h1 className="text-3xl font-bold">Payment Success</h1>
      <p className="rounded border border-zinc-700 bg-zinc-900 p-4 text-zinc-300">
        Payment verification and signup completion are handled server-side with idempotency protection.
      </p>
    </section>
  );
}

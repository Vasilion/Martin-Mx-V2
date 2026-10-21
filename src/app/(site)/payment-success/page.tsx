import { redirect } from "next/navigation";

// Old Stripe Payment Link return URL. Payments now confirm at /register/confirmed.
export default function LegacySuccessPage() {
  redirect("/register");
}

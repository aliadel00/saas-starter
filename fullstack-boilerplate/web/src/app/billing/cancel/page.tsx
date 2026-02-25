import { redirect } from "next/navigation";

export default function BillingCancelRedirectPage() {
  redirect("/billing?checkout=cancel");
}

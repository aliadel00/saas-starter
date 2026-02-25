import { redirect } from "next/navigation";

export default function BillingSuccessRedirectPage() {
  redirect("/billing?checkout=success");
}

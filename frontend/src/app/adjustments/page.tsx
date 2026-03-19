import { AppShell } from "@/components/app-shell";
import { RouteBAdjustments } from "@/components/route-b-adjustments";

export const dynamic = "force-dynamic";

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdjustmentsPage(props: PageProps<"/adjustments">) {
  const searchParams = await props.searchParams;
  const paymentId = firstSearchValue(searchParams.paymentId) ?? "";

  return (
    <AppShell
      active="adjustments"
      eyebrow="Payment adjustments"
      title="Create and review settlement corrections"
      description="The adjustment surface stays lightweight and app-first while preserving the existing BFF flow."
    >
      <RouteBAdjustments initialPaymentId={paymentId} />
    </AppShell>
  );
}

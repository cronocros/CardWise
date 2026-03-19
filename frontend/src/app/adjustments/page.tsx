import { AppShell } from "@/components/app-shell";
import { AdjustmentsClient } from "@/components/adjustments-client";

export const dynamic = "force-dynamic";

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdjustmentsPage(props: PageProps<"/adjustments">) {
  const searchParams = await props.searchParams;
  const paymentId = firstSearchValue(searchParams.paymentId) ?? "1";

  return (
    <AppShell
      active="adjustments"
      eyebrow="Payment adjustments"
      title="Create and review settlement corrections"
      description="Use the BFF proxy to create FX corrections, billing discounts, and other amount adjustments tied to a payment record."
    >
      <AdjustmentsClient initialPaymentId={paymentId} />
    </AppShell>
  );
}

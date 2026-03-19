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
      theme="minimal"
      eyebrow="결제 조정"
      title="정산 정정 내역을 만들고 검토하는 화면"
      description="조정 화면은 로즈 미니멀 톤으로 분리해 기존 BFF 흐름을 유지하면서도 앱 안에서 가볍게 입력하고 검토할 수 있도록 정리했습니다."
    >
      <RouteBAdjustments initialPaymentId={paymentId} />
    </AppShell>
  );
}

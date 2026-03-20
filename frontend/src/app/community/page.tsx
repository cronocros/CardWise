'use client';

import { AppShell } from "@/components/app-shell";
import { CommunityView } from "@/components/mobile/community";

export default function CommunityPage() {
  return (
    <AppShell
      active="community"
      eyebrow="F9 · 카드와이즈 커뮤니티"
      title="정보 공유 및 소통"
      description="다양한 카드 꿀팁과 절약 노하우를 커뮤니티에서 확인해보세요."
    >
      <CommunityView />
    </AppShell>
  );
}

# CardWise - Feature Implementation Matrix

> 마지막 업데이트: 2026-03-20
> 기준 브랜치: `codex/integration-phase1`

## 구현 상태 범례

| 기호 | 의미 |
|------|------|
| ✅ DONE | 구현 완료 (API + 프론트 화면 모두 있음) |
| 🔶 PARTIAL | 핵심 기능 구현됐으나 일부 엣지케이스/화면 미완 |
| ❌ TODO | 미구현 또는 placeholder 상태 |

---

## Phase 1 기능 구현 현황

### AUTH - 회원가입/로그인

| 기능 | 상태 | 비고 |
|------|------|------|
| 이메일/비밀번호 회원가입 | ❌ TODO | SecurityConfig에서 모든 요청 permitAll 상태 (미실장) |
| 소셜 로그인 (Google/Kakao) | ❌ TODO | 설계만 존재 |
| JWT 발급/갱신/검증 | ❌ TODO | `RequestAccountIdResolver`가 하드코딩 fallback accountId 사용 중 |
| 로그인 화면 (`/login`) | 🔶 PARTIAL | 페이지 파일 존재하나 Supabase Auth 연동 미완 |

---

### F1 - 카드 관리

| 기능 | 상태 | 비고 |
|------|------|------|
| 카드 목록 조회 | ✅ DONE | `/cards` 페이지 및 API 완성 |
| 카드 등록 (신규) | ❌ TODO | UI만 존재, 백엔드 CRUD 미구현 |
| 카드 별칭/발급일 수정 | ❌ TODO | 미구현 |
| 카드 삭제 | ❌ TODO | 미구현 |
| 카드 상세 (연간 실적 등) | 🔶 PARTIAL | `/performance/[userCardId]`에서 조회 가능 |

---

### F2 - 가계부 수동 입력

| 기능 | 상태 | 비고 |
|------|------|------|
| 결제 목록 조회 | ✅ DONE | `/ledger` 페이지 완성 |
| 결제 수동 입력 | 🔶 PARTIAL | UI 존재, 백엔드 저장 흐름은 있으나 card_benefit 연동 자동추천 미완 |
| 결제 수정 / 삭제 | 🔶 PARTIAL | API 있음, 프론트 UI 미완성 부분 있음 |
| 품목(PaymentItem) 관리 | 🔶 PARTIAL | 저장은 되나 카테고리/혜택매칭 자동화 미완 |
| 태그 부착 | 🔶 PARTIAL | 태그 입력 및 저장 가능, 자동완성 부분 확인 필요 |
| 해외결제 (FX) | 🔶 PARTIAL | 환율 입력 UI는 있으나 인박스 연동 미완 |
| 그룹 가계부 입력 (`group_id`) | ✅ DONE | 그룹 결제 생성 API 및 UI 완성 (F12 연동) |

---

### F3 - 가계부 인박스

| 기능 | 상태 | 비고 |
|------|------|------|
| 인박스 목록 조회 | ✅ DONE | `/inbox` 페이지 및 pending_action API 완성 |
| 항목 확인(RESOLVED) / 무시(DISMISSED) | ✅ DONE | API 완성 |
| 인박스 카운트 배지 | ✅ DONE | `app-shell.tsx`에서 unread count 배지 표시 |
| 결제 보정 (payment_adjustment) | ✅ DONE | `/adjustments` 페이지 완성 |

---

### F4 - 연간/월간 실적 관리

| 기능 | 상태 | 비고 |
|------|------|------|
| 카드별 실적 조회 | ✅ DONE | `/performance/[userCardId]` 화면 및 API 완성 |
| 연간 실적 계산 (발급일 기준) | ✅ DONE | 실적 구간, 누적, 다음 티어 계산 완성 |
| 월별 실적 추이 | ✅ DONE | monthly breakdown 포함 |
| 바우처 해금 조건 | ✅ DONE | voucherUnlocks 반환 |
| 유예기간(Grace Period) | ✅ DONE | gracePeriod 반환 |
| 실적 구간 변경 이벤트 | 🔶 PARTIAL | PerformanceTierChangedEvent 설계 존재, 발행 로직은 구현되어야 함 |

---

### F5 - 혜택 검색

| 기능 | 상태 | 비고 |
|------|------|------|
| 가맹점/카테고리 혜택 검색 | ✅ DONE | `/benefits` 검색 화면 및 API 완성 |
| 내 카드 기준 최적 추천 | ✅ DONE | `/api/v1/benefits/recommend` 완성 |
| 카드별 혜택 상세 | ✅ DONE | `/benefits/cards/[cardId]` 완성 |
| 캐시 최적화 | 🔶 PARTIAL | Redis 캐시 설계 있으나 로컬 dev에서만 검증됨 |

---

### F6 - 바우처 관리

| 기능 | 상태 | 비고 |
|------|------|------|
| 바우처 목록 (활성/만료임박) | ✅ DONE | `/vouchers` 화면 및 API 완성 |
| 바우처 사용/취소 처리 | ✅ DONE | API 완성 |
| 바우처 이력(log) 조회 | ✅ DONE | API 완성 |
| 만료 알림 스케줄러 | ❌ TODO | 스케줄러 로직 미구현 |

---

### F7 - 알림

| 기능 | 상태 | 비고 |
|------|------|------|
| 알림 목록 조회 | ✅ DONE | `/notifications` 페이지 및 API 완성 |
| 알림 읽음 처리 (단건/전체) | ✅ DONE | API 완성 |
| 알림 미읽음 카운트 배지 | ✅ DONE | `notification-badge.tsx` 완성 |
| 알림 설정 (사용자별 on/off) | ✅ DONE | 그룹 알림 포함 전체 설정 UI 및 API 완성 |
| **그룹 초대 알림** | ✅ DONE | `NotificationEventHandler.handleGroupInvitation` 구현 완성 |
| **그룹 결제 알림** | ✅ DONE | `GroupService.createGroupPayment`에서 직접 발행 |
| **멤버 제외/소유권 양도 알림** | ✅ DONE | `GroupService` + EventHandler 이중 경로 |
| 바우처 만료 알림 스케줄러 | ❌ TODO | 미구현 |
| 실적 리마인더 스케줄러 | ❌ TODO | 미구현 |
| 그룹 활동 알림 설정 `group_activity_alert` DB 컬럼 | 🔶 PARTIAL | 마이그레이션 파일 작성됨, 원격 DB 적용 대기 |

---

### F8 - 대시보드

| 기능 | 상태 | 비고 |
|------|------|------|
| 월간 요약 (총 지출/혜택) | ✅ DONE | `/dashboard` 완성 |
| 카드별 사용 현황 | ✅ DONE | 완성 |
| 카테고리 분포 | ✅ DONE | 완성 |
| 태그 별 통계 | ✅ DONE | `/dashboard/tags` 완성 |
| 태그 교차 분석 | ✅ DONE | `/dashboard/tags/cross` 완성 |
| 그룹 대시보드 전환 | 🔶 PARTIAL | `?groupId=` 쿼리 동작은 되나 그룹 카테고리 심화 시각화 미완 |

---

### F12 - 그룹 가계부

| 기능 | 상태 | 비고 |
|------|------|------|
| 그룹 생성 | ✅ DONE | 완성 |
| 그룹 목록 조회 | ✅ DONE | `/groups` 완성 |
| 그룹 상세 조회 | ✅ DONE | `/groups/[groupId]` 완성 |
| 그룹 수정 | ✅ DONE | API + 설정 페이지 완성 |
| 그룹 삭제 (소프트) | ✅ DONE | API 완성 |
| 멤버 초대 (이메일) | ✅ DONE | `/groups/[groupId]/invite` 완성 |
| 초대 수락/거절 | ✅ DONE | `/groups/invitations` 페이지 완성 |
| 초대 취소 (OWNER) | ✅ DONE | API 완성 |
| 그룹 결제 목록 조회 | ✅ DONE | `/groups/[groupId]/payments` 완성 |
| 그룹 결제 입력 | ✅ DONE | API 및 UI 완성 |
| 그룹 결제 수정 | ✅ DONE | API 완성 |
| 그룹 결제 삭제 | ✅ DONE | API 완성 |
| 멤버 추방 (OWNER) | ✅ DONE | API 완성 |
| 그룹 탈퇴 (MEMBER) | ✅ DONE | API 완성 |
| 소유권 양도 | ✅ DONE | API 완성 |
| 그룹 통계 | ✅ DONE | `/groups/[groupId]/stats` 완성 |
| 그룹 태그 조회/생성 | ✅ DONE | API 완성 |

---

## 전체 구현 요약

| 기능명 | 완료율 |
|-------|--------|
| AUTH | 10% (설계만 완성, 실구현 ❌) |
| F1 카드 관리 | 40% (조회 완성, CRUD 미완) |
| F2 가계부 수동 입력 | 70% |
| F3 인박스 | 95% |
| F4 실적 관리 | 90% |
| F5 혜택 검색 | 95% |
| F6 바우처 관리 | 85% |
| F7 알림 | 80% (스케줄러 미완) |
| F8 대시보드 | 90% |
| F12 그룹 가계부 | 95% |

---

## 중요 미완성 항목 (Next Priority)

1. **AUTH 실구현** — 가장 큰 보안 갭. `SecurityConfig` 모든 허용 상태
2. **F6/F7 스케줄러** — 바우처 만료 알림, 실적 리마인더 Daily 배치 미구현
3. **F1 카드 CRUD** — 카드 등록/수정/삭제 API 미구현
4. **원격 DB 마이그레이션** — `20260320100000_add_group_notification_settings.sql` 아직 미적용
5. **Redis 실장 확인** — Rate Limiting, 캐시 무효화 로직 운영환경 검증 필요

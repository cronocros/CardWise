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

## AUTH - 회원가입/로그인

| 기능 코드 | 기능 | 상태 | 비고 |
|-----------|------|------|------|
| AUTH-01 | 이메일/비밀번호 회원가입 | ✅ DONE | `/login` 가입 폼 + Supabase signUp 연동 |
| AUTH-02 | 이메일/비밀번호 로그인 | ✅ DONE | Supabase signInWithPassword 연동 |
| AUTH-03 | 소셜 로그인 (Google/Kakao) | ❌ TODO | 설계만 존재 |
| AUTH-04 | JWT 발급/갱신/검증 | ✅ DONE | `RequestAccountIdResolver` JWT `sub` 추출, Spring Security 연동 |
| AUTH-05 | 미들웨어 인증 (미로그인 리디렉션) | ✅ DONE | `middleware.ts` Supabase session 검증 |
| AUTH-06 | 백엔드 JWT 전달 | ✅ DONE | `backend-proxy.ts` Authorization + X-Account-Id 자동 주입 |

---

## F1 - 카드 관리

| 기능 코드 | 기능 | 상태 | 비고 |
|-----------|------|------|------|
| F1-01 | 카드 목록 조회 | ✅ DONE | `/cards` 페이지 및 API 완성 |
| F1-02 | 카드 등록 (신규) | ✅ DONE | 백엔드 CRUD + 바우처 인스턴스 초기화, `/cards/register` 완성 |
| F1-03 | 카드 별칭/발급일 수정 | ✅ DONE | API 완성 (프론트 연결 진행 대기) |
| F1-04 | 카드 삭제 | ✅ DONE | 소프트 삭제 API 완성 (프론트 연결 진행 대기) |
| F1-05 | 카드 상세 (연간 실적 등) | 🔶 PARTIAL | `/performance/[userCardId]`에서 조회 가능 |

---

## F2 - 가계부 수동 입력

| 기능 코드 | 기능 | 상태 | 비고 |
|-----------|------|------|------|
| F2-01 | 결제 목록 조회 | ✅ DONE | `/ledger` 페이지 완성 |
| F2-02 | 결제 수동 입력 | 🔶 PARTIAL | UI 존재, 백엔드 저장 흐름은 있으나 card_benefit 연동 자동추천 미완 |
| F2-03 | 결제 수정 / 삭제 | 🔶 PARTIAL | API 있음, 프론트 UI 미완성 부분 있음 |
| F2-04 | 품목(PaymentItem) 관리 | 🔶 PARTIAL | 저장은 되나 카테고리/혜택매칭 자동화 미완 |
| F2-05 | 태그 부착 | 🔶 PARTIAL | 태그 입력 및 저장 가능, 자동완성 부분 확인 필요 |
| F2-06 | 해외결제 (FX) | 🔶 PARTIAL | 환율 입력 UI는 있으나 인박스 연동 미완 |
| F2-07 | 그룹 가계부 입력 (`group_id`) | ✅ DONE | 그룹 결제 생성 API 및 UI 완성 (F12 연동) |

---

## F3 - 가계부 인박스

| 기능 코드 | 기능 | 상태 | 비고 |
|-----------|------|------|------|
| F3-01 | 인박스 목록 조회 | ✅ DONE | `/inbox` 페이지 및 pending_action API 완성 |
| F3-02 | 항목 확인(RESOLVED) / 무시(DISMISSED) | ✅ DONE | API 완성 |
| F3-03 | 인박스 카운트 배지 | ✅ DONE | `app-shell.tsx`에서 unread count 배지 표시 |
| F3-04 | 결제 보정 (payment_adjustment) | ✅ DONE | `/adjustments` 페이지 완성 |

---

## F4 - 연간/월간 실적 관리

| 기능 코드 | 기능 | 상태 | 비고 |
|-----------|------|------|------|
| F4-01 | 카드별 실적 조회 | ✅ DONE | `/performance/[userCardId]` 화면 및 API 완성 |
| F4-02 | 연간 실적 계산 (발급일 기준) | ✅ DONE | 실적 구간, 누적, 다음 티어 계산 완성 |
| F4-03 | 월별 실적 추이 | ✅ DONE | monthly breakdown 포함 |
| F4-04 | 바우처 해금 조건 | ✅ DONE | voucherUnlocks 반환 |
| F4-05 | 유예기간(Grace Period) | ✅ DONE | gracePeriod 반환 |
| F4-06 | 실적 구간 변경 이벤트 | 🔶 PARTIAL | PerformanceTierChangedEvent 설계 존재, 발행 로직은 구현되어야 함 |

---

## F5 - 혜택 검색

| 기능 코드 | 기능 | 상태 | 비고 |
|-----------|------|------|------|
| F5-01 | 가맹점/카테고리 혜택 검색 | ✅ DONE | `/benefits` 검색 화면 및 API 완성 |
| F5-02 | 내 카드 기준 최적 추천 | ✅ DONE | `/api/v1/benefits/recommend` 완성 |
| F5-03 | 카드별 혜택 상세 | ✅ DONE | `/benefits/cards/[cardId]` 완성 |
| F5-04 | 캐시 최적화 | 🔶 PARTIAL | Redis 캐시 설계 있으나 로컬 dev에서만 검증됨 |

---

## F6 - 바우처 관리

| 기능 코드 | 기능 | 상태 | 비고 |
|-----------|------|------|------|
| F6-01 | 바우처 목록 (활성/만료임박) | ✅ DONE | `/vouchers` 화면 및 API 완성 |
| F6-02 | 바우처 사용/취소 처리 | ✅ DONE | API 완성 |
| F6-03 | 바우처 이력(log) 조회 | ✅ DONE | API 완성 |
| F6-04 | 만료 알림 스케줄러 | ✅ DONE | `NotificationScheduler` (매일 09:00, D-7/3/1) 구현 완료 |

---

## F7 - 알림

| 기능 코드 | 기능 | 상태 | 비고 |
|-----------|------|------|------|
| F7-01 | 알림 목록 조회 | ✅ DONE | `/notifications` 페이지 및 API 완성 |
| F7-02 | 알림 읽음 처리 (단건/전체) | ✅ DONE | API 완성 |
| F7-03 | 알림 미읽음 카운트 배지 | ✅ DONE | `notification-badge.tsx` 완성 |
| F7-04 | 알림 설정 (사용자별 on/off) | ✅ DONE | 그룹 알림 포함 전체 설정 UI 및 API 완성 |
| F7-05 | 그룹 초대 알림 | ✅ DONE | `NotificationEventHandler.handleGroupInvitation` 구현 완성 |
| F7-06 | 그룹 결제 알림 | ✅ DONE | `GroupService.createGroupPayment`에서 직접 발행 |
| F7-07 | 멤버 제외/소유권 양도 알림 | ✅ DONE | `GroupService` + EventHandler 이중 경로 |
| F7-08 | 바우처 만료 알림 스케줄러 | ✅ DONE | `NotificationScheduler.sendVoucherExpiryAlerts` 구현 완성 |
| F7-09 | 실적 리마인더 스케줄러 | ✅ DONE | `NotificationScheduler.sendPerformanceReminders` 구현 완성 |
| F7-10 | 그룹 알림 설정 DB 컬럼 | ✅ DONE | `group_invite_alert`, `group_activity_alert` 컬럼 원격 DB 적용 완료 |

---

## F8 - 대시보드

> ⚠️ **주의**: `/dashboard` 라우트는 **사용자 소비 대시보드 (F8)** 입니다.  
> 개발자 OPS 모니터링 도구는 `/ops/live` 에 별도 분리되어 있습니다.

| 기능 코드 | 기능 | 상태 | 비고 |
|-----------|------|------|------|
| F8-01 | 월간 요약 (총 지출/혜택/건수) | ✅ DONE | `/dashboard` 완성 |
| F8-02 | 카드별 사용 현황 | ✅ DONE | 완성 |
| F8-03 | 카테고리 분포 | ✅ DONE | 완성 |
| F8-04 | 6개월 추이 그래프 | ✅ DONE | 완성 |
| F8-05 | 태그 별 통계 | ✅ DONE | `/dashboard/tags` 완성 |
| F8-06 | 태그 교차 분석 | ✅ DONE | `/dashboard/tags/cross` 완성 |
| F8-07 | 그룹 대시보드 전환 | 🔶 PARTIAL | `?groupId=` 쿼리 동작은 되나 그룹 카테고리 심화 시각화 미완 |

---

## F12 - 그룹 가계부

| 기능 코드 | 기능 | 상태 | 비고 |
|-----------|------|------|------|
| F12-01 | 그룹 생성 | ✅ DONE | 완성 |
| F12-02 | 그룹 목록 조회 | ✅ DONE | `/groups` 완성 |
| F12-03 | 그룹 상세 조회 | ✅ DONE | `/groups/[groupId]` 완성 |
| F12-04 | 그룹 수정 | ✅ DONE | API + 설정 페이지 완성 |
| F12-05 | 그룹 삭제 (소프트) | ✅ DONE | API 완성 |
| F12-06 | 멤버 초대 (이메일) | ✅ DONE | `/groups/[groupId]/invite` 완성 |
| F12-07 | 초대 수락/거절 | ✅ DONE | `/groups/invitations` 페이지 완성 |
| F12-08 | 초대 취소 (OWNER) | ✅ DONE | API 완성 |
| F12-09 | 그룹 결제 목록 조회 | ✅ DONE | `/groups/[groupId]/payments` 완성 |
| F12-10 | 그룹 결제 입력 | ✅ DONE | API 및 UI 완성 |
| F12-11 | 그룹 결제 수정 | ✅ DONE | API 완성 |
| F12-12 | 그룹 결제 삭제 | ✅ DONE | API 완성 |
| F12-13 | 멤버 추방 (OWNER) | ✅ DONE | API 완성 |
| F12-14 | 그룹 탈퇴 (MEMBER) | ✅ DONE | API 완성 |
| F12-15 | 소유권 양도 | ✅ DONE | API 완성 |
| F12-16 | 그룹 통계 | ✅ DONE | `/groups/[groupId]/stats` 완성 |
| F12-17 | 그룹 태그 조회/생성 | ✅ DONE | API 완성 |

---

## OPS - 개발자 도구 (제품 기능 아님)

> ⚠️ **이 항목은 CardWise 제품 기능이 아닙니다.**  
> 개발자가 AI 에이전트 동작 상태를 확인하고 Human-in-the-Loop 항목을 검토하는 **내부 모니터링 도구**입니다.

| 기능 코드 | 기능 | 경로 | 비고 |
|-----------|------|------|------|
| OPS-01 | AI 에이전트 라이브 모니터링 | `/ops/live` | Receipt Parser, Categorizer, Benefit Matcher 에이전트 상태 |
| OPS-02 | Human-in-the-Loop 대기 큐 | `/ops/live` | pending_action 실시간 확인 |

---

## 전체 구현 요약

| 기능명 | 완료율 |
|-------|--------|
| AUTH | 95% (로그인/가입/JWT 연동 완성, 소셜 로그인 미구현) |
| F1 카드 관리 | 90% |
| F2 가계부 수동 입력 | 70% |
| F3 인박스 | 95% |
| F4 실적 관리 | 90% |
| F5 혜택 검색 | 95% |
| F6 바우처 관리 | 95% |
| F7 알림 | 97% (그룹 알림 DB 컬럼 적용 완료) |
| F8 대시보드 | 95% |
| F12 그룹 가계부 | 95% |

---

## 중요 미완성 항목 (Next Priority)

1. **AUTH 소셜 로그인** — Google/Kakao OAuth 설계 구현
2. **Vercel + Cloud Run 배포** — 환경 변수 세팅 및 CI/CD 파이프라인
3. **Redis 기능 검증** — 스로틀링, 캐시 무효화가 클라우드 환경에서 정상 작동하는지 확인
4. **F2 card_benefit 자동매칭** — 결제 입력 시 혜택 자동 연결 구현

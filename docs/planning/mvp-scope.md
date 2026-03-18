# CardWise — MVP 범위 & 구현 우선순위

> Phase 0 설계를 기반으로 실제 구현 시 무엇을 먼저 할지, 무엇이 과도한 설계(오버엔지니어링)인지 정리한 문서.
> 최종 갱신: 2026-03-18

---

## 1. 요약 판정

| 영역 | 판정 | 비고 |
|------|------|------|
| 전체 아키텍처 방향 | ✅ 적절 | 모듈러 모놀리스 + Hexagonal은 팀 성장 대비 합리적 |
| DB 스키마 (35 테이블) | ⚠️ 일부 선제적 | 9개 테이블은 Phase 1에서 불필요 |
| 기능 범위 F1~F12 | ⚠️ F3은 과도 | 이메일 파싱은 Phase 1.5로 분리 권고 |
| 배포 전략 | ⚠️ 카나리 과도 | MVP는 단순 롤아웃으로 충분 |
| 모니터링/알림 | ⚠️ PagerDuty 과도 | MVP는 Slack 단일 채널로 시작 |
| 테스트 커버리지 목표 | ⚠️ 약간 높음 | 재무 로직만 100%, 나머지 완화 |
| 보안/인증 설계 | ✅ 적절 | MVP RLS 유예 판단은 올바름 |
| AI 추천 (Claude API) | ⚠️ 선제적 | 룰 기반 먼저, AI는 Phase 1.5 |
| 다중 통화 지원 | ✅ 적절 | Amazon/AliExpress/해외여행 결제 빈번. DB 이미 지원 |
| 가족/그룹 공유 가계부 | ✅ 적절 | 가족 공동 가계부는 핵심 사용 시나리오 |
| 태그 통계 (교차 분석) | ✅ 적절 | 기존 M:N 구조 활용, MVP는 실시간 쿼리 |

---

## 2. 기능 우선순위 (MoSCoW)

### Must Have — MVP 핵심 (없으면 앱이 의미 없음)

| 기능 | 이유 | 연관 테이블 |
|------|------|------------|
| **F1** 카드 등록/관리 | 모든 기능의 출발점 | user_card, user_performance, user_voucher, user_benefit_usage |
| **F4** 실적 추적 | 핵심 차별점 #1 (발급일 기준 실적) | user_performance, performance_tier |
| **F5** 혜택 검색 (룰 기반) | 핵심 차별점 #2 — 단, AI 없이 룰 기반부터 | card_benefit, merchant, merchant_alias |
| **F6** 바우처 관리 | 핵심 사용자 니즈 (혜택 소멸 방지) | user_voucher, user_voucher_log |
| **F8** 대시보드 + 태그 통계 | 가치 확인 창구 — analytics 테이블 없이 직접 계산 + 태그 교차 분석 | payment, user_performance, user_voucher, tag, payment_item_tag |
| Auth | 없으면 서비스 불가 | account, account_profile, subscription |
| **다중 통화** | Amazon/AliExpress 해외결제 및 해외여행 결제 빈번 | payment(currency, original_amount, krw_amount), exchange_rate_snapshot |
| **F12** 가족/그룹 공유 가계부 | 가족 공동 가계부는 핵심 사용 시나리오 | ledger_group, group_member, group_invitation |

### Should Have — MVP 완성도

| 기능 | 이유 | 비고 |
|------|------|------|
| **F2** 가계부 (수동 입력 + 해외결제) | 실적/대시보드 정확도에 필수 | merchant_alias fuzzy search, 통화 선택 UI |
| **F7** 인앱 알림 | 바우처 만료, 실적 구간 알림 | 이메일/Push 제외, in-app만 |
| 카드 데이터 (관리자 수동) | 혜택 정보 없으면 F5/F6 동작 불가 | Admin 패널 또는 시드 데이터로 대체 |

### Could Have — Phase 1.5 (초기 사용자 피드백 후)

| 기능 | 이유 | 비고 |
|------|------|------|
| **F3** 이메일 파싱 | 복잡하고 유지보수 부담 큼 | card company별 파싱 규칙 관리 어려움 |
| **F5** AI 추천 (Claude API) | 룰 기반으로 충분히 MVP 가능 | 비용 + 레이턴시 추가 |
| Analytics 집계 테이블 | 100명 규모에서는 직접 계산으로 충분 | 성능 문제 발생 시 추가 |
| 이메일 알림 (PREMIUM) | In-app 먼저 검증 후 | Resend/SES 연동 필요 |

### Won't Have Phase 1 — 명시적 보류

| 항목 | 대안 |
|------|------|
| F9 SMS 파싱 | Phase 2 (설계 문서화 완료) |
| F10 카드사 이벤트 크롤러 자동화 | 수동 관리자 입력으로 대체 |
| F11 사후 시뮬레이션 | Phase 3 |
| MSA 분리 | Phase 3 (현재 모듈러 모놀리스로 준비) |
| Kafka/EDA | Phase 2 (archive/ 설계 보존) |
| Push 알림 | Phase 2 |
| 카나리 배포 | 단순 롤아웃 사용 |
| PagerDuty 연동 | Slack 알림으로 대체 |

---

## 3. DB 테이블 단계별 구현

### Phase 1 — 즉시 구현 (26 테이블)

**Account 도메인 (4)**
```
account, account_profile, subscription, notification_setting
```

**Card 도메인 — 마스터 데이터 (6)**
```
card_company, card, performance_tier, category, card_benefit, card_voucher
```

**UserCard 도메인 (5)**
```
user_card, user_performance, user_voucher, user_voucher_log, user_benefit_usage
```

**Ledger 도메인 — 핵심 (7)**
```
payment, payment_item, tag, payment_item_tag, merchant, merchant_alias, exchange_rate_snapshot
```

**Group 도메인 — 가족/그룹 공유 (3)**
```
ledger_group, group_member, group_invitation
```

> 총 26개 테이블 (19 ENUM) → 핵심 기능 F1/F2/F4/F5/F6/F8/F12 + Auth + 다중통화 구현 가능

### Phase 1.5 — 기능 확장 (3 테이블)

| 테이블 | 용도 | 전제 기능 |
|--------|------|----------|
| `payment_draft` | 이메일 파싱 Draft | F3 구현 시 |
| `email_parse_rule` | 카드사별 파싱 규칙 | F3 구현 시 |
| `card_benefit_history` | 혜택 변경 이력 | 감사 추적 필요 시 |

### Phase 1.5 — Analytics 집계 (4 테이블)

```
user_monthly_summary, user_category_summary, user_tag_summary, user_card_summary
```

> 대시보드 성능 이슈 발생 시 도입. MVP에서는 `payment` 직접 집계.

### Phase 2 — 크롤러 인프라 (3 테이블)

```
crawl_source, crawl_log, crawl_draft
```

> 카드 데이터 자동 수집 시 도입. MVP는 관리자 수동 입력.

---

## 4. 아키텍처 단순화 권고

### 4-1. Bounded Context 통합 권고

현재 설계 9개 → **MVP 구현 시 6개**로 시작 권고:

| 현재 | MVP 운영 | 비고 |
|------|----------|------|
| Card | Card | 마스터 데이터 유지 |
| UserCard | UserCard | 실적/바우처 |
| Ledger | Ledger | 가계부 |
| **Group** | **Group** | **가족/그룹 공유 가계부 (신규)** |
| Benefit | → **UserCard에 통합** | 읽기 전용 서비스, 별도 모듈 불필요 |
| Crawler | → **Admin 패널로 대체** | Phase 2에서 분리 |
| EmailParser | → **Phase 1.5** | 복잡도 높음 |
| Notification | Notification | 이벤트 핸들러로 유지 |
| Analytics | → **Ledger에 집계 쿼리로 대체** | Phase 1.5에서 분리 |

**MVP 실질 모듈: Card / UserCard / Ledger / Group / Notification / Admin**

> 코드 구조는 처음부터 9 패키지로 만들어도 됨. 단, Benefit/Analytics/EmailParser/Crawler는 처음엔 간단하게 구현하고 나중에 보강.

### 4-2. 배포 파이프라인 단순화

```
현재 설계 (Phase 2+):
PR → 테스트 → staging 자동배포 → 카나리 10% → 50% → 100%

MVP 권고:
PR → 테스트 → staging 자동배포 → main merge → 프로덕션 직접 배포
```

- 카나리 배포는 사용자가 충분히 늘었을 때 (수천 명+) 도입
- GitHub Actions 파이프라인은 설계대로 구축하되 카나리 단계만 제거

### 4-3. 모니터링 단순화

```
현재 설계:
Cloud Logging + Prometheus + PagerDuty + Slack (P1/P2/P3/P4 분류)

MVP 권고:
Cloud Logging + Sentry (에러 추적) + Slack (#alerts 단일 채널)
```

- PagerDuty: 실 사용자 수백 명 이상, 24/7 대응 필요 시 도입
- Prometheus 메트릭: Cloud Run 기본 메트릭으로 충분 (초기)

### 4-4. 테스트 커버리지 현실화

| 영역 | 현재 목표 | MVP 권고 | 이유 |
|------|----------|----------|------|
| 백엔드 도메인 로직 | 90% | **90%** 유지 | 재무 로직 오류는 치명적 |
| 백엔드 Adapter | 70% | **50%** | MVP 속도 우선 |
| 프론트엔드 컴포넌트 | 70% | **50%** | UI는 눈으로 확인 |
| E2E (중요 흐름) | 100% | **100%** 유지 | 핵심 시나리오 보호 |
| 재무 계산 로직 | 100% | **100%** 유지 | 절대 타협 불가 |

---

## 5. 과도한 설계 항목 상세 판단

### 5-1. ✅ 적절한 설계 (유지)

| 항목 | 이유 |
|------|------|
| Hexagonal Architecture | 도메인 로직 격리, 테스트 용이. 팀 규모 불문하고 효과적 |
| DDD Aggregate 경계 | UserCard/Ledger 경계는 비즈니스적으로 명확 |
| Supabase PostgreSQL | 관리형 DB + Auth 통합. 운영 부담 최소화 |
| Redis 이중 모드 (Docker/Upstash) | 로컬/클라우드 전환이 명확하고 비용 효율적 |
| Spring @EventListener (MVP) | Kafka 없이 모듈 간 결합 방지. 올바른 판단 |
| JWT + httpOnly Cookie | 표준 보안 패턴. 복잡하지 않음 |
| BFF 패턴 | Next.js API Route 경유로 API 키 노출 방지. 필수 |
| Payment(1)→Item(N) 구조 | 쿠팡 등 복수 품목 실결제 패턴 반영. 처음부터 옳음 |
| 발급일 기준 연간 실적 | 한국 카드사 정책 그대로. 달력 연도로 하면 나중에 다시 만들어야 함 |
| 다중 통화 (exchange_rate_snapshot) | Amazon/AliExpress 해외결제 빈번. DB 설계 완료, 추가 구현 비용 낮음 |
| 가족/그룹 공유 가계부 | 가족 단위 가계부 공유는 실사용 핵심 시나리오 |
| 태그 자유 부착 + 교차 분석 | M:N 구조 이미 존재. 교차 분석은 실시간 쿼리로 MVP 가능 |

### 5-2. ⚠️ 선제적이나 허용 가능 (단계적 구현)

| 항목 | 상황 | 권고 |
|------|------|------|
| 35 테이블 전체 스키마 | Phase 1에서 모두 필요하지 않음 | DB는 미리 설계했으니 테이블만 단계적으로 추가 |
| Benefit 검색 캐싱 (Redis) | 100명 규모에서는 캐시 없어도 괜찮음 | 성능 이슈 시 추가. 코드는 캐시 레이어 추상화해두기 |
| card_benefit_history (이력 추적) | Phase 1에서 즉시 필요하진 않음 | 혜택 변경 시 문제 발생하면 도입 |
| non-functional SLO (99.5% uptime) | MVP에선 Managed Service 의존이라 자동 달성 거의 됨 | 측정 지표로는 유지 |
| RLS 정책 설계 | 코드로 미구현, 설계만 존재 | 올바른 판단. Phase 2에서 활성화 |

### 5-3. ❌ 현재 단계에서 과도 (보류 권고)

| 항목 | 문제점 | 대안 |
|------|--------|------|
| **이메일 파싱 (F3)** | 카드사마다 HTML 구조 다름, 유지보수 비용 큼. 파싱 실패 시 신뢰도 손상 | F2 수동 입력으로 MVP 검증 후 도입 |
| **크롤러 자동화** | 카드사 웹이 자주 바뀜. 법적 이슈 가능성 | 관리자 수동 입력 UI로 시작 |
| **Analytics 집계 테이블 (4개)** | 100명 규모에서 실시간 계산으로 충분. 미리 만들면 동기화 복잡성 추가 | payment 직접 집계 → 성능 이슈 시 materialized view 도입 |
| **Claude AI 혜택 추천** | 룰 기반으로도 충분한 MVP 가치 제공 가능. API 비용 + 레이턴시 추가 | 룰 기반 먼저 → 사용자 요청 시 AI 추가 |
| **카나리 배포 (10/50/100%)** | MVP 트래픽에서는 의미 없음. 오히려 롤백 복잡성 증가 | 단순 Cloud Run revision 교체 |
| **PagerDuty** | 결제/건강 등 핵심 서비스가 아닌 MVP에서 과도 | Slack 단일 채널 → 사용자 늘면 PagerDuty 추가 |

---

## 6. 구현 시작 시퀀스 (권고)

```
Sprint 0 (1주) — 프로젝트 초기화
├── Supabase 프로젝트 생성
├── Phase 1 26개 테이블 마이그레이션 실행
├── 시드 데이터 (카드사 3, 카드 5, 혜택 20개)
├── Spring Boot 프로젝트 초기화 (Gradle + 9 모듈 패키지 구조)
├── Next.js 프로젝트 초기화 (App Router + shadcn/ui)
└── GitHub Actions: PR 체크 + staging 자동배포

Sprint 1 (2주) — Auth + 카드 등록
├── Supabase Auth 연동 (로그인/회원가입/OAuth)
├── F1: 카드 등록/조회/삭제 API + UI
├── 카드 마스터 데이터 Admin 입력 UI (또는 시드로 대체)
└── 기본 레이아웃 (하단 탭바, 대시보드 셸)

Sprint 2 (2주) — 실적 + 바우처
├── F4: 실적 추적 API (발급일 기준 계산) + 실적 트랙 UI
├── F6: 바우처 목록/사용 처리 API + UI
├── F7: 인앱 알림 (바우처 만료 D-7/3/1)
└── 실적 달성 이벤트 → 알림 연동

Sprint 3 (2주) — 가계부 + 검색 + 해외결제
├── F2: 수동 결제 입력 (merchant fuzzy search 포함)
├── 해외결제 입력 UI (통화 선택 + KRW 환산)
├── F5: 혜택 검색 (룰 기반 — 가맹점/카테고리 매칭)
├── 태그 자유 부착 + 자동완성 UI
└── 마스코트 UI (허니 배저 포즈 3종)

Sprint 4 (2주) — 그룹 가계부 + 대시보드
├── F12: 가족/그룹 생성, 멤버 초대/추방 API + UI
├── F12: 그룹 공유 가계부 CRUD + 거버넌스
├── F8: 대시보드 (payment 직접 집계 + 태그 교차 분석)
└── 그룹 통계 (멤버별/태그별 분석)

Sprint 5 (2주) — 품질 + 런치 준비
├── E2E 테스트 (핵심 시나리오 10개)
├── 성능 최적화 (캐싱 레이어 추가)
├── Sentry 연동 + Slack 알림
└── 프로덕션 배포 + 모니터링 확인

Phase 1.5 — 피드백 기반 확장
├── F3: 이메일 파싱 (사용자 요청 시)
├── F5: AI 추천 (Claude API 연동)
├── Analytics 집계 테이블 도입
└── PagerDuty 연동
```

---

## 7. 복잡도 vs. 가치 매트릭스

```
                높음
                 |
    F3(이메일) ─ ─ ─ ─      ← 높은 복잡도, 중간 가치: 보류
                 |
   크롤러자동화   |
                 |         F5(룰기반)─────  ← 적절한 복잡도, 높은 가치
                 │         F4(실적) ─────   ← 중간 복잡도, 높은 가치
  복             │    F1 ──────────────     ← 낮은 복잡도, 높은 가치
  잡  F12(그룹)──┤    ← 중간 복잡도, 높은 가치
  도             │    F6(바우처) ──────     ← 낮은 복잡도, 높은 가치
    낮음─────────┼──────────────────────── 높음
          낮음   │              가치
                 │    F8(대시보드) ────     ← 중간 복잡도, 높은 가치
                 │    다중통화 ────────     ← 낮은 복잡도 (DB 지원), 높은 가치
```

---

## 8. 설계 문서 vs. 구현 범위 매핑

| 설계 문서 내용 | Phase 1 구현 여부 | 비고 |
|---------------|-----------------|------|
| 35 테이블 전체 스키마 | 26개 구현 | 나머지 9개는 스키마만 보존 |
| 9 Bounded Context | 6개로 시작 | 코드 패키지는 9개 만들어도 됨 |
| Hexagonal 전 레이어 | ✅ 구현 | Port/Adapter 패턴 유지 |
| @EventListener 패턴 | ✅ 구현 | Kafka 아님 |
| JWT + Supabase Auth | ✅ 구현 | Google/Kakao OAuth 포함 |
| RLS 정책 | ⚠️ 설계만 보존, App 레벨 필터 사용 | |
| Redis 캐싱 | 단계적 도입 | 성능 이슈 시 추가 |
| 다중 통화 | ✅ 구현 | DB 이미 지원, UI/API 추가 |
| 가족/그룹 공유 가계부 | ✅ 구현 | 신규 도메인, Sprint 4에 배치 |
| 태그 교차 분석 | ✅ 구현 | 실시간 쿼리 (집계 테이블 없이) |
| 카나리 배포 | ❌ 단순 롤아웃 사용 | |
| PagerDuty | ❌ Slack 대체 | |
| Analytics 집계 테이블 | ❌ 직접 집계 쿼리 사용 | |
| 이메일 파싱 | ❌ Phase 1.5 | |
| Claude AI 추천 | ❌ 룰 기반 대체 | |

---

## 9. 최종 권고

**CardWise의 설계는 전체적으로 잘 되어 있다.** 문제는 설계 자체가 아니라 "언제 구현할 것인가"의 시퀀싱이다.

1. **아키텍처 패턴은 유지** — Hexagonal + DDD + 모듈러 모놀리스는 MVP부터 적용해도 이득이 더 크다.

2. **DB 스키마는 26개 테이블로 시작** — 나머지 9개는 테이블 없이 마이그레이션 파일만 준비.

3. **기능은 F1/F2/F4/F5/F6/F8/F12 + Auth + 다중통화 + 태그 먼저** — 이메일 파싱(F3)과 AI 추천은 사용자 피드백 후 결정.

4. **운영 도구는 최소화** — Sentry + Slack으로 시작, 사용자 증가 시 고도화.

5. **재무 로직 테스트는 타협 없이 100%** — 실적 계산, 혜택 금액, 바우처 잔여는 오류 시 신뢰 손상이 치명적.

---

## 10. 명시적 보류 체크리스트

| 항목 | 현재 상태 | 보류 Phase | 재개 트리거 조건 |
|------|----------|-----------|----------------|
| F3 이메일 파싱 | 설계 완료 (프로세스 흐름 문서화) | Phase 1.5 | 수동 입력 사용자 50명+ 피드백 후 |
| F5 AI 추천 (Claude API) | 설계 완료 (프롬프트 문서화) | Phase 1.5 | 룰 기반 추천 운영 3개월 후 |
| F9 SMS 파싱 | 설계 미착수 | Phase 2 | 모바일 앱 출시 결정 후 |
| F10 크롤러 자동화 | 설계 완료 (archive/) | Phase 2 | 관리 카드 100종+ 돌파 시 |
| F11 사후 시뮬레이션 | 설계 미착수 | Phase 3 | 활성 사용자 1000명+ |
| Analytics 집계 테이블 (4개) | 스키마 설계 완료 | Phase 1.5 | 대시보드 응답 1초 초과 시 |
| Kafka/EDA | 설계 완료 (archive/) | Phase 2 | MSA 분리 결정 시 |
| MSA 분리 | 아키텍처 준비 완료 | Phase 3 | 팀 3명+ 또는 트래픽 분리 필요 시 |
| Push 알림 | 설계 미착수 | Phase 2 | 모바일 앱 출시 결정 후 |
| 카나리 배포 | 설계 완료 (deployment-guide) | Phase 2 | 사용자 수천 명+ |
| PagerDuty | 설계 완료 (observability) | Phase 2 | 24/7 대응 필요 시 |
| RLS 강제 전환 | 정책 설계 완료 | Phase 2 | 보안 감사 또는 멀티테넌시 강화 시 |

---

*이 문서는 구현 시작 전 팀이 합의해야 할 MVP 범위를 명시한다. 설계 변경 시 schema-design.md, functional-requirements.md와 함께 동기화 필요.*

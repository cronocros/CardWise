# CardWise - Architecture Design

## Tech Stack

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui | Bun runtime |
| Backend | Spring Boot (Kotlin) + Hexagonal Architecture | Modular Monolith |
| DB | Supabase PostgreSQL | Managed |
| Auth | Supabase Auth (JWT) | |
| Cache | Redis (Upstash) | 세션, 레이트리밋, 캐시 |
| Messaging | Spring ApplicationEvent (Phase 1) -> Kafka (Phase 2+) | EDA 기반 |
| 배포 | Vercel (FE) + TBD (BE) | |

---

## 전체 시스템 구조

```
                         +------------------+
                         |   Next.js 15     |
                         |   (Frontend)     |
                         +--------+---------+
                                  |
                          REST API (OpenAPI)
                                  |
                         +--------v---------+
                         |  API Gateway     |
                         |  (Spring Boot)   |
                         +--------+---------+
                                  |
          +----------+------------+------------+-----------+
          |          |            |            |           |
    +-----v----+ +--v------+ +--v-------+ +--v------+ +--v---------+
    |  card    | | benefit | | ledger   | | voucher | | crawler    |
    |  module  | | module  | | module   | | module  | | module     |
    +-----+----+ +--+------+ +--+-------+ +--+------+ +--+---------+
          |          |            |            |           |
          +----------+-----+------+------------+-----------+
                           |
              Spring Event Bus (In-Process)
              (Phase 2: Kafka Topic 전환)
                           |
          +----------+-----+------+------------+
          |          |            |            |
    +-----v----+ +--v------+ +--v-------+ +--v-----------+
    | email-   | | notifi- | | analytics| | shared-      |
    | parser   | | cation  | | module   | | kernel       |
    +----------+ +---------+ +----------+ +--------------+
                           |
            +--------------+---------------+
            |              |               |
    +-------v------+ +----v-----+ +-------v-------+
    |  Supabase    | |  Redis   | |  Kafka        |
    |  PostgreSQL  | | (Upstash)| |  (Phase 2+)   |
    +--------------+ +----------+ +---------------+
```

---

## DDD 도메인 구조

### Bounded Context Map

```
+====================+     +====================+     +====================+
|   Card Context     |     | User Card Context  |     |  Ledger Context    |
| (카드 마스터 관리)  |     | (내 카드 관리)      |     | (가계부)            |
|                    |     |                    |     |                    |
| Aggregate:         |     | Aggregate:         |     | Aggregate:         |
|  - Card            |     |  - UserCard        |     |  - Payment         |
|  - CardBenefit     |     |  - UserPerformance |     |  - PaymentItem     |
|  - CardVoucher     |     |  - UserVoucher     |     |  - PaymentDraft    |
|  - Category        |     |  - UserBenefitUsage|     |  - Tag             |
|  - Merchant        |     |                    |     |                    |
+=========+==========+     +==========+=========+     +=========+==========+
          |                           |                          |
          | CardDataChanged           | PerformanceUpdated       | PaymentCreated
          | Event                     | Event                    | Event
          |                           |                          |
+---------v-----------+     +---------v----------+     +---------v----------+
|  Crawler Context    |     | Benefit Context    |     | Analytics Context  |
| (데이터 수집)        |     | (혜택 검색/추천)    |     | (통계/인사이트)     |
|                     |     |                    |     |                    |
| Aggregate:          |     | - 혜택 검색 서비스  |     | Aggregate:         |
|  - CrawlSource      |     | - 카드 추천 엔진   |     |  - MonthlySummary  |
|  - CrawlLog         |     | - 캐시 전략        |     |  - CategorySummary |
|  - CrawlDraft       |     |                    |     |  - CardSummary     |
+---------------------+     +--------------------+     +--------------------+

+-----------------------+     +---------------------+
| Email Parser Context  |     | Notification Context|
| (이메일 파싱)          |     | (알림)              |
|                       |     |                     |
| - 파싱 규칙 관리       |     | - 푸시 알림          |
| - Draft 생성          |     | - 이메일 알림        |
+-----------------------+     +---------------------+

=== Context 간 관계 ===
Card <--[Conformist]--> UserCard       : UserCard가 Card의 모델을 따름
Card <--[ACL]---------> Crawler        : Crawler 결과를 Card 모델로 변환
Ledger --[Published Language]--> Analytics : Payment 이벤트를 표준 포맷으로 발행
Benefit <--[Open Host Service]--> Frontend : OpenAPI로 추천 결과 제공
```

### Aggregate 설계 원칙

1. **Aggregate 간 참조는 ID로만** (직접 객체 참조 금지)
2. **하나의 트랜잭션 = 하나의 Aggregate 변경**
3. **Aggregate 간 일관성은 이벤트로 Eventual Consistency**
4. **Shared Kernel**: 공통 Value Object (Money, YearMonth, AccountId 등)만 포함

---

## 헥사고날 아키텍처 (모듈 내부 구조)

```
각 모듈 내부 패키지 구조:

module-name/
+-- domain/              도메인 모델 (Entity, Value Object, Domain Event)
|   +-- model/
|   +-- event/
|   +-- exception/
+-- application/          Use Case (Application Service)
|   +-- port/
|   |   +-- in/          Driving Port (Interface)
|   |   +-- out/         Driven Port (Interface)
|   +-- service/         Use Case 구현
+-- adapter/
|   +-- in/
|   |   +-- web/         REST Controller (Driving Adapter)
|   +-- out/
|       +-- persistence/ JPA Repository (Driven Adapter)
|       +-- messaging/   Event Publisher (Driven Adapter)
|       +-- cache/       Redis Adapter (Driven Adapter)
|       +-- external/    외부 API Adapter
```

### 의존성 규칙

```
Adapter --> Application --> Domain
  (외부)      (유스케이스)    (핵심)

Domain: 외부 의존성 없음 (순수 Kotlin)
Application: Domain만 의존, Port 인터페이스 정의
Adapter: Application의 Port를 구현
```

---

## 인증 흐름

```
[Browser]
    |
    | 1. 로그인 요청
    v
[Supabase Auth] --> JWT 발급
    |
    | 2. Access Token (메모리) + Refresh Token (httpOnly Cookie)
    v
[Next.js Frontend]
    |
    | 3. Authorization: Bearer {accessToken}
    v
[Spring Boot Backend]
    |
    | 4. JWT 검증 (Supabase 공개키, JwtAuthenticationFilter)
    | 5. SecurityContext에 AccountId 설정
    v
[요청 처리]
```

- Access Token: 브라우저 메모리 전용 (XSS 방지)
- Refresh Token: httpOnly + Secure + SameSite=Strict Cookie
- Backend는 JWT 검증만 (사용자 DB 직접 관리 안 함)

---

## Redis 캐시 전략

### 캐시 대상

| 캐시 키 패턴 | 대상 | TTL | 무효화 전략 |
|-------------|------|-----|-----------|
| `card:{cardId}` | 카드 상세 정보 | 24h | CardDataChangedEvent 시 삭제 |
| `card:{cardId}:benefits` | 카드별 혜택 목록 | 24h | CardDataChangedEvent 시 삭제 |
| `merchant:search:{query}` | 가맹점 검색 결과 | 1h | 크롤링 완료 시 전체 삭제 |
| `recommend:{accountId}:{merchantId}` | 카드 추천 결과 | 30m | Payment/UserCard 변경 시 삭제 |
| `user:{accountId}:dashboard` | 대시보드 summary | 10m | PaymentEvent 시 삭제 |
| `user:{accountId}:performance` | 실적 현황 | 10m | PaymentEvent 시 삭제 |

### 캐시 정책

```
Read:  Cache-Aside (Look-Aside)
  1. Redis에서 조회
  2. Miss -> DB 조회 -> Redis에 저장 -> 반환
  3. Hit -> 바로 반환

Write: Write-Through + Event Invalidation
  1. DB에 쓰기
  2. 도메인 이벤트 발행
  3. 이벤트 핸들러에서 관련 캐시 키 삭제 (invalidation)
  4. 다음 Read 시 최신 데이터로 캐시 재구성
```

### Rate Limiting (Redis)

```
레이트 리미팅 대상:
  - /api/recommend/*  : 분당 30회 (FREE), 분당 100회 (PREMIUM)
  - /api/payment/*    : 분당 60회
  - /api/auth/*       : 분당 10회 (brute force 방지)

구현: Redis Sliding Window Counter
키: rate:{accountId}:{endpoint}:{windowMinute}
```

---

## EDA (Event-Driven Architecture)

### Phase 1: Spring ApplicationEvent (모놀리스)

```
[Producer Module]
    |
    | ApplicationEventPublisher.publishEvent(DomainEvent)
    v
[Spring Event Bus] (In-Process, 동기/비동기)
    |
    | @EventListener / @TransactionalEventListener
    v
[Consumer Module]
```

- `@TransactionalEventListener(phase = AFTER_COMMIT)` 사용
- 트랜잭션 커밋 후 이벤트 처리 -> 데이터 일관성 보장
- `@Async` 조합으로 비동기 처리 가능

### Phase 2: Kafka 전환 (MSA)

```
[Producer Service]
    |
    | KafkaTemplate.send(topic, event)
    v
[Kafka Cluster]
    |  Topics:
    |  - cardwise.payment.created
    |  - cardwise.payment.updated
    |  - cardwise.voucher.used
    |  - cardwise.card.data-changed
    |  - cardwise.performance.updated
    v
[Consumer Service(s)]
    |
    | @KafkaListener
    v
[처리]
```

### 전환 전략 (모놀리스 -> MSA)

```
Phase 1 (현재):
  모듈 내부 Port 인터페이스 -> Spring Event 구현체

Phase 2 (전환):
  동일 Port 인터페이스 -> Kafka 구현체로 교체
  Adapter만 교체, Domain/Application 코드 변경 없음

구체적 전환:
  EventPublisherPort (interface)
    +-- SpringEventPublisherAdapter (Phase 1)
    +-- KafkaEventPublisherAdapter  (Phase 2)

  EventListenerPort (interface)
    +-- SpringEventListenerAdapter  (Phase 1)
    +-- KafkaEventListenerAdapter   (Phase 2)
```

### Outbox Pattern (Phase 2 준비)

```
DB 쓰기와 이벤트 발행의 원자성 보장:

1. 비즈니스 데이터 + outbox 테이블에 동시 INSERT (같은 트랜잭션)
2. 별도 폴러(또는 CDC)가 outbox 읽어서 Kafka로 발행
3. 발행 완료 시 outbox 레코드 삭제/마킹

Phase 1에서는 Spring @TransactionalEventListener로 충분
Phase 2 전환 시 outbox 테이블 추가
```

---

## 이벤트 카탈로그

| 이벤트 | 발행 Context | 구독 Context | 처리 내용 | Kafka Topic (Phase 2) |
|--------|-------------|-------------|----------|---------------------|
| PaymentCreatedEvent | Ledger | UserCard, Benefit, Analytics | 실적/혜택/통계 갱신 | cardwise.payment.created |
| PaymentUpdatedEvent | Ledger | UserCard, Benefit, Analytics | 실적/혜택/통계 재계산 | cardwise.payment.updated |
| PaymentDeletedEvent | Ledger | UserCard, Benefit, Analytics | 실적/혜택/통계 차감 | cardwise.payment.deleted |
| VoucherUsedEvent | Voucher (UserCard) | Analytics | 바우처 사용 통계 | cardwise.voucher.used |
| VoucherCancelledEvent | Voucher (UserCard) | Analytics | 바우처 취소 반영 | cardwise.voucher.cancelled |
| CardRegisteredEvent | UserCard | Notification | 등록 완료 알림 | cardwise.usercard.registered |
| CardDataChangedEvent | Card/Crawler | Benefit (캐시 무효화) | 캐시 삭제, 재인덱싱 | cardwise.card.data-changed |
| VoucherExpiringEvent | Voucher (Scheduler) | Notification | 만료 임박 알림 | cardwise.voucher.expiring |
| PerformanceTierChangedEvent | UserCard | Notification, Benefit | 구간 변경 알림, 혜택 재계산 | cardwise.performance.tier-changed |
| DraftApprovedEvent | Crawler | Card | Master 데이터 반영 | cardwise.draft.approved |
| PaymentDraftCreatedEvent | EmailParser | Notification | 사용자 확인 요청 알림 | cardwise.payment-draft.created |

---

## 모듈 간 의존성 매트릭스

```
발행 \  구독 -> | Card | UserCard | Benefit | Ledger | Voucher | Crawler | EmailParser | Notification | Analytics |
----------------|------|----------|---------|--------|---------|---------|-------------|-------------|-----------|
Card            |      |          |   X     |        |         |         |             |             |           |
UserCard        |      |          |   X     |        |         |         |             |     X       |           |
Benefit         |      |          |         |        |         |         |             |             |           |
Ledger          |      |    X     |   X     |        |         |         |             |             |     X     |
Voucher         |      |          |         |        |         |         |             |     X       |     X     |
Crawler         |  X   |          |         |        |         |         |             |             |           |
EmailParser     |      |          |         |        |         |         |             |     X       |           |
Notification    |      |          |         |        |         |         |             |             |           |
Analytics       |      |          |         |        |         |         |             |             |           |

X = 이벤트를 통한 간접 의존 (직접 메서드 호출 아님)
```

---

## 보안 아키텍처

| 항목 | 정책 |
|------|------|
| Supabase RLS | 모든 테이블에 Row Level Security 활성화 |
| API Key 보호 | 서버 사이드 전용, 클라이언트 번들 포함 금지 |
| 입력 검증 | Backend: Bean Validation, Frontend: Zod |
| Auth 미들웨어 | JwtAuthenticationFilter -> SecurityContext |
| SQL Injection | Spring Data JPA 사용, raw SQL 지양 |
| Rate Limiting | Redis Sliding Window (엔드포인트별 차등) |
| CORS | 허용 Origin 화이트리스트 |
| HTTPS | 전 구간 TLS |

---

## 배포 구조

```
Phase 1 (Monolith):
+----------+     +----------------------------+     +------------------+
|  Vercel  | <-> | Cloud Run / Railway        | <-> | Supabase         |
| Next.js  |     | Spring Boot (단일 JAR)      |     | PostgreSQL + Auth|
+----------+     +----------------------------+     +------------------+
                          |
                   +------v------+
                   |   Upstash   |
                   |   Redis     |
                   +-------------+

Phase 2 (MSA):
+----------+     +------------------+     +------------------+
|  Vercel  | <-> | API Gateway      | <-> | Supabase         |
| Next.js  |     | (Spring Cloud GW)|     | PostgreSQL + Auth|
+----------+     +--------+---------+     +------------------+
                          |
          +-------+-------+-------+-------+
          |       |       |       |       |
       card    ledger  benefit voucher  ...
       svc     svc     svc     svc
          |       |       |       |
          +-------+---+---+-------+
                      |
               +------v------+     +----------+
               |   Upstash   |     |  Kafka   |
               |   Redis     |     | (MSK/    |
               +-------------+     | Confluent)|
                                   +----------+
```

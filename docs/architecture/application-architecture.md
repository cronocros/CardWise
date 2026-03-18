# CardWise Application Architecture

> 한국 신용카드 혜택 관리 플랫폼 — 애플리케이션 아키텍처 설계 문서

---

## 1. 아키텍처 원칙

### 1.1 헥사고날 아키텍처 (Ports & Adapters)

외부 의존성(DB, API, 메시징)을 도메인 로직으로부터 완전히 격리한다.
포트(인터페이스)를 통해서만 외부와 통신하며, 어댑터가 실제 구현을 담당한다.

```
                         +-------------------+
                         |    REST Client    |
                         |   (Driving Side)  |
                         +--------+----------+
                                  |
                                  v
                    +-------------+-------------+
                    |    Adapter (in/web)        |
                    |    - REST Controller       |
                    +-------------+-------------+
                                  |
                                  v
                    +-------------+-------------+
                    |   Port (in) - Use Case     |
                    |   - Command / Query        |
                    +-------------+-------------+
                                  |
                                  v
                    +-------------+-------------+
                    |   Application Service      |
                    |   - Orchestration          |
                    |   - Transaction 관리        |
                    +-------------+-------------+
                                  |
                                  v
                    +-------------+-------------+
                    |   Domain Model             |
                    |   - Aggregate Root         |
                    |   - Domain Event           |
                    |   - Value Object           |
                    +-------------+-------------+
                                  |
                                  v
                    +-------------+-------------+
                    |   Port (out) - Repository  |
                    |   - 외부 시스템 인터페이스    |
                    +-------------+-------------+
                                  |
                                  v
                    +-------------+-------------+
                    |   Adapter (out)            |
                    |   - JPA / Redis / Event    |
                    +----------------------------+
```

### 1.2 의존성 규칙

의존 방향은 반드시 바깥에서 안쪽으로만 흐른다. 도메인은 어떤 외부 프레임워크에도 의존하지 않는다.

```
  Adapter (in/out)  --->  Application (Service, Port)  --->  Domain (Model, Event)
       |                          |                               |
  Spring MVC               Use Case 인터페이스              순수 Kotlin
  JPA / Redis              트랜잭션 경계                   프레임워크 무관
  Event Publisher          오케스트레이션                   비즈니스 규칙
```

### 1.3 모듈러 모놀리스 (MSA-Ready)

- MVP 단계에서는 **단일 배포 단위(모놀리스)**로 운영한다.
- 각 Bounded Context를 독립 모듈(Gradle 멀티모듈)로 분리한다.
- 모듈 간 통신은 **Spring @EventListener** 기반의 인프로세스 이벤트로 처리한다.
- Kafka, RabbitMQ 등 외부 메시징은 MVP에서 사용하지 않는다.
- 추후 MSA 전환 시 이벤트 발행 어댑터만 교체하면 된다.

### 1.4 DDD (Domain-Driven Design)

- Bounded Context 단위로 모듈을 분리한다.
- Aggregate 단위로 트랜잭션 경계를 설정한다.
- Aggregate 간 참조는 ID로만 한다.
- 도메인 이벤트를 통한 최종 일관성(Eventual Consistency)을 보장한다.

---

## 2. DDD Bounded Context Map

### 2.1 Bounded Context 목록

| # | Context | 한국어 명칭 | 핵심 역할 | Aggregates |
|---|---------|------------|-----------|------------|
| 1 | **Card** | 카드 마스터 관리 | 카드사 데이터 기반 카드/혜택 마스터 관리 | Card, CardBenefit, CardVoucher, Category, Merchant |
| 2 | **UserCard** | 내 카드 관리 | 사용자 보유 카드, 실적, 바우처, 혜택 사용량 | UserCard, UserPerformance, UserVoucher, UserBenefitUsage |
| 3 | **Ledger** | 가계부 | 결제 내역 기록 및 관리 | Payment, PaymentItem, PaymentDraft, Tag |
| 4 | **Benefit** | 혜택 검색/추천 | 혜택 조회 및 최적 카드 추천 | (Read-only service, 자체 Aggregate 없음) |
| 5 | **Crawler** | 데이터 수집 | 카드사 웹사이트 크롤링 | CrawlSource, CrawlLog, CrawlDraft |
| 6 | **EmailParser** | 이메일 파싱 | 결제 알림 이메일 파싱 -> PaymentDraft 생성 | (EmailMessage 처리 후 Ledger로 전달) |
| 7 | **Notification** | 알림 | 이벤트 기반 알림 발송 | (이벤트 구독 후 알림 채널로 전달) |
| 8 | **Analytics** | 통계 | 소비 패턴 분석, 혜택 사용 통계 | (Read-heavy, 비정규화된 요약 데이터) |
| 9 | **Group** | 가족/그룹 공유 가계부 | 그룹 생성, 멤버 초대/추방, 공유 결제 관리, 거버넌스 | LedgerGroup, GroupMember, GroupInvitation |

### 2.2 Context 관계도

```
+------------------------------------------------------------------+
|                        CardWise System                            |
|                                                                   |
|  +-----------+    Published     +-----------+                     |
|  |           |    Language      |           |                     |
|  |  Crawler  +---------------->+   Card    |                     |
|  |           |   (CrawlDraft)  |  (Master) |                     |
|  +-----------+                 +-----+-----+                     |
|                                      |                            |
|                             OHS (Open Host Service)               |
|                                      |                            |
|                          +-----------+-----------+                |
|                          |                       |                |
|                          v                       v                |
|                   +------+------+         +------+------+         |
|                   |             |         |             |         |
|                   |  UserCard   |         |   Benefit   |         |
|                   |             |         | (Read-Only) |         |
|                   +------+------+         +------+------+         |
|                          |                       |                |
|                     Conformist               ACL (Anti-           |
|                     (Card 모델                Corruption          |
|                      준수)                    Layer)              |
|                          |                       |                |
|                          v                       v                |
|  +-----------+    +------+------+         +------+------+         |
|  |           |    |             |         |             |         |
|  |  Email    +--->+   Ledger    |         | Analytics   |         |
|  |  Parser   |    |  (가계부)   |         |  (통계)     |         |
|  |           |    +------+------+         +-------------+         |
|  +-----------+           |                      ^                 |
|   (PaymentDraft          |                      |                 |
|    생성)                  +------+-------+-------+                |
|                                 |       |                         |
|                                 v       v                         |
|                          +------+-------+------+                  |
|                          |                     |                  |
|                          |   Notification      |                  |
|                          |    (알림)           |                  |
|                          +---------------------+                  |
+------------------------------------------------------------------+
```

### 2.3 Context 간 관계 패턴

| Upstream | Downstream | 패턴 | 설명 |
|----------|------------|------|------|
| Crawler | Card | **Published Language** | CrawlDraft를 표준 형식으로 발행, Card가 수용 |
| Card | UserCard | **Conformist** | UserCard는 Card의 모델을 그대로 따름 (ID 참조) |
| Card | Benefit | **Open Host Service** | Card가 공개 읽기 인터페이스를 제공 |
| UserCard | Benefit | **Open Host Service** | UserCard가 공개 읽기 인터페이스를 제공 |
| Benefit | Analytics | **ACL** | Analytics가 자체 모델로 변환하여 저장 |
| EmailParser | Ledger | **Published Language** | PaymentDraft 표준 형식으로 전달 |
| Ledger | Notification | **Conformist** | 결제 이벤트를 그대로 수신 |
| Ledger | Analytics | **Conformist** | 결제 이벤트를 수신하여 통계 갱신 |
| UserCard | Analytics | **Conformist** | 실적/혜택 변경 이벤트 수신 |

---

## 3. 헥사고날 모듈 구조 (패키지 레이아웃)

### 3.1 공통 모듈 구조

각 Bounded Context는 동일한 헥사고날 패키지 구조를 따른다.

```
com.cardwise.{module-name}/
├── domain/
│   ├── model/              # Aggregate Root, Entity, Value Object
│   ├── event/              # Domain Event 정의
│   └── exception/          # 도메인 예외
├── application/
│   ├── port/
│   │   ├── in/             # Driving Port (Use Case 인터페이스)
│   │   └── out/            # Driven Port (Repository, 외부 시스템 인터페이스)
│   └── service/            # Use Case 구현 (Application Service)
└── adapter/
    ├── in/
    │   └── web/            # REST Controller, DTO, Mapper
    └── out/
        ├── persistence/    # JPA Entity, Repository 구현체
        ├── cache/          # Redis 캐시 어댑터
        └── messaging/      # Spring Event Publisher 구현체
```

### 3.2 모듈별 패키지 상세

#### Card Context (카드 마스터 관리)

```
com.cardwise.card/
├── domain/
│   ├── model/
│   │   ├── Card.kt                  # Aggregate Root
│   │   ├── CardBenefit.kt           # Entity (Card 하위)
│   │   ├── CardVoucher.kt           # Entity (Card 하위)
│   │   ├── Category.kt              # Aggregate Root
│   │   └── Merchant.kt              # Aggregate Root
│   ├── event/
│   │   ├── CardCreatedEvent.kt
│   │   └── CardBenefitUpdatedEvent.kt
│   └── exception/
│       └── CardNotFoundException.kt
├── application/
│   ├── port/
│   │   ├── in/
│   │   │   ├── RegisterCardUseCase.kt
│   │   │   ├── UpdateCardBenefitUseCase.kt
│   │   │   └── GetCardQuery.kt
│   │   └── out/
│   │       ├── CardRepository.kt
│   │       ├── CategoryRepository.kt
│   │       └── MerchantRepository.kt
│   └── service/
│       ├── CardCommandService.kt
│       └── CardQueryService.kt
└── adapter/
    ├── in/web/
    │   ├── CardController.kt
    │   ├── dto/
    │   │   ├── CardRequest.kt
    │   │   └── CardResponse.kt
    │   └── mapper/CardMapper.kt
    └── out/
        ├── persistence/
        │   ├── CardJpaEntity.kt
        │   ├── CardJpaRepository.kt
        │   └── CardPersistenceAdapter.kt
        └── messaging/
            └── CardEventPublisher.kt
```

#### UserCard Context (내 카드 관리)

```
com.cardwise.usercard/
├── domain/model/
│   ├── UserCard.kt                  # Aggregate Root
│   ├── UserPerformance.kt           # Aggregate Root
│   ├── UserVoucher.kt               # Aggregate Root
│   └── UserBenefitUsage.kt          # Aggregate Root
├── domain/event/
│   ├── UserCardRegisteredEvent.kt
│   ├── PerformanceUpdatedEvent.kt
│   └── BenefitUsageRecordedEvent.kt
├── application/port/in/
│   ├── RegisterUserCardUseCase.kt
│   ├── UpdatePerformanceUseCase.kt
│   └── GetUserCardQuery.kt
├── application/port/out/
│   ├── UserCardRepository.kt
│   └── UserPerformanceRepository.kt
├── application/service/
│   ├── UserCardCommandService.kt
│   └── UserCardQueryService.kt
└── adapter/
    ├── in/web/
    │   └── UserCardController.kt
    └── out/
        ├── persistence/
        │   └── UserCardPersistenceAdapter.kt
        └── messaging/
            └── UserCardEventPublisher.kt
```

#### Ledger Context (가계부)

```
com.cardwise.ledger/
├── domain/model/
│   ├── Payment.kt                   # Aggregate Root
│   ├── PaymentItem.kt               # Entity (Payment 하위)
│   ├── PaymentDraft.kt              # Aggregate Root
│   └── Tag.kt                       # Aggregate Root
├── domain/event/
│   ├── PaymentCreatedEvent.kt
│   ├── PaymentDraftCreatedEvent.kt
│   └── PaymentConfirmedEvent.kt
├── application/port/in/
│   ├── CreatePaymentUseCase.kt
│   ├── ConfirmPaymentDraftUseCase.kt
│   └── GetPaymentQuery.kt
├── application/port/out/
│   ├── PaymentRepository.kt
│   └── PaymentDraftRepository.kt
├── application/service/
│   ├── PaymentCommandService.kt
│   └── PaymentQueryService.kt
└── adapter/
    ├── in/web/
    │   └── PaymentController.kt
    └── out/
        ├── persistence/
        │   └── PaymentPersistenceAdapter.kt
        └── messaging/
            └── PaymentEventPublisher.kt
```

#### Benefit Context (혜택 검색/추천)

```
com.cardwise.benefit/
├── domain/model/
│   └── (자체 Aggregate 없음 - Read-only 서비스)
├── application/port/in/
│   ├── SearchBenefitUseCase.kt
│   ├── RecommendCardUseCase.kt
│   └── GetBenefitSummaryQuery.kt
├── application/port/out/
│   ├── CardReadPort.kt              # Card Context 읽기 포트
│   └── UserCardReadPort.kt          # UserCard Context 읽기 포트
├── application/service/
│   ├── BenefitSearchService.kt
│   └── CardRecommendService.kt
└── adapter/
    ├── in/web/
    │   └── BenefitController.kt
    └── out/
        ├── persistence/
        │   └── BenefitReadAdapter.kt
        └── cache/
            └── BenefitCacheAdapter.kt
```

#### Crawler Context (데이터 수집)

```
com.cardwise.crawler/
├── domain/model/
│   ├── CrawlSource.kt               # Aggregate Root
│   ├── CrawlLog.kt                  # Aggregate Root
│   └── CrawlDraft.kt                # Aggregate Root
├── domain/event/
│   └── CrawlCompletedEvent.kt
├── application/port/in/
│   ├── ExecuteCrawlUseCase.kt
│   └── GetCrawlStatusQuery.kt
├── application/port/out/
│   ├── CrawlSourceRepository.kt
│   ├── CrawlLogRepository.kt
│   └── WebScraperPort.kt
├── application/service/
│   └── CrawlService.kt
└── adapter/
    ├── in/web/
    │   └── CrawlController.kt
    └── out/
        ├── persistence/
        │   └── CrawlPersistenceAdapter.kt
        ├── scraper/
        │   └── SeleniumScraperAdapter.kt
        └── messaging/
            └── CrawlEventPublisher.kt
```

#### EmailParser Context (이메일 파싱)

```
com.cardwise.emailparser/
├── domain/model/
│   └── (파싱 로직, PaymentDraft 생성)
├── domain/event/
│   └── EmailParsedEvent.kt
├── application/port/in/
│   └── ParseEmailUseCase.kt
├── application/port/out/
│   └── EmailSourcePort.kt
├── application/service/
│   └── EmailParserService.kt
└── adapter/
    ├── in/
    │   └── scheduler/
    │       └── EmailPollScheduler.kt
    └── out/
        ├── imap/
        │   └── ImapEmailAdapter.kt
        └── messaging/
            └── EmailParserEventPublisher.kt
```

#### Notification Context (알림)

```
com.cardwise.notification/
├── domain/model/
│   └── (알림 템플릿, 채널 설정)
├── application/port/in/
│   └── SendNotificationUseCase.kt
├── application/port/out/
│   ├── PushNotificationPort.kt
│   └── NotificationTemplatePort.kt
├── application/service/
│   └── NotificationService.kt
└── adapter/
    ├── in/
    │   └── event/
    │       └── NotificationEventHandler.kt
    └── out/
        ├── fcm/
        │   └── FcmPushAdapter.kt
        └── persistence/
            └── NotificationPersistenceAdapter.kt
```

#### Analytics Context (통계)

```
com.cardwise.analytics/
├── domain/model/
│   └── (비정규화된 요약 데이터 모델)
├── application/port/in/
│   ├── GetSpendingSummaryQuery.kt
│   └── GetBenefitSummaryQuery.kt
├── application/port/out/
│   └── AnalyticsSummaryRepository.kt
├── application/service/
│   ├── AnalyticsQueryService.kt
│   └── AnalyticsProjectionService.kt
└── adapter/
    ├── in/
    │   ├── web/
    │   │   └── AnalyticsController.kt
    │   └── event/
    │       └── AnalyticsEventHandler.kt
    └── out/
        └── persistence/
            └── AnalyticsPersistenceAdapter.kt
```

#### Group Context (가족/그룹 공유)

```
com.cardwise.group/
├── domain/
│   ├── model/
│   │   ├── LedgerGroup.kt              # Aggregate Root
│   │   ├── GroupMember.kt              # Entity (LedgerGroup 하위)
│   │   └── GroupInvitation.kt          # Entity (LedgerGroup 하위)
│   ├── event/
│   │   ├── GroupCreatedEvent.kt
│   │   ├── MemberJoinedEvent.kt
│   │   ├── MemberRemovedEvent.kt
│   │   ├── InvitationSentEvent.kt
│   │   └── InvitationAcceptedEvent.kt
│   └── exception/
│       ├── GroupNotFoundException.kt
│       └── GroupMemberLimitExceededException.kt
├── application/
│   ├── port/
│   │   ├── in/
│   │   │   ├── CreateGroupUseCase.kt
│   │   │   ├── InviteMemberUseCase.kt
│   │   │   ├── AcceptInvitationUseCase.kt
│   │   │   ├── DeclineInvitationUseCase.kt
│   │   │   ├── RemoveMemberUseCase.kt
│   │   │   ├── LeaveGroupUseCase.kt
│   │   │   ├── UpdateGroupSettingsUseCase.kt   # OWNER only
│   │   │   ├── GetGroupPaymentsQuery.kt        # 모든 멤버
│   │   │   └── GetGroupStatsQuery.kt           # 멤버별/태그별 분석
│   │   └── out/
│   │       ├── GroupRepository.kt
│   │       ├── GroupMemberRepository.kt
│   │       └── GroupInvitationRepository.kt
│   └── service/
│       ├── GroupCommandService.kt
│       └── GroupQueryService.kt
└── adapter/
    ├── in/web/
    │   ├── GroupController.kt
    │   ├── dto/
    │   │   ├── GroupRequest.kt
    │   │   └── GroupResponse.kt
    │   └── mapper/GroupMapper.kt
    └── out/
        ├── persistence/
        │   ├── GroupJpaEntity.kt
        │   ├── GroupJpaRepository.kt
        │   └── GroupPersistenceAdapter.kt
        └── messaging/
            └── GroupEventPublisher.kt
```

### 3.3 공유 커널 (Shared Kernel)

```
com.cardwise.common/
├── model/
│   ├── Money.kt                     # 금액 Value Object
│   ├── YearMonth.kt                 # 연월 Value Object
│   └── AccountId.kt                 # 사용자 식별자 Value Object
├── event/
│   └── DomainEvent.kt               # 도메인 이벤트 기반 인터페이스
└── exception/
    ├── BusinessException.kt         # 비즈니스 예외 기반 클래스
    └── ErrorCode.kt                 # 공통 에러 코드
```

---

## 4. 모듈 간 통신

### 4.1 통신 방식 (MVP)

MVP 단계에서는 Kafka 없이 **Spring 인프로세스 이벤트**만 사용한다.

| 통신 유형 | 방식 | 사용 시점 |
|-----------|------|-----------|
| 모듈 내부 동기 호출 | Port 인터페이스 직접 호출 | 같은 모듈 내 계층 간 호출 |
| 모듈 간 읽기 조회 | Read-only Service 인터페이스 | Benefit -> Card/UserCard 데이터 조회 |
| 모듈 간 부수효과 | `@TransactionalEventListener(AFTER_COMMIT)` | 결제 생성 후 실적 갱신, 통계 업데이트 등 |
| 비동기 처리 | `@Async` + `@EventListener` | 알림 발송 등 비차단 처리 |

### 4.2 이벤트 흐름 예시: 결제 생성

```
[사용자] -- POST /api/payments --> [Ledger Controller]
                                        |
                                        v
                                 [PaymentCommandService]
                                        |
                                   (1) Payment 생성
                                   (2) PaymentRepository.save()
                                   (3) PaymentCreatedEvent 발행
                                        |
                              +---------+---------+
                              |         |         |
                              v         v         v
                        [UserCard]  [Analytics] [Notification]
                              |         |         |
                     (AFTER_COMMIT) (AFTER_COMMIT)  (@Async)
                              |         |         |
                       실적 갱신   통계 갱신   알림 발송
                              |
                              v
                   PerformanceUpdatedEvent 발행
                              |
                              v
                        [Analytics]
                              |
                       실적 통계 갱신
```

### 4.3 이벤트 발행/구독 패턴

```
[Application Service]
        |
        | (도메인 이벤트 생성)
        v
[Spring ApplicationEventPublisher]
        |
        | (인프로세스 전달)
        v
[@TransactionalEventListener(phase = AFTER_COMMIT)]
        |
        v
[다른 모듈의 Event Handler]
```

**핵심 규칙:**
- 이벤트 핸들러에서 실패해도 원본 트랜잭션에는 영향 없음 (AFTER_COMMIT)
- `@Async`를 사용하여 이벤트 핸들러를 별도 스레드에서 실행 가능
- 이벤트 핸들러 실패 시 로깅 + 재시도 (Spring Retry)

---

## 5. Aggregate 설계 규칙

### 5.1 기본 규칙

| 규칙 | 설명 |
|------|------|
| **ID 참조** | Aggregate 간 직접 객체 참조 금지, ID(Long/UUID)로만 참조 |
| **트랜잭션 경계** | 하나의 트랜잭션에서 하나의 Aggregate만 변경 |
| **최종 일관성** | Aggregate 간 일관성은 도메인 이벤트를 통한 Eventual Consistency |
| **불변 규칙** | Aggregate 내부 불변 규칙은 Aggregate Root가 보장 |

### 5.2 Aggregate 경계 예시

```
+------------------------------------------+
|            Payment (Aggregate)            |
|                                           |
|  Payment (Root)                           |
|    +-- paymentId: Long                    |
|    +-- userCardId: Long  <-- ID 참조      |
|    +-- amount: Money     <-- Value Object |
|    +-- paymentItems: List<PaymentItem>    |
|         +-- category: String              |
|         +-- benefitAmount: Money          |
|    +-- createdAt: LocalDateTime           |
+------------------------------------------+
         |
         | (이벤트 발행)
         v
  PaymentCreatedEvent
    +-- paymentId: Long
    +-- userCardId: Long
    +-- amount: Money
    +-- occurredAt: Instant
```

### 5.3 Shared Kernel: 공통 Value Object

모든 모듈이 공유하는 값 객체:

| Value Object | 용도 | 예시 |
|-------------|------|------|
| `Money` | 금액 표현 (amount + currency) | Money(15000, KRW) |
| `YearMonth` | 실적/혜택 기간 | YearMonth(2026, 3) |
| `AccountId` | 사용자 식별 | AccountId(UUID) |

---

## 6. Event Catalog (인프로세스 Spring Events)

### 6.1 이벤트 목록

| # | Event | Publisher | Subscriber(s) | 설명 |
|---|-------|-----------|---------------|------|
| 1 | `CrawlCompletedEvent` | Crawler | Card | 크롤링 완료, 카드 마스터 데이터 갱신 요청 |
| 2 | `CardCreatedEvent` | Card | Notification | 신규 카드 등록 알림 |
| 3 | `CardBenefitUpdatedEvent` | Card | UserCard, Benefit, Notification | 카드 혜택 정보 변경 |
| 4 | `UserCardRegisteredEvent` | UserCard | Analytics, Notification | 사용자 카드 등록 |
| 5 | `PaymentDraftCreatedEvent` | EmailParser | Ledger | 이메일 파싱 결과 -> 결제 초안 생성 |
| 6 | `PaymentCreatedEvent` | Ledger | UserCard, Analytics, Notification, Group | 결제 내역 생성 |
| 7 | `PaymentConfirmedEvent` | Ledger | UserCard, Analytics | 결제 초안 확정 |
| 8 | `PerformanceUpdatedEvent` | UserCard | Analytics, Notification | 월별 실적 변경 |
| 9 | `BenefitUsageRecordedEvent` | UserCard | Analytics | 혜택 사용 기록 |
| 10 | `EmailParsedEvent` | EmailParser | Notification | 이메일 파싱 완료 알림 |
| 11 | `VoucherExpiringEvent` | UserCard | Notification | 바우처 만료 임박 알림 |
| 12 | `GroupCreatedEvent` | Group | Notification | 그룹 생성 알림 |
| 13 | `MemberJoinedEvent` | Group | Notification | 멤버 합류 알림 |
| 14 | `InvitationSentEvent` | Group | Notification | 초대 발송 알림 |
| 15 | `InvitationAcceptedEvent` | Group | Notification | 초대 수락 알림 |
| 16 | `MemberRemovedEvent` | Group | Notification | 멤버 추방 알림 |

### 6.2 이벤트 흐름도

```
Crawler ----CrawlCompletedEvent----> Card
Card -------CardCreatedEvent-------> Notification
Card -------CardBenefitUpdatedEvent-> UserCard, Benefit, Notification
EmailParser-PaymentDraftCreatedEvent-> Ledger
EmailParser-EmailParsedEvent-------> Notification
Ledger -----PaymentCreatedEvent----> UserCard, Analytics, Notification, Group
Ledger -----PaymentConfirmedEvent--> UserCard, Analytics
UserCard ---UserCardRegisteredEvent-> Analytics, Notification
UserCard ---PerformanceUpdatedEvent-> Analytics, Notification
UserCard ---BenefitUsageRecordedEvent-> Analytics
UserCard ---VoucherExpiringEvent---> Notification
Group ------GroupCreatedEvent-----> Notification
Group ------MemberJoinedEvent----> Notification
Group ------InvitationSentEvent--> Notification
Group ------InvitationAcceptedEvent-> Notification
Group ------MemberRemovedEvent---> Notification
```

---

## 7. Module Dependency Matrix

모듈 간 의존성은 **이벤트를 통한 간접 의존**만 허용한다. 직접 호출(Direct Call)은 원칙적으로 금지하며, Benefit 모듈의 읽기 전용 조회만 예외로 허용한다.

### 7.1 이벤트 기반 의존성 (Publisher -> Subscriber)

```
                 구독자 (Subscriber)
발행자            Card  UCrd  Ldgr  Bnft  Crwl  EPrs  Noti  Anlt  Grp
(Publisher)      ----  ----  ----  ----  ----  ----  ----  ----  ----
Card              -     X     .     X     .     .     X     .     .
UserCard          .     -     .     .     .     .     X     X     .
Ledger            .     X     -     .     .     .     X     X     X
Benefit           .     .     .     -     .     .     .     .     .
Crawler           X     .     .     .     -     .     .     .     .
EmailParser       .     .     X     .     .     -     X     .     .
Notification      .     .     .     .     .     .     -     .     .
Analytics         .     .     .     .     .     .     .     -     .
Group             .     .     .     .     .     .     X     .     -

  X = 이벤트 구독 관계    . = 의존 없음    - = 자기 자신
```

**범례:**
- `UCrd` = UserCard
- `Ldgr` = Ledger
- `Bnft` = Benefit
- `Crwl` = Crawler
- `EPrs` = EmailParser
- `Noti` = Notification
- `Anlt` = Analytics
- `Grp` = Group

### 7.2 읽기 전용 조회 의존성 (예외)

```
  Benefit ----(ReadPort)----> Card      (카드/혜택 마스터 조회)
  Benefit ----(ReadPort)----> UserCard  (사용자 카드/실적 조회)
```

---

## 8. Error Handling Strategy

### 8.1 예외 계층 구조

```
BusinessException (공통 기반 클래스)
├── CardNotFoundException
├── CardAlreadyExistsException
├── UserCardNotFoundException
├── PaymentNotFoundException
├── InvalidPerformanceException
├── CrawlFailedException
├── EmailParseFailedException
└── ...각 모듈별 도메인 예외
```

### 8.2 모듈별 도메인 예외

각 모듈은 자체 `domain/exception/` 패키지에 도메인 예외를 정의한다.
예외는 `BusinessException`을 상속하며, 모듈별 에러 코드 접두사를 사용한다.

| 모듈 | 에러 코드 접두사 | 예시 |
|------|-----------------|------|
| Card | `CARD_` | CARD_NOT_FOUND, CARD_ALREADY_EXISTS |
| UserCard | `UCARD_` | UCARD_NOT_FOUND, UCARD_LIMIT_EXCEEDED |
| Ledger | `LEDGER_` | LEDGER_PAYMENT_NOT_FOUND |
| Crawler | `CRAWL_` | CRAWL_SOURCE_UNAVAILABLE |
| EmailParser | `EMAIL_` | EMAIL_PARSE_FAILED |
| Group | `GROUP_` | GROUP_NOT_FOUND, GROUP_MEMBER_LIMIT_EXCEEDED |

### 8.3 Global Exception Handler

```
@ControllerAdvice
GlobalExceptionHandler
├── handleBusinessException()    -> 400 Bad Request
├── handleNotFoundException()    -> 404 Not Found
├── handleValidationException()  -> 422 Unprocessable Entity
└── handleUnexpectedException()  -> 500 Internal Server Error
```

### 8.4 표준 에러 응답 형식

```
{
  "code": "CARD_NOT_FOUND",
  "message": "카드를 찾을 수 없습니다. (cardId: 123)",
  "timestamp": "2026-03-17T10:30:00Z"
}
```

### 8.5 이벤트 핸들러 에러 처리

- 이벤트 핸들러 실패 시 원본 트랜잭션에는 영향을 주지 않는다 (AFTER_COMMIT).
- 실패한 이벤트는 로깅 후 Spring Retry로 재시도한다.
- 최대 재시도 횟수 초과 시 실패 로그 테이블에 기록한다.

---

## 9. MSA Migration Path (향후 계획)

### 9.1 현재 상태 (MVP)

```
+-----------------------------------------------+
|              Single Deployment Unit            |
|                                                |
|  [Card] [UserCard] [Ledger] [Benefit] [Group] ...|
|                                                |
|  통신: Spring @EventListener (인프로세스)       |
|  DB: 단일 PostgreSQL (스키마 분리)              |
|  배포: 단일 Spring Boot 애플리케이션             |
+-----------------------------------------------+
```

### 9.2 MSA 전환 조건

다음 조건 중 하나 이상 충족 시 MSA 전환을 검토한다:

- 개발팀 규모가 3명 이상으로 성장
- 단일 인스턴스로 트래픽 처리가 불가능
- 특정 모듈의 독립적 스케일링이 필요
- 모듈별 기술 스택 차별화가 필요

### 9.3 전환 방향

```
MVP (현재)                          MSA (향후)
+-------------------+              +-------------------+
| Spring @Event     |    --->      | Kafka Topic       |
| (인프로세스)       |              | (분산 메시징)      |
+-------------------+              +-------------------+
| 단일 PostgreSQL   |    --->      | DB per Service    |
| (스키마 분리)      |              | (물리적 분리)      |
+-------------------+              +-------------------+
| 단일 JAR 배포     |    --->      | 서비스별 독립 배포  |
+-------------------+              +-------------------+
```

전환 시 필요한 패턴:
- **Transactional Outbox** — 이벤트 발행 보장
- **Kafka** — 모듈 간 비동기 메시징
- **Saga** — 분산 트랜잭션 관리

상세 설계는 `docs/archive/eda-kafka-design.md` 참조.

---

> 최종 갱신: 2026-03-18

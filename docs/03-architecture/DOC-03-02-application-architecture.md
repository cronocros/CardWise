# CardWise 애플리케이션 아키텍처 (DOC-03-02)

> **상태**: v3.7 현행화 완료 (헥사고날 아키텍처 및 CQRS 패턴 풀 적용)

본 문서는 CardWise 시스템의 구조적 무결성과 기술적 격리를 보장하기 위한 **애플리케이션 아키텍처 명세(Ground Truth)**입니다.

---

## 1. 아키텍처 핵심 원칙 (ARCH-xx)

| 코드 | 아키텍처 원칙 (Principle) | 세부 내용 |
|---|---------|------|
| **ARCH-01** | **헥사고날 아키텍처 (Ports & Adapters)** | 비즈니스 로직(Domain/Application)을 외부 기술(Adapter)로부터 격리. |
| **ARCH-02** | **CQRS (Read-Write Separation)** | 상태를 변경하는 Command와 데이터를 조회하는 Query를 분리하여 성능 최적화. |
| **ARCH-03** | **도메인 중심 설계 (DDD Aggregate)** | 11개 도메인 모듈을 독립적인 애그리거트 단위로 관리 및 ID 기반 참조. |
| **ARCH-04** | **이벤트 기반 통신 (Domain Events)** | 모듈 간 직접 결합을 피하기 위해 Spring `ApplicationEvent`를 통한 연동. |

---

## 2. 헥사고날 표준 모듈 구조 (Standard Layout)

모든 모듈(`com.cardwise.{module}`)은 아래의 표준 레이아웃을 엄격히 준수합니다.

```
com.cardwise.{module}/
├── adapter/
│   ├── in/
│   │   └── web/            # ADPT-WEB: REST Controller, Req/Res DTO
│   └── out/
│       └── persistence/    # ADPT-PERSIST: PersistenceAdapter, JpaEntity, Repository
├── application/
│   ├── port/
│   │   ├── in/             # PORT-IN: UseCase 인터페이스 (Command/Query 분리)
│   │   └── out/            # PORT-OUT: PersistencePort 인터페이스
│   ├── service/            # SVC: CommandService, QueryService (UseCase 구현체)
│   └── dto/                # SVC-DTO: 서비스 간 전달 및 통계 목적의 DTO
└── domain/
    ├── model/              # DOMAIN-MODEL: 순수 Kotlin 엔티티 (비즈니스 규칙 포함)
    └── event/              # DOMAIN-EVENT: 발행되는 도메인 이벤트 정의
```

---

## 3. 도메인 모듈 정의 (11개 핵심 도메인)

CardWise는 총 11개의 독립적인 도메인 모듈로 구성되며, 각 모듈은 고유의 `Bounded Context`를 가집니다.

| 모듈명 | 패키지 경로 | 주요 역할 |
| :--- | :--- | :--- |
| **Card** | `com.cardwise.card` | 카드 상품 정보, 브랜드, 혜택 템플릿 마스터 관리 |
| **Ledger** | `com.cardwise.ledger` | 개인/그룹 결제 내역(Payment), 가맹점 매칭, 카테고리 분류 |
| **Community** | `com.cardwise.community` | 사용자간 소통 피드, 좋아요/북마크, 댓글 처리 |
| **Voucher** | `com.cardwise.voucher` | 보유 카드 바우처 상태, 잔여 횟수, 유효기간 추적 |
| **Performance**| `com.cardwise.performance` | 카드별 실적 달성 현황 및 구간(Tier) 상승/하락 계산 |
| **Account** | `com.cardwise.account` | 회원 프로필, 지갑, 업적(경험치, 뱃지) 시스템 관리 |
| **Benefit** | `com.cardwise.benefit` | 실시간 혜택 추천 쿼리 및 AI 소비 인사이트 리포팅 |
| **Analytics** | `com.cardwise.analytics` | 대시보드 통계용 비정규화 데이터 집계 및 가공 |
| **Notification**| `com.cardwise.notification` | 인앱/푸시 알림 발송 및 사용자 알림 설정 관리 |
| **Group** | `com.cardwise.group` | 가족/공유 가계부 그룹 생성 및 멤버 권한 제어 |
| **Support** | `com.cardwise.support` | 고객 센터, FAQ, 유저 환경 설정 및 테마 정보 |

---

## 4. 데이터 흐름 및 보안 전략 (Data Flow)

### 4.1 읽기/쓰기 분리 (CQRS)
- **Command Path**: Controller -> UseCase (In-Port) -> CommandService -> PersistencePort (Out-Port) -> Adapter -> Domain Model 저장.
- **Query Path**: Controller -> QueryUseCase (In-Port) -> QueryService -> PersistencePort -> Adapter -> DTO 반환 (도메인 모델 생성 생략 가능).

### 4.2 계계간 통신 (Inter-Module)
- 모듈 간 직접적인 `Service` 호출을 배제하고 `ApplicationEventPublisher`를 통한 비결합 통신 지향.
- 예: `PaymentCreatedEvent` 발행 시 `PerformanceService`와 `AnalyticsService`에서 각각 구독 처리.

### 4.3 보안 및 인증 (Security)
- **BFF 패턴**: Next.js Route Handlers(API Proxy)를 통해 백엔드 API와 통신하며, JWT 검증 및 `X-Account-Id` 주입 수행.
- **RLS**: Supabase 레벨에서 `Row Level Security`를 적용하여 데이터 물리적 격리 보장. [DOC-03-05-auth-design.md](DOC-03-05-auth-design.md) 참조.

---

## 5. 인프라스트럭처 연동 (Infrastructure)

- **Database**: Supabase PostgreSQL (Remote)
- **Caching**: Upstash Redis (Serverless) - 실시간 혜택 추천 및 대시보드 데이터 캐싱.
- **Container**: Docker 기반 로컬 개발 환경 및 Vercel/Cloud Run 배포 환경.

---

## 🔗 연관 설계 문서 (Related Specs)

- **[DOC-03-01] [DOC-03-01-system-architecture.md](DOC-03-01-system-architecture.md)**: 전체 서버 구성도
- **[DOC-03-03] [DOC-03-03-schema-design.md](DOC-03-03-schema-design.md)**: 통합 DB 엔티티 설계서
- **[DOC-03-04] [DOC-03-04-api-design.md](DOC-03-04-api-design.md)**: 모듈별 REST API 상세
- **[DOC-03-06] [DOC-03-06-frontend-architecture.md](DOC-03-06-frontend-architecture.md)**: 프론트엔드 구조 및 BFF 상세

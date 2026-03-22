# CardWise EDA 및 Kafka 설계 (DOC-07-13)

> **상태**: 아카이브 (MVP에서는 사용하지 않음)
> **사유**: MVP 단계에서 Kafka/Outbox Pattern은 오버엔지니어링. Spring @EventListener로 충분.
> **전환 시점**: 팀 3명 이상, 또는 트래픽이 단일 인스턴스 한계 초과 시
> **보관 일자**: 2026-03-17

---

## MVP vs Phase 2 비교

| 항목 | MVP (Phase 1) | Phase 2 (이 문서) |
|------|--------------|-------------------|
| 이벤트 전달 | Spring @EventListener | Kafka |
| 트랜잭션 보장 | @TransactionalEventListener | Outbox Pattern |
| 모듈 배포 | 단일 JAR | 개별 서비스 |
| 인프라 | Spring 내장 | Kafka Cluster (MSK/Confluent) |

---

## Kafka Topic 설계

| Topic | Publisher | Consumer(s) | Partition Key |
|-------|----------|-------------|---------------|
| cardwise.payment.created | ledger-svc | usercard-svc, benefit-svc, analytics-svc | accountId |
| cardwise.payment.updated | ledger-svc | usercard-svc, benefit-svc, analytics-svc | accountId |
| cardwise.payment.deleted | ledger-svc | usercard-svc, benefit-svc, analytics-svc | accountId |
| cardwise.voucher.used | voucher-svc | analytics-svc | accountId |
| cardwise.voucher.cancelled | voucher-svc | analytics-svc | accountId |
| cardwise.usercard.registered | usercard-svc | notification-svc | accountId |
| cardwise.card.data-changed | card-svc, crawler-svc | benefit-svc (캐시 무효화) | cardId |
| cardwise.voucher.expiring | scheduler | notification-svc | accountId |
| cardwise.performance.tier-changed | usercard-svc | notification-svc, benefit-svc | accountId |
| cardwise.draft.approved | crawler-svc | card-svc | cardCompanyId |
| cardwise.payment-draft.created | email-parser-svc | notification-svc | accountId |

---

## Outbox Pattern

DB 쓰기와 이벤트 발행의 원자성 보장:

```
1. 비즈니스 데이터 + outbox 테이블에 동시 INSERT (같은 트랜잭션)
2. 별도 폴러(또는 CDC)가 outbox 읽어서 Kafka로 발행
3. 발행 완료 시 outbox 레코드 삭제/마킹
```

### outbox 테이블

```sql
CREATE TABLE outbox_event (
  outbox_event_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  aggregate_type      VARCHAR(100)    NOT NULL,   -- 'Payment', 'UserCard' 등
  aggregate_id        VARCHAR(100)    NOT NULL,   -- 대상 엔티티 ID
  event_type          VARCHAR(200)    NOT NULL,   -- 'PaymentCreatedEvent' 등
  payload             JSONB           NOT NULL,   -- 이벤트 데이터
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
  published_at        TIMESTAMPTZ,                -- 발행 완료 시각
  is_published        BOOLEAN         NOT NULL DEFAULT false
);

CREATE INDEX idx_outbox_unpublished
  ON outbox_event(is_published, created_at)
  WHERE is_published = false;
```

---

## 전환 전략 (Adapter 교체)

```
Phase 1 (현재):
  EventPublisherPort (interface)
    +-- SpringEventPublisherAdapter (구현체)

Phase 2 (전환):
  EventPublisherPort (interface)       -- 동일 인터페이스
    +-- KafkaEventPublisherAdapter     -- Adapter만 교체

  EventListenerPort (interface)
    +-- SpringEventListenerAdapter     -- Phase 1
    +-- KafkaEventListenerAdapter      -- Phase 2 교체
```

Domain/Application 코드 변경 없이 Adapter만 교체.

---

## 이벤트 스키마 (CloudEvents 호환)

```json
{
  "specversion": "1.0",
  "type": "cardwise.payment.created",
  "source": "/ledger-service",
  "id": "uuid",
  "time": "2026-03-17T12:00:00Z",
  "datacontenttype": "application/json",
  "data": {
    "paymentId": 12345,
    "accountId": "uuid",
    "userCardId": 67890,
    "krwAmount": 50000,
    "currency": "KRW"
  }
}
```

---

## Consumer Group 설계

| Consumer Group | Topics | 목적 |
|---------------|--------|------|
| usercard-performance-updater | payment.created/updated/deleted | 실적 갱신 |
| benefit-usage-updater | payment.created/updated/deleted | 혜택 한도 소진 |
| analytics-aggregator | payment.*, voucher.* | 통계 집계 |
| notification-sender | *.registered, *.expiring, *.tier-changed, payment-draft.created | 알림 발송 |
| cache-invalidator | card.data-changed | Redis 캐시 무효화 |

---

## MSA 배포 구조 (Phase 2)

```
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
               |   Redis     |     |  Kafka   |
               |  (Upstash)  |     | (MSK)    |
               +-------------+     +----------+
```

---

## 전환 체크리스트

Phase 2 전환 시 확인할 사항:

- [ ] 각 모듈을 독립 서비스로 분리 (별도 JAR/컨테이너)
- [ ] Kafka 클러스터 설정 (AWS MSK 또는 Confluent Cloud)
- [ ] outbox 테이블 마이그레이션 생성
- [ ] KafkaEventPublisherAdapter 구현
- [ ] KafkaEventListenerAdapter 구현
- [ ] Consumer Group 설정 및 offset 관리
- [ ] Dead Letter Queue (DLQ) 설정
- [ ] API Gateway (Spring Cloud Gateway) 설정
- [ ] 서비스 디스커버리 설정
- [ ] 분산 트레이싱 (Zipkin/Jaeger) 도입
- [ ] 서비스별 DB 스키마 분리 검토

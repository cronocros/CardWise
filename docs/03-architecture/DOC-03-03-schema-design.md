# CardWise 통합 데이터베이스 설계 (DOC-03-03)

> **최종 갱신**: 2026-03-22  
> **상태**: v3.7 현행화 완료 (헥사고날 아키텍처 및 11개 도메인 전체 반영)

CardWise는 **Supabase PostgreSQL**을 기반으로 하며, 각 도메인 모듈은 독립적인 `Bounded Context`를 전제로 설계되었습니다.

---

## 1. 데이터 설계 원칙 (DB-xx)

| 코드 | 설계 원칙 (DB Principle) | 상세 상세 |
|---|---------|------|
| **DB-01** | **UUID PK 사용** | 보안과 결합도 완화가 중요한 `account` 및 `post` 등은 UUID PK를 사용함. |
| **DB-02** | **Soft Delete 적용** | `deleted_at` 컬럼을 통한 논리 삭제를 기본으로 하여 데이터 가역성 확보. |
| **DB-03** | **JSONB 동적 필드** | 카드사별 특수한 혜택 규칙(`card_rules`)이나 태그 배열 저장에 활용. |
| **DB-04** | **정밀도 유지** | 모든 금액(`amount`)은 `BIGINT` 정수형으로 저장하여 부동소수점 오차 방지. |

---

## 2. 도메인별 핵심 테이블 명세 (SCH-xx)

### 2.1 커뮤니티 도메인 (SCH-COMM - F-16)
- `community_post`: 게시글 본문 및 메타정보 (UUID PK).
- `community_comment`: 게시글 대응 댓글 정보.
- `community_post_like`: 좋아요 상태 고유 인덱스 (Account <-> Post).
- `community_post_bookmark`: 스크랩 상태 고유 인덱스.

### 2.2 카드 및 혜택 도메인 (SCH-CARD - F-01/F-05)
- `card_issuer`: 카드사 정보 (신한, 현대, 국민 등).
- `card`: 카드 상품 마스터 (상품명, 이미지 URL, 연회비).
- `card_benefit_template`: 혜택 명세 템플릿 (할인율, 제한 조건).
- `user_card`: 사용자가 등록한 카드 인스턴스 (발급일, 별칭 포함).

### 2.3 가계부 도메인 (SCH-LEDGER - F-02/F-03)
- `payment`: 결제 총괄 정보 (총액, 통화, 일시, 가맹점).
- `payment_item`: 상세 품목 정보 (품목명, 개별 가격, 카테고리 매칭).
- `tag`: 사용자가 직접 생성한 분류 태그 마스터.
- `payment_item_tag`: 품목과 태그 간의 N:M 매핑 테이블.

---

## 3. 업적 및 레벨 시스템 (SCH-GAME - F-17)

### 3.1 경험치 및 등급 (SCH-GAME-01)
- `account_profile`: `level`, `xp`, `total_spent_krw` 등을 포함한 프로필 확장 정보.
- `level_exp_table`: 레벨당 필요 경험치(XP) 기준표.

### 3.2 뱃지 시스템 (SCH-GAME-02)
- `badge`: 20종의 업적 마스터 (뱃지명, 아이콘 URL, 획득 조건).
- `user_badge`: 획득한 뱃지 이력 및 대표 뱃지 설정 정보.

---

## 4. 인프라 연동 상세

- **RLS (Row Level Security)**: 모든 테이블에 `account_id` 기반의 RLS 정책을 적용하여 사용자 간 데이터 침범을 물리적으로 방어함. [DOC-03-05](DOC-03-05-auth-design.md) 참조.
- **캐싱 전략**: 실시간 통계 및 추천 쿼리는 `Analytics` 도메인의 집계 테이블 및 Upstash Redis를 활용함.

---

## 🔗 연관 설계 문서 (Related Specs)

- **[DOC-01-01] [DOC-01-01-functional-requirements.md](../01-analysis/DOC-01-01-functional-requirements.md)**: 전체 시스템 기획 및 요건
- **[DOC-03-02] [DOC-03-02-application-architecture.md](DOC-03-02-application-architecture.md)**: 헥사고날 아키텍처 상세
- **[DOC-03-07] [DOC-03-07-data-dictionary.md](DOC-03-07-data-dictionary.md)**: 데이터 용어 및 공통 코드 정의서
- **[DOC-00-02] [STATUS.md](../STATUS.md)**: 현재 구현 현황 및 로드맵

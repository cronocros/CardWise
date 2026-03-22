# CardWise 요구사항 및 기능 명세 (DOC-01-01)

> **상태**: v3.7 현행화 완료 (헥사고날 아키텍처 및 커뮤니티 도메인 반영)

## 0. 프로젝트 개요 (Context)

CardWise는 한국 신용카드/체크카드 혜택 관리 플랫폼이다. **Hexagonal Architecture**와 **CQRS** 패턴을 기반으로 견고한 백엔드를 구축하였으며, 사용자가 보유한 카드의 혜택(할인, 적립, 바우처 등)을 극대화할 수 있도록 지원한다.

---

## 1. 핵심 비즈니스 요구사항 (R-xx)

| 코드 | 요구사항 (Requirement) | 상세 설명 |
|---|---------|------|
| **R-01** | **카드 혜택 가시화** | 내가 가진 카드의 바우처 및 베네핏 정보를 한눈에 파악하고 실시간 상태를 확인 |
| **R-02** | **실적 자동 추적** | 결제 내역을 기반으로 월간/연간 실적 달성도를 자동 계산하여 다음 구간 안내 |
| **R-03** | **스마트 가계부 관리** | 수입/지출 기록, 혜택 적용 확인, 다중 태그를 통한 소비 패턴 분석 |
| **R-04** | **지능형 혜택 추천** | 가맹점/카테고리 검색 시 현재 실적과 한도를 고려한 최적 카드 추천 |
| **R-05** | **소셜 정보 공유** | 사용자 간의 카드 활용 팁, 절약 노하우를 공유하는 커뮤니티 생태계 구축 |
| **R-06** | **게이미피케이션** | 레벨, 경험치, 뱃지 시스템을 통해 자산 관리의 지속적 관심 유도 |

---

## 2. 도메인 핵심 개념 (Core Domain Concepts)

### 2.1 Benefit vs Voucher 분리 (C-01)
- **Benefit (자동)**: 결제 시 자동 적용되는 혜택 (할인, 적립 등). 가계부와 직접 연결.
- **Voucher (수동)**: 별도 사용 행위가 필요한 혜택 (라운지 이용권, 호텔 쿠폰 등).

### 2.2 실적 기산 방식 (C-02)
- 카드 발급일(`issued_at`) 기준 연간 실적 산정.
- 전월 실적 조건에 따른 혜택 구간(Tier)의 동적 변화 대응.

### 2.3 계층형 결제 구조 (C-03)
- 1건의 결제(Payment) -> N개의 품목(PaymentItem).
- 품목별 카테고리 분류 및 개별 혜택 매칭 가능.

---

## 3. 기능 명세 상세 (F-xx)

기능별 상세 화면 명세 및 제약 사항은 아래 개별 문서를 참조한다. (07-spec 폴더 위치)

| 코드 | 기능명 (Feature) | 설명 | 상세 명세서 (Link) |
|------|----------------|------|-------------------|
| **F-01** | 카드 관리 | 카드 등록(지능형 검색), 발급일/별칭 관리 | [DOC-07-02](../07-spec/DOC-07-02-card-management.md) |
| **F-02** | 스마트 가계부 | 수동/해외 결제 입력, 멀티 컬러 캘린더 | [DOC-07-03](../07-spec/DOC-07-03-ledger-specification.md) |
| **F-03** | 가계부 인박스 | 확인 필요 항목(환율, 중복의심) 관리 | [DOC-07-04](../07-spec/DOC-07-04-ledger-inbox.md) |
| **F-04** | 실적 대시보드 | 구간 달성도 추적 및 다음 티어 가이드 | [DOC-07-05](../07-spec/DOC-07-05-performance-tracking.md) |
| **F-05** | AI 혜택 검색 | 가맹점 검색 및 최적 혜택 카드 추천 | [DOC-07-06](../07-spec/DOC-07-06-benefit-search.md) |
| **F-06** | 바우처 센터 | 바우처 유효기간 관리 및 사용/취소 로그 | [DOC-07-07](../07-spec/DOC-07-07-voucher-management.md) |
| **F-07** | 알림 시스템 | 실적 리마인더, 바우처 만료 예고 알림 | [DOC-07-08](../07-spec/DOC-07-08-notification.md) |
| **F-08** | 통계 대시보드 | 카테고리/태그별 지출 분석 및 인사이트 | [DOC-07-09](../07-spec/DOC-07-09-dashboard.md) |
| **F-12** | 그룹 가계부 | 가족/공유 가계부 및 멤버십 권한 관리 | [DOC-07-10](../07-spec/DOC-07-10-group-ledger.md) |
| **F-15** | 태그 시스템 | 자유로운 태그 부착 및 교차 분석 지원 | [DOC-07-12](../07-spec/DOC-07-12-tag-system.md) |
| **F-16** | 커뮤니티 | 게시글, 댓글, 좋아요, 북마크 인터랙션 | [DOC-07-11](../07-spec/DOC-07-11-community-specification.md) |
| **F-17** | 업적 시스템 | 경험치 기반 레벨업 및 20종 뱃지 수집 | [DOC-03-09](../03-architecture/DOC-03-09-gamification-system.md) |

---

## 4. 프로세스 흐름 (Key Flows)

### 4.1 지능형 카드 등록 Flow (P-01)
1. **[Search]**: 카드사/카드명으로 검색.
2. **[Select]**: 계층형 선택기(Issuer -> Brand -> Product)를 통해 확정.
3. **[Initialize]**: `UserCard` 생성 시 연관된 `Voucher`, `Performance` 인스턴스 자동 초기화.
4. **[Refer]**: 상세 내용은 [DOC-07-02](../07-spec/DOC-07-02-card-management.md) 참조.

### 4.2 가계부 입력 & 혜택 매칭 Flow (P-02)
1. **[Entry]**: 날짜, 카드, 총액 입력 (해외 결제 시 통화 환산 지원).
2. **[Matching]**: 가맹점명 전처리를 통해 카테고리 자동 분류.
3. **[Apply]**: 실적 구간에 따른 적용 가능 혜택 자동 추천 및 한도 차감.
4. **[Refer]**: 상세 내용은 [DOC-07-03](../07-spec/DOC-07-03-ledger-specification.md) 참조.

---

## 5. 비기능 요구사항 (Quality Attributes)

- **Scalability**: 헥사고날 아키텍처를 통한 도메인별 독립적 확장성 확보.
- **Responsiveness**: 주요 통계 및 집계 쿼리 조회 시 Redis 캐시 활용 (TTL 30m).
- **Security**: Supabase RLS(Row Level Security)를 통한 데이터 격리 철저.
- **상세 내용**: [DOC-01-02-non-functional-requirements.md](DOC-01-02-non-functional-requirements.md) 참조.

---

## 🔗 연관 문서 (Related Docs)

- **[DOC-00-02] [STATUS.md](../STATUS.md)**: 현재 구현 진척도 및 UX 고도화 현황
- **[DOC-03-02] [DOC-03-02-application-architecture.md](../03-architecture/DOC-03-02-application-architecture.md)**: 시스템 아키텍처 상세
- **[DOC-01-03] [DOC-01-03-feature-matrix.md](DOC-01-03-feature-matrix.md)**: 전체 기능 구현 대조표

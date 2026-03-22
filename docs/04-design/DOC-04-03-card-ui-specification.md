# CardWise 카드 브랜드 및 등급 체계 명세 (DOC-04-03)

> **상태**: v3.7 현행화 완료 (브랜드/등급 시스템 표준화)

CardWise v4.0에서는 글로벌 스탠다드에 맞춘 해외 제휴 브랜드 및 카드 등급 체계를 도입하여 데이터의 전문성과 시각적 완성도를 높입니다.

---

## 1. 해외 제휴 브랜드 (International Brands - BRAND-xx)

모든 카드는 다음 중 하나의 해외 제휴 브랜드를 가질 수 있으며, 카드 전면에 해당 로고가 고해상도로 표시됩니다.

| 코드 | 브랜드명 | 특징 |
|:---:|:---|:---|
| **B-01** | **Visa** | 글로벌 점유율 1위, 범용성 최상 |
| **B-02** | **Mastercard** | 전 세계 어디서나 안정적인 결제 |
| **B-03** | **American Express** | 프리미엄 서비스 및 특화 혜택 |
| **B-04** | **UnionPay (CUP)** | 아시아권 특화 혜택 |
| **B-05** | **JCB** | 일본 및 아시아 태평양 지역 혜택 |
| **B-06** | **Diners Club** | 프리미엄 라운지 및 여행 혜택 |

---

## 2. 카드 등급 체계 (Card Tiers - TIER-xx)

카드별 혜택의 수준을 결정하는 등급 체계를 다음과 같이 정립하여 UI에 반영합니다.

| 코드 | 등급 (Tier) | 특징 | 시각적 표현 (UI) |
| :--- | :--- | :--- | :--- |
| **T-01** | **Classic/Standard** | 기본 혜택 중심 | 깔끔한 단색 또는 심플 그라데이션 |
| **T-02** | **Gold** | 우대 혜택 제공 | 골드 엠블럼 및 금릿 반사 효과 |
| **T-03** | **Platinum** | 프리미엄 서비스 | 플래티넘 로고, 글래스모피즘 효과 |
| **T-04** | **Signature/World** | 최상위 고객 대상 | 고급스러운 텍스처, 은은한 발광 효과 |
| **T-05** | **Infinite/World Elite** | VVIP 초프리미엄 | 다이아몬드 포인트, 다크 프리미엄 테마 |

---

## 3. 카드 상호작용 및 UI (Interaction - UI-xx)

### 3.1 3D Flip 애니메이션 (UI-01)
- **앞면 (Front)**: 브랜드 로고, 카드 번호(마스킹), 만료일, 등급 라벨 노출.
- **뒷면 (Back)**: 카드 이미지 클릭 시 CSS 3D Flip 애니메이션과 함께 전환. 해당 카드의 **TOP 3 핵심 혜택**과 **카드 관리 메뉴** 노출.

### 3.2 등급별 다이내믹 그라데이션 (UI-02)
- 등급 코드(`T-xx`)에 따라 테일윈드 설정 또는 인라인 스타일을 통해 카드 배경 그라데이션이 동적으로 바뀝니다.

---

## 4. 데이터 연동 구조 (Implementation)

- **도메인 모델**: `com.cardwise.card.domain.model.CardBrand` 및 `CardTier` ENUM 활용.
- **DB 스키마**: `card` 테이블의 `brand` 및 `tier` 컬럼에 매핑. [DOC-03-03-schema-design.md](../03-architecture/DOC-03-03-schema-design.md) 참조.

---

## 🔗 연관 문서 (Related Docs)

- **[DOC-07-02] [DOC-07-02-card-management.md](../07-spec/DOC-07-02-card-management.md)**: 카드 관리 전체 기능 명세
- **[DOC-04-01] [DOC-04-01-design-system.md](DOC-04-01-design-system.md)**: 컬러 토큰 및 타이포그래피 가이드
- **[DOC-00-02] [STATUS.md](../STATUS.md)**: 프로젝트 종합 현황

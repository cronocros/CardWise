# CardWise 프로젝트 세부 태스크 (DOC-02-01)

> **최종 갱신**: 2026-03-22  
> **상태**: v3.7 아키텍처 리팩토링 및 커뮤니티 통합 완료 (Next Priority 설정)

이 문서는 CardWise 프로젝트의 세부 구현 태스크를 기능 코드(`F-xx`)와 연동하여 관리하는 문서입니다.

---

## 🏗️ 상위 아키텍처 태스크 (ARCH-xx)

| 코드 | 태스크명 | 우선순위 | 상태 | 비고 |
|:---:|:---|:---:|:---:|:---|
| **ARCH-01** | 전 도메인 헥사고날 리팩토링 | - | ✅ DONE | [DOC-03-02](../03-architecture/DOC-03-02-application-architecture.md) |
| **ARCH-02** | CQRS 패턴 및 Command/Query 분리 | - | ✅ DONE | 전 모듈 적용 완료 |
| **ARCH-03** | 도메인 이벤트 (Spring Event) 기반 비결합 | - | ✅ DONE | 모듈 간 의존성 제거 완료 |
| **ARCH-04** | Supabase RLS 보안 정책 강화 | - | ✅ DONE | [DOC-03-03](../03-architecture/DOC-03-03-schema-design.md) |

---

## 📲 도메인별 기능 태스크 (F-xx)

### 💳 카드 및 실적 (F-01, F-04, F-06)
- [x] **[F-01-01]** 지능형 카드 등록 (계층형 선택기) 구현 ✅
- [x] **[F-01-02]** 카드 검색 및 마스터 데이터 연동 ✅
- [x] **[F-04-01]** 실적 구간 달성도 계산 엔진 및 대시보드 ✅
- [x] **[F-06-01]** 바우처 목록/상세 및 사용/취소 로직 ✅
- [ ] **[F-04-03]** 실적 제외 항목 수동 토글 기능 (P3) ❌
- [ ] **[F-04-04]** 실적 구간 변경 시 축하 컨페티 모달 (P2) ❌

### 💸 가계부 (F-02, F-03, F-15)
- [x] **[F-02-01]** 멀티 컬러 도트 캘린더 UX 구현 ✅
- [x] **[F-02-02]** 수입/지출 수동 입력 및 품목 상세 연동 ✅
- [x] **[F-02-03]** 해외 통화(FX) 입력 및 환율 변환 로직 ✅
- [x] **[F-03-01]** 가계부 인박스(Pending Actions) 시스템 ✅
- [x] **[F-15-01]** 전역 태깅 시스템 및 대시보드 연동 ✅
- [ ] **[F-02-04]** 영수증 OCR(AI) 자동 입력 연동 (P2) ❌

### 💬 커뮤니티 및 업적 (F-16, F-17)
- [x] **[F-16-01]** 실시간 피드 및 카테고리 필터링 ✅
- [x] **[F-16-02]** 게시글/댓글 CRUD 및 백엔드 실연동 ✅
- [x] **[F-16-04]** 좋아요/북마크 실시간 반응 연동 ✅
- [x] **[F-17-01]** 레벨, 경험치(XP), 20종 뱃지 시스템 ✅

---

## 🛠️ 인프라 및 기타 (INFRA-xx)

| 코드 | 태스크명 | 우선순위 | 상태 | 비고 |
|:---:|:---|:---:|:---:|:---|
| **INFRA-01** | Vercel & Cloud Run 배포 자동화 | 🔴 P1 | ✅ DONE | [DOC-05-01](../05-ops/DOC-05-01-deployment-guide.md) |
| **INFRA-02** | Upstash Redis 캐싱 최적화 | 🟡 P2 | ✅ DONE | 혜택/통계 쿼리 적용 |
| **INFRA-03** | Google/Kakao 소셜 로그인 연동 | 🔴 P1 | ❌ TODO | [DOC-03-05](../03-architecture/DOC-03-05-auth-design.md) |
| **INFRA-04** | PWA 매니페스트 및 설치 유도 | 🟡 P2 | ❌ TODO | [DOC-00-02](../STATUS.md) |

---

## 🔗 연관 문서 (Quick Links)

- **[DOC-00-01] [README.md](../README.md)**: 전체 문서 가이드
- **[DOC-01-01] [DOC-01-01-functional-requirements.md](../01-analysis/DOC-01-01-functional-requirements.md)**: 요구사항 정의서
- **[DOC-03-02] [DOC-03-02-application-architecture.md](../03-architecture/DOC-03-02-application-architecture.md)**: 아키텍처 설계서

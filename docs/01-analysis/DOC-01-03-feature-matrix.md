# CardWise 기능 구현 현황 (DOC-01-03)

> **최종 업데이트**: 2026-03-22  
> **기준 버전**: v3.7 헥사고날 아키텍처 완성 및 프로젝트 최적화

이 문서는 CardWise 프로젝트의 전체 기능 구현 상태를 기능 코드(`F-xx`)별로 추적하고 대조하는 매트릭스입니다.

---

## 1. 구현 상태 범례

| 기호 | 의미 |
|------|------|
| ✅ DONE | 구현 완료 (백엔드 API + 프론트엔드 연동 완성) |
| 🔶 PARTIAL | 핵심 기능은 구현되었으나 일부 엣지케이스/고도화 미완 |
| ❌ TODO | 요구사항 설계는 완료되었으나 아직 개발 착수 전 |

---

## 2. 아키텍처 및 시스템 (ARCH)

| 코드 | 기능명 (Architecture) | 상태 | 비고 (Detailed Spec) |
|-----------|------|------|------|
| **ARCH-01** | Hexagonal Architecture 적용 | ✅ DONE | [DOC-03-02](../03-architecture/DOC-03-02-application-architecture.md) |
| **ARCH-02** | CQRS 패턴 및 Command/Query 분리 | ✅ DONE | [DOC-03-02](../03-architecture/DOC-03-02-application-architecture.md) |
| **ARCH-03** | 도메인 이벤트 핸들러 완성 | ✅ DONE | Spring ApplicationEvent 기반 연동 |
| **ARCH-04** | Supabase RLS 보안 정책 | ✅ DONE | [DOC-03-03](../03-architecture/DOC-03-03-schema-design.md) |

---

## 3. 인증 및 사용자 프로필 (AUTH)

| 코드 | 기능명 (Auth) | 상태 | 비고 (Detailed Spec) |
|-----------|------|------|------|
| **AUTH-01** | 이메일/비밀번호 회원가입 | ✅ DONE | [DOC-07-01](../07-spec/DOC-07-01-auth-specification.md) |
| **AUTH-02** | 이메일/비밀번호 로그인 | ✅ DONE | Supabase Auth 연동 |
| **AUTH-03** | 소셜 로그인 (Google/Kakao) | ❌ TODO | 인프라 설정 대기 중 |
| **AUTH-04** | 경험치(XP) 및 레벨 시스템 | ✅ DONE | [DOC-03-09](../03-architecture/DOC-03-09-gamification-system.md) |
| **AUTH-05** | 프리미엄 히어로 카드 UI | ✅ DONE | 마이페이지(Profile) 연동 완료 |

---

## 4. 카드 관리 및 실적 (CARD/PERF)

| 코드 | 기능명 (Card/Perf) | 상태 | 비고 (Detailed Spec) |
|-----------|------|------|------|
| **F-01-01** | 지능형 카드 등록 (계층 검색) | ✅ DONE | [DOC-07-02](../07-spec/DOC-07-02-card-management.md) |
| **F-01-02** | 보유 카드 목록 및 상세 | ✅ DONE | `/mobile/cards` 완성 |
| **F-04-01** | 카드별 실적 달성도 조회 | ✅ DONE | [DOC-07-05](../07-spec/DOC-07-05-performance-tracking.md) |
| **F-04-02** | 전월 실적 조건 동적 계산 | ✅ DONE | 백엔드 실적 엔진 완성 |
| **F-06-01** | 바우처 목록 및 사용 관리 | ✅ DONE | [DOC-07-07](../07-spec/DOC-07-07-voucher-management.md) |

---

## 5. 스마트 가계부 (LEDGER)

| 코드 | 기능명 (Ledger) | 상태 | 비고 (Detailed Spec) |
|-----------|------|------|------|
| **F-02-01** | 결제 내역 관리 (CRUD) | ✅ DONE | [DOC-07-03](../07-spec/DOC-07-03-ledger-specification.md) |
| **F-02-02** | 멀티 컬러 도트 캘린더 | ✅ DONE | `/mobile/ledger` 연동 |
| **F-02-03** | 해외통화 결제 (FX 지원) | ✅ DONE | 다중 통화 및 환율 입력 |
| **F-03-01** | 가계부 인박스 (대기항목) | ✅ DONE | [DOC-07-04](../07-spec/DOC-07-04-ledger-inbox.md) |
| **F-15-01** | 태그 부착 및 교차 분석 | ✅ DONE | [DOC-07-12](../07-spec/DOC-07-12-tag-system.md) |

---

## 6. 커뮤니티 및 혜택 검색 (COMM/BENEFIT)

| 코드 | 기능명 (Comm/Benefit) | 상태 | 비고 (Detailed Spec) |
|-----------|------|------|------|
| **F-16-01** | 커뮤니티 피드 (게시글/댓글) | ✅ DONE | [DOC-07-11](../07-spec/DOC-07-11-community-specification.md) |
| **F-16-02** | 포스트 좋아요/북마크 기능 | ✅ DONE | 백엔드 실연동 완료 |
| **F-05-01** | AI 가맹점 혜택 검색 | ✅ DONE | [DOC-07-06](../07-spec/DOC-07-06-benefit-search.md) |
| **F-05-02** | 내 카드 기준 최적 추천 추천 | ✅ DONE | Redis 캐싱 기반 고속 추천 |

---

## 7. 전체 구현 요약 (Summary)

| 도메인 | 완성도 | 상태 |
|-------|--------|---|
| **Architecture** | 100% | ✅ DONE |
| **Auth/Profile** | 95% | ✅ DONE |
| **Card/Voucher** | 100% | ✅ DONE |
| **Ledger (가계부)** | 100% | ✅ DONE |
| **Community** | 100% | ✅ DONE |
| **Analytics/Insights** | 100% | ✅ DONE |

---

## 🔗 연관 종합 문서 (Summary Docs)

- **[DOC-01-01] [DOC-01-01-functional-requirements.md](DOC-01-01-functional-requirements.md)**: 전체 요구사항 및 기획서
- **[DOC-00-02] [STATUS.md](../STATUS.md)**: 프로젝트 현황 및 로드맵
- **[DOC-03-02] [DOC-03-02-application-architecture.md](../03-architecture/DOC-03-02-application-architecture.md)**: 애플리케이션 설계서

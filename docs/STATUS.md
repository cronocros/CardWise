# CardWise - Project Status & Handoff

최종 갱신: 2026-03-19
갱신자: Codex

## 현재 상태

- 현재 단계: Phase 1 구현 및 정합화
- 활성 브랜치: `codex/integration-phase1`
- 라이브 대시보드: `http://127.0.0.1:4173/`
- 사용자 앱: `http://127.0.0.1:3000/`
- 백엔드 헬스: `http://127.0.0.1:8080/actuator/health`
- 원격 Supabase 부트 스모크: 완료

## 이번 단계에서 완료된 범위

1. 공통 추적판과 라이브 대시보드
   - `ops/dashboard/work-items.json` 단일 상태 파일 기반으로 터미널/웹 대시보드 동기화
   - 시계, 마지막 갱신, 다음 갱신 카운트다운, Quick Links, Swagger 링크 반영
2. 백엔드 MVP 구현
   - F2/F3: 인박스, 결제 보정, 대기 작업 카운트
   - F4: 카드별 실적, 구간, 유예, 특별기간, 바우처 해금
   - F6: 활성/만료 임박 바우처, 이력
   - F8 일부: 월간/카드/카테고리/태그/추이 집계 API, 태그 교차 분석 API
3. 프론트 앱 퍼블리싱
   - 앱 우선 IA: `/dashboard`, `/cards`, `/ledger`, `/benefits`, `/vouchers`, `/settings`
   - 보조 흐름: `/inbox`, `/adjustments`, `/performance/[userCardId]`
   - 한국어 표면, Pretendard 중심 타이포, 로즈 블로섬/미니멀/글라스 스킨 구조
   - 바우처 바텀시트, 실적 마일스톤 모달, 주요 모션, 반응형 정리
4. F8 대시보드 표면 보강
   - `/dashboard`에 월간 요약, 카드별 집계, 카테고리 분포, 태그 통계, 월간 추이 반영
   - `/dashboard/tags`, `/dashboard/tags/cross` 추가
5. 플랫폼/검증
   - SpringDoc 활성화: `/swagger-ui.html`, `/v3/api-docs`
   - 원격 Supabase boot 경로 정리
   - JPA all-open 정리

## 감사 결과 문서

- 아키텍처·요구사항 체크리스트: `docs/audit/architecture-requirements-checklist.md`

## 현재 구현 기준 PASS/PARTIAL 요약

- PASS
  - F2/F3 인박스/보정
  - F4 실적 추적
  - F6 바우처 관리
  - F8 개인 대시보드 핵심 표면
  - 라이브 대시보드/메타 추적
- PARTIAL
  - F1 카드 관리: 조회 중심, 실제 등록/관리 CRUD 미완성
  - F5 혜택 검색: 화면은 있으나 실제 검색 백엔드 미완성
  - 시스템 아키텍처: Next.js/Spring/Supabase 구조는 맞지만 Redis/Rate Limit/CORS/관측성 실장 미완성
  - 프론트 BFF: 일부 라우트는 맞지만 서버 컴포넌트 직접 호출 혼재
- FAIL 또는 미구현
  - 인증/인가 실구현
  - F7 알림
  - F12 그룹 가계부
  - F8 그룹 대시보드/멤버 비교

## 가장 큰 남은 갭

1. 인증/인가
   - 현재 `SecurityConfig`는 모든 요청을 허용한다.
   - `RequestAccountIdResolver`는 개발용 기본 account_id fallback을 사용한다.
   - 설계 문서 기준으로는 가장 큰 미정합 항목이다.
2. 그룹 가계부/그룹 통계
   - F12와 F8 그룹 모드가 아직 없다.
3. 혜택 검색 백엔드
   - 프론트 표면만 존재한다.
4. 알림
   - 만료/실적 리마인더 흐름이 없다.

## 즉시 확인할 주소

- 앱 홈: `http://127.0.0.1:3000/dashboard`
- 태그 통계: `http://127.0.0.1:3000/dashboard/tags`
- 태그 교차 분석: `http://127.0.0.1:3000/dashboard/tags/cross`
- 라이브 대시보드: `http://127.0.0.1:4173/`
- Swagger UI: `http://127.0.0.1:8080/swagger-ui.html`
- OpenAPI JSON: `http://127.0.0.1:8080/v3/api-docs`

## 다음 우선순위

1. 인증/인가를 Supabase 세션 기준으로 실제 연결
2. F5 혜택 검색 백엔드와 추천 로직 구현
3. F12 그룹 가계부와 F8 그룹 통계 확장
4. F7 알림 경로 구현

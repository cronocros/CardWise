# CardWise - 실행 가능한 링크 모음

> 로컬 개발 환경 기준. 백엔드: `localhost:8080`, 프론트엔드: `localhost:3000`  
> 최종 갱신: 2026-03-20

---

## 🖥️ 프론트엔드 (Next.js · localhost:3000)

### 🔐 인증

| 기능 코드 | 화면 | URL |
|-----------|------|-----|
| `AUTH` | 로그인 / 가입 | http://localhost:3000/login |

> 테스트 계정: `test@cardwise.dev` / `CardWise2026!`

---

### 📱 사용자 기능 (CardWise 제품)

| 기능 코드 | 화면 | URL | 설명 |
|-----------|------|-----|------|
| `F8` | 소비 대시보드 | http://localhost:3000/dashboard | 월간 요약, 카드별, 카테고리, 추이 |
| `F1` | 카드 관리 | http://localhost:3000/cards | 내 카드 목록 |
| `F1` | 카드 등록 | http://localhost:3000/cards/register | 신규 카드 등록 |
| `F2·F3` | 가계부 허브 | http://localhost:3000/ledger | 결제 내역 조회/입력 |
| `F3` | 인박스 | http://localhost:3000/inbox | AI 처리 대기 항목 확인 |
| `F3` | 결제 보정 | http://localhost:3000/adjustments | FX·할인 보정 내역 |
| `F4` | 실적 관리 | http://localhost:3000/performance/[userCardId] | 카드별 연간/월간 실적 |
| `F5` | 혜택 검색 | http://localhost:3000/benefits | 가맹점·카테고리별 최적 혜택 |
| `F5` | 카드 혜택 상세 | http://localhost:3000/benefits/cards/[cardId] | 특정 카드의 전체 혜택 목록 |
| `F6` | 바우처 관리 | http://localhost:3000/vouchers | 바우처 잔여 횟수 추적 |
| `F7` | 알림 센터 | http://localhost:3000/notifications | 알림 목록 및 읽음 처리 |
| `F7` | 알림 설정 | http://localhost:3000/settings/notifications | 알림 on/off 개별 설정 |
| `TAG` | 태그 통계 | http://localhost:3000/dashboard/tags | 태그별 소비 분석 |
| `TAG` | 태그 교차분석 | http://localhost:3000/dashboard/tags/cross | 멀티 태그 교차 분석 |
| `F12` | 그룹 가계부 허브 | http://localhost:3000/groups | 내 그룹 목록 |
| `F12` | 그룹 상세 | http://localhost:3000/groups/[groupId] | 그룹 결제/멤버/통계 |
| `F12` | 초대 목록 | http://localhost:3000/groups/invitations | 받은 초대 수락/거절 |
| `MY` | 사용자 설정 | http://localhost:3000/settings | 프로필, 계정, 테마 설정 |

---

### 🔧 개발자 도구 (OPS · CardWise 제품 기능 아님)

> ⚠️ 아래 경로는 **CardWise 제품 기능이 아닙니다.**  
> 개발 중 AI 에이전트 상태와 Human-in-the-Loop 큐를 확인하기 위한 **내부 모니터링 도구**입니다.

| 기능 코드 | 화면 | URL | 용도 |
|-----------|------|-----|------|
| `OPS-01·02` | **OPS 라이브 대시보드** | http://localhost:3000/ops/live | AI 에이전트 상태 모니터링, Human-in-the-Loop 대기 큐 |

---

## 🖧 백엔드 (Spring Boot · localhost:8080)

| 도구 | URL | 용도 |
|------|-----|------|
| **Swagger UI** | http://localhost:8080/swagger-ui.html | REST API 목록 + 직접 호출 |
| OpenAPI JSON | http://localhost:8080/v3/api-docs | OpenAPI 명세 (JSON) |
| Actuator 헬스 | http://localhost:8080/actuator/health | 서버 상태 확인 |

---

## 🌐 외부 서비스

| 서비스 | URL | 비고 |
|--------|-----|------|
| Supabase 대시보드 | https://supabase.com/dashboard/project/spzeyjwkefsfpahhrvov | DB 테이블, Auth 유저, 마이그레이션 |
| Supabase Auth Users | https://supabase.com/dashboard/project/spzeyjwkefsfpahhrvov/auth/users | 사용자 계정 관리 |
| Supabase Table Editor | https://supabase.com/dashboard/project/spzeyjwkefsfpahhrvov/editor | 테이블 직접 조회/편집 |
| GitHub 레포 | https://github.com/cronocros/CardWise | 소스코드 |
| 현재 브랜치 PR | https://github.com/cronocros/CardWise/tree/codex/integration-phase1 | `codex/integration-phase1` |

---

## ⚙️ 로컬 서버 실행 명령어

```powershell
# 백엔드 (e:\Dev_ai\CardWise\backend)
. .\.secrets\remote-env.ps1; .\gradlew.bat bootRun

# 프론트엔드 (e:\Dev_ai\CardWise\frontend)
npm run dev
```

---

## 📁 주요 설정 파일 위치

| 파일 | 경로 | 용도 |
|------|------|------|
| 프론트 환경변수 | `frontend/.env.local` | Supabase URL/Key (Git 제외) |
| 백엔드 환경변수 | `backend/.secrets/remote-env.ps1` | DB, JWT 설정 (Git 제외) |
| 마이그레이션 | `supabase/migrations/*.sql` | DB 스키마 변경 이력 |
| 프록시 설정 | `frontend/src/lib/backend-proxy.ts` | 프론트→백엔드 JWT 전달 |
| 미들웨어 | `frontend/src/middleware.ts` | Auth 리디렉션 규칙 |

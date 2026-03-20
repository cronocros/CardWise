# CLAUDE.md — CardWise Monorepo

스마트 카드 혜택 관리 및 자산 분석 플랫폼.

## 🚦 시스템 현황 (System Health)
- **개발 모드**: v3.4 프리미엄 UI 고도화 진행 중
- **환경**: Next.js 16 (Turbopack) + Spring Boot 3 (Kotlin)
- **현황판**: `http://localhost:4173` (OPS 대시보드)

## 📁 문서 가이드 (SDLC 분류)
모든 문서는 **`docs/`** 폴더에 카테고리별로 정렬되어 있습니다.
1.  **[분석](docs/01-analysis/)**: 기능 연동표, 요구사항 정의
2.  **[계획](docs/02-planning/)**: v3.4 구현 전략, 태스크 목록
3.  **[아키텍처](docs/03-architecture/)**: 시스템, DB, 인증/보안 설계
4.  **[디자인](docs/04-design/)**: 디자인 시스템, Pencil 원본
5.  **[운영/구현](docs/05-implementation/)**: 배포 스택, 모니터링
6.  **[테스트](docs/06-testing/)**: 테스트 전략 및 결과
7.  **[기타](docs/07-other/)**: 링크 모음, 메모리 아카이브

## 🛠️ 핵심 명령어 (Commands)

### Frontend (Next.js)
```bash
cd frontend
bun install
bun dev           # Port 3000 (Local)
bun run dev:ops   # Port 3001 (Optional Ops UI)
```

### Backend (Spring Boot)
```bash
cd backend
./gradlew bootRun  # Port 8080
```

### Infrastructure & Tools
```bash
# Redis (Local Docker)
docker compose up -d redis

# OPS 작업판 (Dashboard)
node ops/dashboard/serve.js            # Port 4173
node ops/dashboard/render-terminal.js  # Terminal watcher
```

## 🏗️ 개발 원칙 (Rules)
- **Turbopack 주의**: Windows 환경의 의존성 해결을 위해 루트 `package.json`에 `workspaces`를 유지합니다.
- **Hydration 관리**: `sampleData.ts`의 `pseudoRandom` 시드를 사용하여 서버/클라이언트 렌더링을 일치시킵니다.
- **BFF 패턴**: Client Component는 반드시 `/api/*` Route Handlers를 경유하여 백엔드와 통신합니다.
- **디자인 보존**: `design-preview/` 에셋은 함부로 수정하거나 삭제하지 않습니다.

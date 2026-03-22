# CLAUDE.md — CardWise Monorepo

스마트 카드 혜택 관리 및 자산 분석 플랫폼.

## 🚦 시스템 현황 (System Health)

- **개발 모드**: v3.7 헥사고날 아키텍처 완성 및 프로젝트 최적화 반영
- **프론트엔드**: Next.js 16 (Turbopack) | 배포: **Vercel**
- **백엔드**: Spring Boot 3 (Kotlin)
- **데이터베이스**: **Remote Supabase (Cloud)** - 로컬 DB 미사용
- **캐시/큐**: **Upstash (Redis-api)** - 로컬 Redis 미사용
- **현황판**: `http://localhost:4173` (OPS 대시보드)
- **SSOT**: 현재 진행 상황 및 최신 고도화 내역은 **[STATUS.md](docs/STATUS.md)**를 참조하십시오.

## 📁 문서 가이드 (SDLC 분류)

모든 설계 및 구현 문서는 **`docs/`** 폴더에 체계적으로 분류되어 있으며, 상세 인덱스는 **[docs/README.md](docs/README.md)**에서 확인할 수 있습니다.

1. **[분석](docs/01-analysis/)**: 기능 및 비기능 요구사항 정의, 리스크 관리
2. **[계획](docs/02-planning/)**: v3.7 구현 및 리팩토링 중장기 계획
3. **[아키텍처](docs/03-architecture/)**: 전체 시스템, 인프라, DB 스택 설계
4. **[디자인](docs/04-design/)**: 디자인 시스템, UX/UI 명세
5. **[운영](docs/05-ops/)**: 배포 가이드, 모니터링 및 관측성 전략
6. **[테스트](docs/06-test/)**: 테스트 전략 및 테스트 계정 가이드
7. **[상세 명세](docs/07-spec/)**: 도메인별 기능 상세 설계 (Auth, Ledger, Card 등)
8. **[기타](docs/08-other/)**: 추가 참조 데이터 및 아카이브

## 🛠️ 핵심 명령어 (Commands)

### 서비스 실행 (Start Scripts)

```bash
# 전체 서버 재시작 (Windows PowerShell)
.\restart-all.ps1

# 서비스별 개별 재시작
.\restart-backend.ps1
.\restart-frontend.ps1
```

### Infrastructure & Cloud Tools

```bash
# OPS 작업판 (Dashboard)
node ops/dashboard/serve.js            # Port 4173
node ops/dashboard/render-terminal.js  # Terminal watcher

# Infrastructure Notes
# DB: Supabase (Remote Cloud)
# Cache: Upstash (Remote)
# Deployment: Vercel
```

## 🏗️ 개발 원칙 (Rules)

- **백엔드 아키텍처 (Mandatory)**: 모든 백엔드 코드는 **CQRS**, **Hexagonal Architecture (Ports/Adapters)**, **DDD (Domain-Driven Design)**, **MSA (Microservices Architecture)** 원칙을 엄격히 준수하여 작성해야 합니다.
- **클라우드 우선**: 데이터베이스는 반드시 **Supabase 원격** 환경만 사용하며, 캐시는 **Upstash**를 활용합니다.
- **배포 원칙**: 프론트엔드 및 전체 서비스 배포는 **Vercel** 환경을 지향합니다.
- **Turbopack 주의**: Windows 환경의 의존성 해결을 위해 루트 `package.json`에 `workspaces`를 유지합니다.
- **샘플 데이터 하이드레이션**: 초기 데이터 구성을 위해 `sampleData.ts`를 활용할 경우, `pseudoRandom` 시드를 사용하여 서버/클라이언트 렌더링을 일치시킵니다.
- **BFF 패턴**: Client Component는 보안 및 일관성을 위해 `/api/*` Route Handlers를 경유하여 백엔드와 통신합니다.
- **서버 실행**: 서비스 시작 및 재시작은 루트의 `restart-all.ps1` 등 전용 PowerShell 스크립트 사용을 권장합니다.
- **디자인 보존**: `design-preview/` 에셋은 원본 디자인의 일치성을 보장하기 위해 함부로 수정하거나 삭제하지 않습니다.

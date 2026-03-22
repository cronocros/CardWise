# CardWise - Smart Card & Asset Mate (Monorepo)

신용카드 혜택 최적화 및 스마트한 자산 관리를 위한 올인원 플랫폼, **CardWise**입니다. 본 프로젝트는 헥사고날 아키텍처와 CQRS 패턴을 기반으로 한 고도화된 시스템 구축을 목표로 합니다.

## 📁 프로젝트 구조 (Project Structure)

| 폴더 | 설명 | 주요 기술 스택 |
| :--- | :--- | :--- |
| **`frontend/`** | 사용자용 웹/모바일 앱 | Next.js 16 (Turbopack), Tailwind CSS, Lucide |
| **`backend/`** | 핵심 비즈니스 로직 API | Spring Boot 3, Kotlin, Hexagonal Architecture |
| **`ops/`** | 내부 관리 및 모니터링 도구 | Node.js, Custom Dashboard, Orchestration |
| **`docs/`** | 전체 SDLC 문서 및 아키텍처 | Markdown (**DOC-xx-xx** 표준화 완료) |
| **`supabase/`** | DB 스키마 및 마이그레이션 | PostgreSQL, Auth, RLS, Storage |

### 🛠 핵심 인프라 스택 (Core Infrastructure)
- **Deployment**: **Vercel** (Edge 최적화 및 글로벌 CDN 서비스)
- **Database & Auth**: **Supabase** (Managed PostgreSQL, JWT Auth, RLS)
- **Memory Cache**: **Upstash Redis** (Serverless In-memory API 캐싱)
- **LLM Engine**: **Claude 3.5 Sonnet** (AI 기반 소비 분석 및 카드 추천)

## 🚀 빠른 시작 (Quick Start)

본 프로젝트는 Windows PowerShell 환경에서의 원활한 개발을 위해 전용 스크립트를 제공합니다.

### 1. 전체 서버 일괄 실행
```powershell
# 프론트엔드(3000) 및 백엔드(8080) 서버 동시 실행
.\restart-all.ps1
```

### 2. 서비스별 개별 실행
```powershell
# 백엔드 서버만 실행
.\restart-backend.ps1

# 프론트엔드 서버만 실행
.\restart-frontend.ps1
```

## 📖 문서 가이드 (Documentation Guide)

모든 문서 작업은 **v3.7 표준화** 규칙을 따르며, SSOT(Single Source of Truth) 체계로 관리됩니다.

- **[docs/README.md](docs/README.md)**: 전체 문서 인덱스 및 디렉토리 구조 가이드
- **[docs/STATUS.md](docs/STATUS.md)**: **현재 구현 현황** 및 시스템 헬스체크 (가장 먼저 확인)
- **[CLAUDE.md](CLAUDE.md)**: AI 개발 가이드라인, 핵심 규칙 및 상세 명령어
- **[.cursorrules](.cursorrules)**: AI 에이전트 전용 행동 및 구조 제약 원칙

## 🎨 디자인 및 에셋
- **`design-preview/`**: (Docs 내 존재) 원본 디자인 시안 및 고해상도 목업 데이터

---
© 2026 CardWise Team. All rights reserved.

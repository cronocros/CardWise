# CardWise - Smart Card & Asset Mate (Monorepo)

신용카드 혜택 최적화 및 스마트한 자산 관리를 위한 올인원 플랫폼, **CardWise**입니다.

## 📁 프로젝트 구조 (Project Structure)

| 폴더 | 설명 | 기술 스택 |
| :--- | :--- | :--- |
| **`frontend/`** | 사용자용 웹/모바일 앱 | Next.js 16 (Turbopack), Tailwind CSS, TypeScript |
| **`backend/`** | 핵심 비즈니스 로직 API | Spring Boot 3 / Kotlin, Hexagonal Architecture |
| **`ops/`** | 내부 관리 및 모니터링 도구 | Node.js, Custom Dashboard |
| **`docs/`** | 전체 SDLC 문서 및 아키텍처 | Markdown (01~07 분류) |
| **`supabase/`** | DB 스키마 및 마이그레이션 | PostgreSQL, Migration SQL |
| **`scripts/`** | 자산 추출 및 빌드 스크립트 | Node.js, Jimp |
| **`scripts/`** | 자산 추출 및 빌드 스크립트 | Node.js, Jimp |

### 🛠 핵심 인프라 스택 (Core Infrastructure)
- **Deployment (배포)**: Vercel (최적화된 프론트엔드 및 Edge 인프라)
- **Database & Storage**: Supabase (PostgreSQL, Auth, Storage)
- **Memory Cache**: Upstash Redis (서버리스 인메모리 캐싱 및 레이트 리밋)

## 🚀 빠른 시작 (Quick Start)

### 1. 프론트엔드 (Frontend)
```bash
cd frontend
bun install
bun dev           # http://localhost:3000
```

### 2. 백엔드 (Backend)
```bash
cd backend
./gradlew bootRun  # http://localhost:8080
```

### 3. OPS 대시보드 (Ops Dashboard)
```bash
node ops/dashboard/serve.js  # http://127.0.0.1:4173
```

## 📖 문서 가이드 (Documentation)

모든 설계 및 기획 문서는 **[docs/README.md](docs/README.md)**에서 인덱싱되어 있습니다.
- **[STATUS.md](docs/STATUS.md)**: 현재 구현 현황 및 시스템 헬스체크
- **[CLAUDE.md](CLAUDE.md)**: 개발 가이드라인 및 상세 명령어

## 🎨 디자인 프리뷰 (Design Preview)
- **`design-preview/`**: 원본 디자인 시안 및 목업 데이터 보관

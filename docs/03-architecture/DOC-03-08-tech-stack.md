# CardWise 기술 스택 정의 (DOC-03-08)

---

## 전체 구성

```
+-----------+     +-----------+     +-----------+     +-----------+     +-----------+
| Frontend  |     | Backend   |     | Database  |     | Storage   |     | Cache     |
|           |     |           |     |           |     |           |     |           |
| Next.js16 |<--->| Spring    |<--->| Supabase  |<--->| Supabase  |     | Upstash   |
| TypeScript|     | Boot      |     | PostgreSQL|     | Storage   |     | Redis     |
| Tailwind  |     | Kotlin    |     | (Auth)    |     | (Buckets) |     | Serverless|
+-----------+     +-----------+     +-----------+     +-----------+     +-----------+
   Vercel            Vercel             Managed            Managed          Serverless
      (또는 Cloud Run)
```

---

## Frontend

| 항목 | 기술 | 버전 | 선택 이유 |
|------|------|------|----------|
| 프레임워크 | Next.js | 16 | App Router, RSC, SSR/SSG, Vercel 최적화 |
| 언어 | TypeScript | 5.x | 타입 안전성, IDE 지원 |
| 스타일링 | Tailwind CSS | 4.x | 유틸리티 퍼스트, 빠른 개발 |
| UI 컴포넌트 | shadcn/ui | latest | 커스터마이징 가능, 접근성 내장 |
| 패키지 매니저 | Bun | 1.x | npm 대비 빠른 설치/실행 |
| 폼 관리 | React Hook Form | 7.x | 비제어 컴포넌트, 성능 |
| 검증 | Zod | 3.x | 타입 추론, shadcn 폼 통합 |
| 차트 | Recharts | 2.x | React 네이티브, 반응형 |
| 테이블 | @tanstack/react-table | 8.x | 헤드리스, 유연한 커스텀 |
| 토스트 | Sonner | latest | shadcn 기본, 경량 |
| 아이콘 | Lucide React | latest | shadcn 기본 아이콘셋 |
| 날짜 | date-fns | 3.x | 트리 셰이킹, 경량 |

### Frontend 주요 패턴

- **Server Component 우선**: 데이터 fetching은 서버에서
- **Client Component 최소화**: 상호작용 필요한 부분만
- **BFF 패턴**: Next.js API Routes -> Spring Boot Backend
- **Mobile-first**: 반응형 디자인

---

## Backend

| 항목 | 기술 | 버전 | 선택 이유 |
|------|------|------|----------|
| 프레임워크 | Spring Boot | 3.x | 엔터프라이즈 급, 생태계 |
| 언어 | Kotlin | 2.x | null safety, 간결한 문법, Java 호환 |
| ORM | Spring Data JPA | - | Hibernate 기반, 생산성 |
| 보안 | Spring Security | - | JWT 검증, 필터 체인 |
| 검증 | Bean Validation | - | 어노테이션 기반 입력 검증 |
| API 문서 | SpringDoc OpenAPI | - | Swagger UI 자동 생성 |
| 빌드 | Gradle (Kotlin DSL) | 8.x | 멀티모듈, 빠른 빌드 |
| 테스트 | JUnit 5 + Mockk | - | Kotlin 친화적 모킹 |

### Backend 아키텍처

- **Hexagonal Architecture**: Domain <-> Port <-> Adapter
- **Modular Monolith**: 9개 모듈, 이벤트 기반 느슨한 결합
- **DDD**: Bounded Context, Aggregate, Domain Event
- **Spring @EventListener**: 모듈 간 비동기 통신 (MVP)

---

## Database

| 항목 | 기술 | 선택 이유 |
|------|------|----------|
| DBMS | PostgreSQL (Supabase) | 관리형, Auth 통합, RLS |
| 연결 | PgBouncer (Supabase 내장) | 커넥션 풀링 |
| 마이그레이션 | Supabase CLI | 버전 관리, 브랜치 지원 |
| 보안 | Row Level Security (RLS) | 행 단위 접근 제어 |

### DB 규모

- 41 테이블 (6개 도메인, 최종 설계)
- 26 ENUM 타입
- MVP Phase 1 기준 32 테이블 운영
- 해외결제 다중통화 지원

---

## Infrastructure

| 항목 | 기술 | 선택 이유 |
|------|------|----------|
| Frontend 배포 | Vercel | Next.js 최적화, Edge 지원, 글로벌 CDN |
| Backend 배포 | Vercel (또는 Cloud Run) | API 통합 배포 또는 컨테이너 분리 |
| Database | Supabase PostgreSQL | 관리형 DB, Auth 통합, RLS |
| Storage | Supabase Storage | `media`, `receipts` 버킷 등 이미지/파일 관리 |
| Cache (운영) | Upstash Redis | 서버리스, API 레이트 리밋, 메모리 캐싱 |
| Auth | Supabase Auth | JWT 기반, 소셜 로그인 연동 |
| Cache (로컬) | Docker Redis (redis:7-alpine) | 로컬 개발용 `docker compose up -d redis` |

---

## AI

| 항목 | 기술 | 용도 |
|------|------|------|
| LLM | Claude API (claude-sonnet-4-6) | 카드 추천, 지출 분석 |
| 호출 방식 | Backend -> Claude API | 서버 사이드 전용 |
| 캐시 | Redis (30분) | 동일 추천 결과 캐시 |

---

## 개발 도구

| 항목 | 기술 |
|------|------|
| VCS | Git + GitHub |
| IDE | IntelliJ IDEA (Backend), VS Code/Cursor (Frontend) |
| AI 코딩 | Claude Code (Superpowers 스킬 8개) |
| API 테스트 | Swagger UI (SpringDoc) |
| DB 관리 | Supabase Dashboard |
| 문서 참조 | Context7 MCP |

---

## 버전 호환성

| 항목 | 최소 버전 | 비고 |
|------|----------|------|
| Node.js | 20.x | Next.js 16 요구사항 |
| Bun | 1.x | Frontend 패키지 매니저 |
| JDK | 21 | Spring Boot 3.x 요구사항 |
| Kotlin | 2.0+ | JDK 21 호환 |
| PostgreSQL | 15+ | Supabase 기본 |

---

## 제외한 기술 (및 이유)

| 기술 | 제외 이유 |
|------|----------|
| Redux / Zustand | RSC로 서버 상태 관리, 전역 상태 불필요 |
| Prisma | Supabase + Spring Data JPA로 충분 |
| Kafka | MVP에서 오버엔지니어링, Phase 2에서 도입 예정 |
| MongoDB / NoSQL | 관계형 데이터 특성, PostgreSQL JSONB로 유연성 확보 |
| GraphQL | REST로 충분, OpenAPI 자동 문서화 장점 |
| Docker (전체 컨테이너화) | Redis만 Docker 사용, 나머지는 Supabase CLI + Bun/Gradle로 충분 |
| Terraform | MVP에서 관리형 서비스 사용, IaC 불필요 |

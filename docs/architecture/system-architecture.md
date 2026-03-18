# CardWise - 시스템/인프라 아키텍처

> 한국 신용카드 혜택 관리 플랫폼의 인프라 및 배포 아키텍처 설계 문서

---

## 1. 시스템 개요

### 전체 배포 다이어그램

```
+------------------+         HTTPS          +---------------------+
|                  |  <-------------------> |                     |
|   사용자 브라우저  |                        |   Vercel (Edge)     |
|                  |                        |   Next.js 15        |
+------------------+                        |   (SSR + Static)    |
                                            +----------+----------+
                                                       |
                                                       | REST API
                                                       | (HTTPS)
                                                       |
                                            +----------v----------+
                                            |                     |
                                            |   Cloud Run /       |
                                            |   Railway           |
                                            |   Spring Boot       |
                                            |   Kotlin            |
                                            |   (단일 JAR)         |
                                            +--+------+-------+---+
                                               |      |       |
                              +----------------+      |       +----------------+
                              |                       |                        |
                   +----------v----------+  +---------v---------+  +-----------v---------+
                   |                     |  |                   |  |                     |
                   |   Supabase          |  |   Supabase Auth   |  |   Upstash Redis     |
                   |   PostgreSQL        |  |   (JWT 발급/검증)  |  |   (Serverless)      |
                   |   (Managed DB)      |  |                   |  |                     |
                   +---------------------+  +-------------------+  +---------------------+
```

### 데이터 흐름 요약

```
[브라우저] --HTTPS--> [Vercel/Next.js] --REST API--> [Cloud Run/Spring Boot]
                                                          |
                                                          +---> [Supabase PostgreSQL] : 영구 데이터
                                                          +---> [Supabase Auth]       : 인증/JWT
                                                          +---> [Upstash Redis]       : 캐시/레이트리밋
```

---

## 2. 인프라 구성 요소

### 2.1 Compute

#### Frontend: Vercel + Next.js 15

| 항목 | 내용 |
|------|------|
| 플랫폼 | Vercel |
| 프레임워크 | Next.js 15 (App Router) |
| 런타임 | Edge Runtime + Node.js (SSR) |
| 정적 자산 | Vercel CDN (글로벌 Edge) |
| 빌드 도구 | Bun |

```
Vercel 내부 구조:

+--------------------------------------------------+
|  Vercel Platform                                  |
|                                                   |
|  +------------------+   +---------------------+   |
|  | Edge Network     |   | Serverless          |   |
|  | (CDN)            |   | Functions           |   |
|  |                  |   | (SSR, API Routes)   |   |
|  | - 정적 파일       |   | - Server Components |   |
|  | - ISR 캐시       |   | - Route Handlers    |   |
|  | - 이미지 최적화   |   | - Middleware         |   |
|  +------------------+   +---------------------+   |
|                                                   |
+--------------------------------------------------+
```

#### Backend: Cloud Run 또는 Railway + Spring Boot Kotlin

| 항목 | 내용 |
|------|------|
| 플랫폼 | Google Cloud Run (1순위) / Railway (대안) |
| 프레임워크 | Spring Boot 3.x (Kotlin) |
| 패키징 | 단일 Fat JAR (Modular Monolith) |
| 컨테이너 | Docker (JVM 21) |
| 인스턴스 | MVP 단계 1개, scale-to-zero 지원 |

```
Cloud Run 배포 구조:

+--------------------------------------------+
|  Google Cloud Run                          |
|                                            |
|  +--------------------------------------+  |
|  | Container Instance                   |  |
|  |                                      |  |
|  |  +--------------------------------+  |  |
|  |  | Spring Boot (단일 JAR)          |  |  |
|  |  |                                |  |  |
|  |  |  - card module                 |  |  |
|  |  |  - benefit module              |  |  |
|  |  |  - ledger module               |  |  |
|  |  |  - usercard module             |  |  |
|  |  |  - shared kernel               |  |  |
|  |  +--------------------------------+  |  |
|  +--------------------------------------+  |
|                                            |
|  Auto-scaling: 0 ~ N instances             |
|  (MVP: min=0, max=1)                       |
+--------------------------------------------+
```

#### MVP에서 이 조합을 선택한 이유

- **Vercel**: Next.js 공식 플랫폼, Zero-config 배포, 무료 티어로 MVP 충분
- **Cloud Run**: 사용한 만큼 과금, scale-to-zero로 유휴 비용 없음, Docker 기반 이식성
- **Railway (대안)**: 더 간단한 설정, 빠른 배포, 다만 Cloud Run 대비 제어력 낮음

---

### 2.2 Database

#### Supabase PostgreSQL (Managed)

| 항목 | 내용 |
|------|------|
| 서비스 | Supabase (Free → Pro 플랜) |
| 엔진 | PostgreSQL 15+ |
| 리전 | Northeast Asia (ap-northeast-1 또는 ap-northeast-2) |
| 스토리지 | MVP: 500MB (Free), 확장: 8GB (Pro) |

#### Connection Pooling

```
+-------------------+       +------------------+       +------------------+
|  Spring Boot      | ----> |  PgBouncer       | ----> |  PostgreSQL      |
|  (HikariCP)       |       |  (Supabase 내장)  |       |  (Supabase)      |
|                   |       |                  |       |                  |
|  pool size: 10    |       |  Transaction     |       |  max_conn: 60    |
|  (per instance)   |       |  Pooling Mode    |       |  (Free tier)     |
+-------------------+       +------------------+       +------------------+

접속 포트:
  - Direct:  5432  (마이그레이션, 스키마 변경 시)
  - Pooler:  6543  (애플리케이션 런타임)
```

- 애플리케이션은 항상 **Pooler 포트(6543)** 를 통해 접속
- Direct 연결은 마이그레이션 실행 시에만 사용

#### 백업 전략

| 항목 | Free 티어 | Pro 티어 |
|------|-----------|---------|
| 자동 백업 | 없음 | 매일 (7일 보관) |
| Point-in-Time Recovery | 없음 | 지원 (7일) |
| 수동 백업 | pg_dump 스크립트 (주 1회) | pg_dump + 자동 백업 병행 |

- MVP (Free 티어): GitHub Actions로 주 1회 `pg_dump` 실행, 결과를 Cloud Storage에 보관
- 프로덕션 전환 시: Supabase Pro 플랜의 자동 백업 + PITR 활용

---

### 2.3 Cache

#### Redis 환경 전략

로컬 개발과 운영 환경에서 서로 다른 Redis 방식을 사용한다.

| 항목 | 로컬 개발 | 스테이징 / 운영 |
|------|----------|----------------|
| 방식 | Docker Redis (redis:7-alpine) | Upstash Redis (서버리스) |
| 접속 | `redis://localhost:6379` | REST API (TLS) |
| 과금 | 무료 | Pay-per-request (일 10,000 무료) |
| 설정 | `docker compose up -d redis` | 환경변수 `UPSTASH_*` |
| 데이터 지속성 | Docker volume (appendonly) | Upstash 자동 관리 |
| 모니터링 | redis-cli / RedisInsight | Upstash Console |

**로컬 개발 실행:**
```bash
# 프로젝트 루트의 docker-compose.yml 사용
docker compose up -d redis

# 연결 확인
docker exec cardwise-redis redis-cli ping
# → PONG
```

**docker-compose.yml 구성** (프로젝트 루트):
```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: cardwise-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
volumes:
  redis_data:
```

**백엔드 환경별 설정:**
```yaml
# application-local.yml (로컬 개발)
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: ""

# application.yml (스테이징/운영) — Upstash REST 클라이언트 사용
# UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN 환경변수로 주입
```

#### Upstash Redis (스테이징/운영)

| 항목 | 내용 |
|------|------|
| 서비스 | Upstash Redis |
| 과금 모델 | Pay-per-request (일 10,000 요청 무료) |
| 리전 | ap-northeast-1 (Tokyo) |
| 프로토콜 | REST API + Redis 프로토콜 (TLS) |
| 최대 메모리 | 256MB (Free), 확장 가능 |

#### 캐시 용도

```
+---------------------------------------------------------------------+
|  Upstash Redis 용도                                                  |
|                                                                     |
|  1. API Rate Limiting                                               |
|     - Sliding Window Counter                                        |
|     - 엔드포인트별 차등 제한                                           |
|                                                                     |
|  2. Session Cache                                                   |
|     - Refresh Token 메타데이터                                        |
|     - 사용자 세션 상태                                                 |
|                                                                     |
|  3. Query Result Cache                                              |
|     - 카드/혜택 상세 정보                                              |
|     - 가맹점 검색 결과                                                 |
|     - 카드 추천 결과                                                   |
|                                                                     |
|  4. Dashboard Cache                                                 |
|     - 대시보드 요약 데이터                                              |
|     - 실적 현황                                                       |
+---------------------------------------------------------------------+
```

#### 캐시 키 패턴 및 TTL 전략

| 캐시 키 패턴 | 대상 | TTL | 무효화 전략 |
|-------------|------|-----|-----------|
| `rate:{accountId}:{endpoint}:{window}` | API 레이트 리밋 | 1m (윈도우) | 자동 만료 |
| `session:{accountId}` | 세션 메타데이터 | 24h | 로그아웃 시 삭제 |
| `card:{cardId}` | 카드 상세 정보 | 24h | CardDataChangedEvent 시 삭제 |
| `card:{cardId}:benefits` | 카드별 혜택 목록 | 24h | CardDataChangedEvent 시 삭제 |
| `merchant:search:{query}` | 가맹점 검색 결과 | 1h | 크롤링 완료 시 전체 삭제 |
| `recommend:{accountId}:{merchantId}` | 카드 추천 결과 | 30m | Payment/UserCard 변경 시 삭제 |
| `user:{accountId}:dashboard` | 대시보드 요약 | 10m | PaymentEvent 시 삭제 |
| `user:{accountId}:performance` | 실적 현황 | 10m | PaymentEvent 시 삭제 |

#### 캐시 정책

```
Read: Cache-Aside (Look-Aside)
  +--------+    1. GET    +-------+   2. MISS   +----------+
  | Client | ----------> | Redis | ----------> | DB Query |
  +--------+             +-------+             +----------+
       ^                     |                      |
       |     3a. HIT         |    3b. SET + 반환     |
       +---------------------+----------------------+

Write: Event-Driven Invalidation
  +--------+   1. WRITE   +------+   2. EVENT   +---------+   3. DEL   +-------+
  | Client | ----------> |  DB  | -----------> | Handler | -------->  | Redis |
  +--------+             +------+              +---------+            +-------+
```

---

### 2.4 Authentication

#### Supabase Auth (Managed)

```
인증 흐름:

[브라우저]                [Next.js]              [Supabase Auth]         [Spring Boot]
    |                        |                        |                       |
    | 1. 로그인 (이메일/소셜)  |                        |                       |
    |----------------------->|                        |                       |
    |                        | 2. signInWithPassword  |                       |
    |                        |----------------------->|                       |
    |                        |                        |                       |
    |                        | 3. JWT 응답             |                       |
    |                        |<-----------------------|                       |
    |                        |                        |                       |
    | 4. Access Token        |                        |                       |
    |    (메모리 저장)        |                        |                       |
    | + Refresh Token        |                        |                       |
    |    (httpOnly Cookie)   |                        |                       |
    |<-----------------------|                        |                       |
    |                        |                        |                       |
    | 5. API 요청                                                             |
    |   Authorization: Bearer {accessToken}                                  |
    |----------------------------------------------------------------------->|
    |                        |                        |                       |
    |                        |                        | 6. JWT 검증            |
    |                        |                        |   (Supabase 공개키)    |
    |                        |                        |<----------------------|
    |                        |                        |                       |
    |                        |                        | 7. 공개키 반환         |
    |                        |                        |---------------------->|
    |                        |                        |                       |
    | 8. API 응답                                      | 9. SecurityContext    |
    |<-----------------------------------------------------------------------|
    |                        |                        |    설정 후 요청 처리    |
```

#### JWT 토큰 관리

| 토큰 | 저장 위치 | 만료 시간 | 용도 |
|------|----------|----------|------|
| Access Token | 브라우저 메모리 (변수) | 1시간 | API 인증 헤더 |
| Refresh Token | httpOnly + Secure + SameSite=Strict Cookie | 7일 | Access Token 갱신 |

#### Backend JWT 검증

```
Spring Boot JWT 검증 흐름:

+------------------+     +------------------------+     +------------------+
|  HTTP Request    |     | JwtAuthenticationFilter|     | SecurityContext   |
|                  |     |                        |     |                  |
| Authorization:   | --> | 1. 토큰 추출            | --> | accountId 설정    |
| Bearer {jwt}     |     | 2. Supabase 공개키로    |     | 인가 정보 설정     |
|                  |     |    서명 검증             |     |                  |
|                  |     | 3. 만료 시간 확인        |     |                  |
|                  |     | 4. Claims 추출          |     |                  |
+------------------+     +------------------------+     +------------------+

Supabase 공개키 소스:
  - JWKS URL: https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
  - 주기적 갱신 (캐시 TTL: 1h)
```

---

## 3. 네트워크 및 보안

### 전체 보안 구조

```
+--------------------------------------------------------------------+
|                        보안 레이어                                    |
|                                                                    |
|  [인터넷]                                                           |
|      |                                                             |
|      | HTTPS (TLS 1.2+)                                            |
|      |                                                             |
|  +---v---------------------+                                       |
|  | Vercel Edge             |  - HTTPS 강제                          |
|  | (CDN + WAF)             |  - DDoS 보호 (Vercel 기본 제공)         |
|  +---+---------------------+                                       |
|      |                                                             |
|      | HTTPS                                                       |
|      |                                                             |
|  +---v---------------------+                                       |
|  | Cloud Run               |  - CORS 화이트리스트                    |
|  | (Spring Boot)           |  - JWT 인증 필터                        |
|  |                         |  - Rate Limiting (Redis)               |
|  |                         |  - Bean Validation (입력 검증)          |
|  +---+----------+----------+                                       |
|      |          |                                                  |
|  +---v---+  +---v--------+                                         |
|  |Supabase|  |Upstash     |  - RLS (Row Level Security)            |
|  |  DB    |  |Redis       |  - TLS 연결                             |
|  +--------+  +------------+  - 접근 키 서버 사이드 전용               |
|                                                                    |
+--------------------------------------------------------------------+
```

### HTTPS

- 모든 구간 TLS 1.2+ 암호화
- Vercel: 자동 SSL 인증서 (Let's Encrypt)
- Cloud Run: 관리형 TLS 종단
- Supabase/Upstash: TLS 기본 적용

### CORS 설정

```
허용 Origin (화이트리스트):
  - Production:  https://cardwise.vercel.app
  - Preview:     https://cardwise-*.vercel.app
  - Local Dev:   http://localhost:3000

거부 항목:
  - 위 목록 외 모든 Origin
  - credentials: true (쿠키 전달 허용)
```

### Rate Limiting

```
Redis Sliding Window Counter:

요청 흐름:
  [요청] --> [Redis 확인] --> 한도 내 --> [요청 처리]
                |
                +--> 한도 초과 --> [429 Too Many Requests]

엔드포인트별 제한:
  /api/auth/*       :  10 req/min  (brute force 방지)
  /api/recommend/*  :  30 req/min  (FREE), 100 req/min (PREMIUM)
  /api/payment/*    :  60 req/min
  /api/card/*       : 120 req/min
  기타               : 120 req/min
```

### Supabase RLS (Row Level Security)

```
모든 사용자 관련 테이블에 RLS 정책을 설계하되, **MVP에서는 애플리케이션 레벨 인가(서비스 롤 + account_id 필터)**를 사용한다.

  정책 예시:
    user_cards      : account_id = auth.uid()
    payments        : account_id = auth.uid()
    user_vouchers   : account_id = auth.uid()

  효과 (정책 설계 기준):
    - DB 레벨에서 다른 사용자의 데이터 접근 원천 차단 가능
    - Backend WHERE 절 실수에 대한 2차 방어선으로 사용 가능

MVP 단계에서는:
  - Spring Security에서 인증된 accountId를 기반으로 모든 쿼리에 `account_id = :accountId` 필터를 강제
  - Supabase에는 RLS 정책을 정의하되, 서비스 롤 키로 접속하여 애플리케이션 레벨 인가를 우선 사용
  - 향후 보안 강화 시, 유저 JWT로 직접 RLS를 강제하는 모드로 전환 가능
```

### 환경 변수 관리

| 환경 | 관리 방식 | 비고 |
|------|----------|------|
| Local Dev | `.env.local` (gitignore 대상) | 개발자 로컬 전용 |
| Staging | Vercel Environment Variables / Cloud Run 환경변수 | Preview 배포 시 자동 주입 |
| Production | Vercel Environment Variables / Cloud Run 환경변수 | 프로덕션 전용 값 |

```
주요 환경 변수 목록:

Frontend (.env.local):
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

Backend (application.yml / 환경변수):
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=eyJ...         # 서버 전용, 절대 노출 금지
  SUPABASE_JWT_SECRET=xxx
  DATABASE_URL=postgresql://...@db.xxx.supabase.co:6543/postgres
  UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
  UPSTASH_REDIS_REST_TOKEN=xxx
```

---

## 4. 환경 전략

| 환경 | Frontend | Backend | DB | Redis |
|------|----------|---------|-----|-------|
| **Local Dev** | localhost:3000 (Bun) | localhost:8080 (Gradle bootRun) | Supabase (dev 프로젝트) | **Docker Redis** (localhost:6379) |
| **Staging** | Vercel Preview 배포 | Cloud Run (staging 서비스) | Supabase (staging branch) | Upstash (staging 인스턴스) |
| **Production** | Vercel Production 배포 | Cloud Run (prod 서비스) | Supabase (main branch) | Upstash (prod 인스턴스) |

### 환경별 구성 다이어그램

```
Local Dev:
+-------------------+     +-------------------+     +-----------------------+
| localhost:3000    | --> | localhost:8080    | --> | Supabase (dev)        |
| Next.js (bun dev) |     | Spring Boot       |     | + Docker Redis :6379  |
+-------------------+     | (bootRun)         |     +-----------------------+
                          +-------------------+
                          (docker compose up -d redis)

Staging:
+-------------------+     +-------------------+     +-----------------------+
| Vercel Preview    | --> | Cloud Run         | --> | Supabase (staging)    |
| (PR 브랜치별 URL)  |     | (staging 서비스)   |     | + Upstash Redis (stg) |
+-------------------+     +-------------------+     +-----------------------+

Production:
+-------------------+     +-------------------+     +-----------------------+
| Vercel Production | --> | Cloud Run         | --> | Supabase (main)       |
| (cardwise.app)    |     | (prod 서비스)      |     | + Upstash Redis (prod)|
+-------------------+     +-------------------+     +-----------------------+
```

### Supabase 브랜치 전략

```
Supabase Branching:

  main (Production)
    |
    +-- staging (Preview Branch)
    |     - PR 생성 시 자동 생성 가능
    |     - 스키마 변경 테스트
    |     - 테스트 데이터 별도 관리
    |
    +-- dev (개발용 별도 프로젝트)
          - 로컬 개발 시 공유
          - 자유로운 스키마 변경
```

---

## 5. CI/CD 파이프라인 (계획)

### 전체 파이프라인 구조

```
+----------+     +-----------------+     +-------------------+     +-------------+
|  GitHub  | --> | GitHub Actions  | --> | Build & Test      | --> | Deploy      |
|  (Push)  |     | (Trigger)       |     |                   |     |             |
+----------+     +-----------------+     +-------------------+     +-------------+

상세 흐름:

main 브랜치 Push
    |
    +---> [Frontend Pipeline]
    |         |
    |         +-- Vercel 자동 감지 & 배포 (별도 Actions 불필요)
    |         +-- Preview: PR 생성 시 자동 Preview URL 생성
    |         +-- Production: main 머지 시 자동 배포
    |
    +---> [Backend Pipeline]
    |         |
    |         +-- GitHub Actions 트리거
    |         +-- Step 1: Checkout
    |         +-- Step 2: Setup JDK 21
    |         +-- Step 3: Gradle Build & Test
    |         +-- Step 4: Docker Build
    |         +-- Step 5: Push to Container Registry (GCR / Artifact Registry)
    |         +-- Step 6: Deploy to Cloud Run
    |
    +---> [Database Pipeline]
              |
              +-- Supabase CLI (supabase db push)
              +-- 마이그레이션 파일 기반 스키마 변경
              +-- PR에서 Staging Branch로 테스트 후 main 머지
```

### Backend CI/CD 상세

```
GitHub Actions Workflow:

name: Backend CI/CD

on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  build-and-deploy:
    +-- checkout
    +-- setup-jdk-21
    +-- gradle-build (./gradlew build)
    +-- gradle-test  (./gradlew test)
    +-- docker-build
    |     Dockerfile:
    |       FROM eclipse-temurin:21-jre-alpine
    |       COPY build/libs/*.jar app.jar
    |       ENTRYPOINT ["java", "-jar", "app.jar"]
    +-- push-to-registry
    +-- deploy-to-cloud-run
          gcloud run deploy cardwise-api \
            --image gcr.io/PROJECT/cardwise-api:$SHA \
            --region asia-northeast1 \
            --platform managed
```

### DB 마이그레이션 흐름

```
개발자 로컬:
  supabase migration new add_xxx_table
  supabase db push (dev 프로젝트에 적용)
      |
      v
PR 생성:
  supabase db push --linked (staging branch에 적용)
  리뷰어 확인
      |
      v
main 머지:
  GitHub Actions에서 supabase db push (production에 적용)
```

---

## 6. 모니터링 및 관측성 (계획)

### 모니터링 구성도

```
+-------------------------------------------------------------------+
|                       모니터링 스택                                   |
|                                                                   |
|  +-------------------+  +--------------------+  +---------------+ |
|  | Vercel Analytics  |  | Spring Boot        |  | Supabase      | |
|  |                   |  | Actuator           |  | Dashboard     | |
|  | - Core Web Vitals |  |                    |  |               | |
|  | - 페이지 로드 시간  |  | - /actuator/health |  | - DB 메트릭   | |
|  | - 방문자 통계      |  | - /actuator/info   |  | - 쿼리 성능   | |
|  | - 에러 추적        |  | - /actuator/metrics|  | - 연결 수     | |
|  +-------------------+  +--------------------+  +---------------+ |
|                                                                   |
|  +-------------------+  +--------------------+                    |
|  | Upstash Console   |  | Cloud Run          |                    |
|  |                   |  | Logging            |                    |
|  | - 요청 수 / 지연   |  |                    |                    |
|  | - 메모리 사용량    |  | - stdout/stderr    |                    |
|  | - 키 분포         |  | - Cloud Logging    |                    |
|  +-------------------+  | - 요청 지연 시간    |                    |
|                         +--------------------+                    |
+-------------------------------------------------------------------+
```

### 레이어별 모니터링 항목

| 레이어 | 도구 | 주요 메트릭 | 알림 기준 (계획) |
|--------|------|-----------|----------------|
| Frontend | Vercel Analytics | LCP, FID, CLS, TTFB | LCP > 2.5s |
| Backend | Spring Actuator + Cloud Logging | 응답 시간, 에러율, JVM 메모리 | 에러율 > 1%, p99 > 3s |
| Database | Supabase Dashboard | 쿼리 성능, 연결 수, 디스크 사용량 | 연결 수 > 50, 디스크 > 80% |
| Cache | Upstash Console | Hit/Miss 비율, 지연 시간, 메모리 | Hit Rate < 70% |

### 로깅 전략

```
Backend 로깅 구조:

[Spring Boot Application]
    |
    | SLF4J + Logback
    |
    +-- INFO:  요청/응답 요약, 비즈니스 이벤트
    +-- WARN:  캐시 미스 급증, 느린 쿼리, 재시도
    +-- ERROR: 예외, 외부 서비스 실패
    |
    v
[stdout/stderr] --> [Cloud Run] --> [Cloud Logging]

로그 포맷 (JSON):
  {
    "timestamp": "...",
    "level": "INFO",
    "logger": "...",
    "message": "...",
    "accountId": "...",      // MDC로 주입
    "traceId": "...",        // 요청 추적용
    "duration_ms": 42
  }
```

---

## 7. 확장성 경로

### 단계별 확장 전략

```
Phase 1: MVP (현재)
===================

  +----------+     +------------------+     +----------+
  | Vercel   | --> | Cloud Run        | --> | Supabase |
  |          |     | (단일 인스턴스)    |     | + Redis  |
  +----------+     +------------------+     +----------+

  - Backend: 단일 인스턴스, scale-to-zero
  - 상태 관리: Redis (세션, 캐시)
  - 예상 처리량: ~100 동시 사용자


Phase 2: Growth (수평 확장)
===========================

  +----------+     +------------------+     +----------+
  | Vercel   | --> | Cloud Run        | --> | Supabase |
  | (CDN)    |     | (N개 인스턴스)    |     | (Pro)    |
  +----------+     | (Auto-scaling)   |     +----------+
                   +--+--+--+--------+          |
                      |  |  |                   |
                      v  v  v            +------v------+
                   [Stateless]           | Upstash     |
                   [Instances]           | Redis       |
                                         | (세션 공유)  |
                                         +-------------+

  - Backend: 수평 확장 (Stateless, Redis 세션)
  - DB: Supabase Pro (Connection Pooling 강화)
  - 캐시: Redis 캐시 적극 활용
  - 예상 처리량: ~1,000 동시 사용자


Phase 3: MSA 전환
==================

  +----------+     +------------------+
  | Vercel   | --> | API Gateway      |
  | (CDN)    |     | (Spring Cloud GW)|
  +----------+     +--------+---------+
                            |
            +-------+-------+-------+-------+
            |       |       |       |       |
         card    ledger  benefit voucher  crawler
         svc     svc     svc     svc      svc
            |       |       |       |       |
            +-------+---+---+-------+-------+
                        |
                 +------+------+
                 |             |
          +------v------+ +---v--------+
          | Upstash     | | Kafka      |
          | Redis       | | (MSK /     |
          +-------------+ | Confluent) |
                          +------------+

  - 각 모듈을 독립 서비스로 분리
  - Kafka로 이벤트 기반 통신
  - 서비스별 독립 DB (필요 시)
  - 상세 설계: docs/archive/eda-kafka-design.md 참조
```

### 확장 시 주요 고려사항

| 단계 | 트리거 조건 | 주요 작업 |
|------|-----------|----------|
| Phase 1 → 2 | 동시 사용자 100명 초과, 응답 지연 증가 | Cloud Run max-instances 증가, Supabase Pro 전환 |
| Phase 2 → 3 | 팀 규모 확대, 배포 독립성 필요, 트래픽 10x 증가 | 모듈별 서비스 분리, Kafka 도입, API Gateway 추가 |

### Stateless Backend 설계 원칙

```
수평 확장을 위한 Stateless 원칙:

  [요청] --> [인스턴스 A 또는 B 또는 C] (아무 인스턴스로 라우팅 가능)
                    |
                    v
             [Redis: 세션/캐시]     <-- 공유 상태는 Redis에
             [PostgreSQL: 영구 데이터] <-- 영구 데이터는 DB에

  Backend 인스턴스에 저장하는 것:
    - 없음 (모든 상태는 외부 저장소)

  이점:
    - 인스턴스 추가/제거 자유
    - 장애 시 다른 인스턴스로 자동 전환
    - scale-to-zero 가능 (Cold Start 허용)
```

---

> **참고 문서**
> - 애플리케이션 아키텍처: `docs/architecture/application-architecture.md`
> - EDA/Kafka 상세 설계: `docs/archive/eda-kafka-design.md`

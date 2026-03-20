# CardWise — 배포 가이드

> 최종 갱신: 2026-03-18

---

## 1. 환경 구성

| 항목 | 로컬 | 스테이징 | 프로덕션 |
|------|------|---------|---------|
| 프론트엔드 | localhost:3000 | Vercel Preview URL | cardwise.app |
| 백엔드 | localhost:8080 | Cloud Run (dev 서비스) | Cloud Run (prod 서비스) |
| DB | Supabase local (localhost:54322) | Supabase (dev 프로젝트) | Supabase (prod 프로젝트) |
| Redis | Docker (localhost:6379) | Upstash (dev 인스턴스) | Upstash (prod 인스턴스) |
| Claude API | 동일 (서버 사이드) | 동일 | 동일 |

---

## 2. 브랜치 전략

```
main          ← 프로덕션 배포 (tag v* 트리거)
  └── develop ← 스테이징 배포 (push 트리거)
        └── feature/xxx  ← PR 단위 개발
        └── fix/xxx
        └── chore/xxx
```

---

## 3. CI/CD 파이프라인 (GitHub Actions)

### 3.1 PR 체크 (모든 PR → main, develop)

```yaml
# .github/workflows/pr-check.yml
name: PR Check
on:
  pull_request:
    branches: [main, develop]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: cardwise_test
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '21', distribution: 'temurin' }
      - run: cd backend && ./gradlew test jacocoTestReport
      - uses: codecov/codecov-action@v3

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: cd frontend && bun install --frozen-lockfile
      - run: cd frontend && bun run lint
      - run: cd frontend && bun test --coverage
      - run: cd frontend && bun run build  # 빌드 오류 사전 감지
```

### 3.2 스테이징 배포 (develop 브랜치 push)

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy Staging
on:
  push:
    branches: [develop]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - run: cd backend && ./gradlew bootBuildImage --imageName=asia-northeast1-docker.pkg.dev/cardwise/backend:${{ github.sha }}
      - run: docker push asia-northeast1-docker.pkg.dev/cardwise/backend:${{ github.sha }}
      - run: |
          gcloud run deploy cardwise-backend-dev \
            --image=asia-northeast1-docker.pkg.dev/cardwise/backend:${{ github.sha }} \
            --region=asia-northeast1 \
            --platform=managed \
            --set-env-vars="SPRING_PROFILES_ACTIVE=staging"

  deploy-db:
    runs-on: ubuntu-latest
    steps:
      - uses: supabase/setup-cli@v1
      - run: supabase db push --db-url=${{ secrets.SUPABASE_STAGING_URL }}

  e2e-test:
    needs: [deploy-backend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: cd frontend && bun install && bunx playwright install --with-deps
      - run: cd frontend && bunx playwright test
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
```

### 3.3 프로덕션 배포 (main 브랜치 tag v*)

```yaml
# .github/workflows/deploy-production.yml
name: Deploy Production
on:
  push:
    tags: ['v*']

jobs:
  deploy:
    steps:
      # 스테이징과 동일 절차 + 카나리 배포
      - name: Deploy Canary (10%)
        run: |
          gcloud run deploy cardwise-backend \
            --image=... \
            --no-traffic  # 트래픽 0%로 배포
          gcloud run services update-traffic cardwise-backend \
            --to-revisions=$NEW_REVISION=10,LATEST=90

      - name: Wait & Monitor (5m)
        run: sleep 300

      - name: Promote to 50%
        run: gcloud run services update-traffic cardwise-backend --to-revisions=$NEW_REVISION=50,LATEST=50

      - name: Wait & Monitor (10m)
        run: sleep 600

      - name: Promote to 100%
        run: gcloud run services update-traffic cardwise-backend --to-latest

      - name: Slack Notify
        uses: slackapi/slack-github-action@v1
        with:
          payload: '{"text": "🚀 CardWise v${{ github.ref_name }} 프로덕션 배포 완료"}'
```

---

## 4. 백엔드 배포 (Cloud Run)

### 4.1 Dockerfile

```dockerfile
# backend/Dockerfile
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# 보안: non-root 사용자
RUN addgroup -S cardwise && adduser -S cardwise -G cardwise
USER cardwise

COPY --chown=cardwise:cardwise build/libs/cardwise-*.jar app.jar

# JVM 최적화 (Cloud Run 환경)
ENV JAVA_OPTS="-Xmx768m -Xms256m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### 4.2 Cloud Run 설정

```yaml
# cloud-run.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: cardwise-backend
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"    # Cold Start 방지
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/memory: "1Gi"
        run.googleapis.com/cpu: "1"
    spec:
      containers:
        - image: asia-northeast1-docker.pkg.dev/cardwise/backend:latest
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: production
            - name: SPRING_DATASOURCE_URL
              valueFrom:
                secretKeyRef:
                  name: cardwise-secrets
                  key: database-url
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
            initialDelaySeconds: 30
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
            initialDelaySeconds: 10
```

---

## 5. 프론트엔드 배포 (Vercel)

### 5.1 vercel.json

```json
{
  "framework": "nextjs",
  "regions": ["icn1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

### 5.2 환경변수 관리 (Vercel Dashboard — 프론트엔드)

| 변수명 | 환경 | 비고 |
|--------|------|------|
| NEXT_PUBLIC_SUPABASE_URL | 전체 | 공개 가능 |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | 전체 | 공개 가능 |
| SUPABASE_SERVICE_ROLE_KEY | 프로덕션/스테이징 | 서버 전용 |
| ANTHROPIC_API_KEY | 프로덕션/스테이징 | 서버 전용 |
| BACKEND_URL | 전체 | Cloud Run URL |
| UPSTASH_REDIS_REST_URL | 프로덕션/스테이징 | Rate Limit용 (서버 전용) |
| UPSTASH_REDIS_REST_TOKEN | 프로덕션/스테이징 | 서버 전용 |

> 로컬 개발: `REDIS_MODE=local`, `REDIS_URL=redis://localhost:6379` (`.env.local`)

### 5.3 환경변수 관리 (Cloud Run — 백엔드)

| 변수명 | 환경 | 비고 |
|--------|------|------|
| SPRING_DATASOURCE_URL | 전체 | Supabase PostgreSQL 연결 URL |
| SPRING_DATASOURCE_USERNAME | 전체 | DB 사용자명 |
| SPRING_DATASOURCE_PASSWORD | 전체 | DB 비밀번호 (Secret Manager) |
| SUPABASE_JWT_SECRET | 전체 | JWT 서명 검증용 |
| ANTHROPIC_API_KEY | 프로덕션/스테이징 | Claude API 호출용 |
| UPSTASH_REDIS_REST_URL | 프로덕션/스테이징 | Rate Limit + 캐시 |
| UPSTASH_REDIS_REST_TOKEN | 프로덕션/스테이징 | — |
| REDIS_MODE | 전체 | `local` (로컬) / `upstash` (운영) |

---

## 6. DB 마이그레이션

### 6.1 마이그레이션 파일 네이밍

```
supabase/migrations/
  20260318120000_create_cards_table.sql
  20260318130000_add_benefit_tiers.sql
  20260318140000_create_rls_policies.sql
```

### 6.2 마이그레이션 실행

```bash
# 로컬
supabase db reset  # 모든 마이그레이션 재실행 + 시드

# 스테이징
supabase db push --db-url=$SUPABASE_STAGING_DB_URL

# 프로덕션
supabase db push --db-url=$SUPABASE_PROD_DB_URL
# ⚠️ 프로덕션은 반드시 백업 후 실행
```

### 6.3 마이그레이션 원칙

- **절대 금지**: 프로덕션 마이그레이션에서 `DROP TABLE`, `DROP COLUMN`
- 컬럼 삭제 시: 먼저 사용 중단 → 다음 배포에서 제거
- 테이블 삭제 시: 최소 2주 간격 2단계 배포
- 모든 마이그레이션은 `down` 스크립트도 함께 작성

---

## 7. 롤백 절차

### 7.1 백엔드 롤백 (Cloud Run)

```bash
# 이전 리비전으로 즉시 롤백 (< 1분)
gcloud run services update-traffic cardwise-backend \
  --to-revisions=PREVIOUS_REVISION=100

# 리비전 목록 확인
gcloud run revisions list --service=cardwise-backend
```

### 7.2 프론트엔드 롤백 (Vercel)

Vercel 대시보드 → Deployments → 이전 배포 → "Promote to Production"

### 7.3 DB 롤백

```bash
# 마이그레이션 롤백 (down 스크립트 실행)
supabase db push --db-url=$SUPABASE_PROD_DB_URL --include-all
# ⚠️ 데이터 손실 가능 — 반드시 백업 먼저
```

---

## 8. 배포 전 체크리스트

### 스테이징 배포 전

- [ ] 모든 테스트 통과 (단위 + 통합)
- [ ] `bun run build` 오류 없음
- [ ] 환경변수 .env.local 확인 (Supabase, Redis, Claude API)
- [ ] DB 마이그레이션 로컬 검증 (`supabase db reset`)

### 프로덕션 배포 전

- [ ] 스테이징에서 E2E 테스트 전체 통과
- [ ] Supabase DB 백업 확인 (pg_dump 최신 파일)
- [ ] CHANGELOG.md 업데이트
- [ ] 주요 기능 담당자 QA 확인
- [ ] 배포 시간: 평일 오전 10시~오후 4시 (트래픽 낮은 시간대)
- [ ] Slack #deploy 채널 배포 시작 공지

### 배포 후 모니터링 (30분)

- [ ] Cloud Run 에러율 < 0.1% 확인
- [ ] P95 응답 시간 < 500ms 확인
- [ ] Supabase 연결 수 정상 확인
- [ ] 사용자 주요 플로우 수동 스모크 테스트

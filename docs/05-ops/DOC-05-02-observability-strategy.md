# CardWise 모니터링 및 관측성 전략 (DOC-05-02)

> 최종 갱신: 2026-03-18

---

## 1. 관측성 3요소

| 요소 | 도구 | 단계 |
|------|------|------|
| **Logs** | Logback(BE) + Vercel Logs(FE) | Phase 0 (MVP) |
| **Metrics** | Cloud Run 내장 + Supabase 대시보드 | Phase 0 (MVP) |
| **Traces** | OpenTelemetry + Cloud Trace | Phase 2 |

---

## 2. 로깅 전략

### 2.1 백엔드 (Spring Boot Kotlin)

**형식**: JSON 구조화 로그 (logstash-logback-encoder)

```json
{
  "timestamp": "2026-03-18T09:00:00.123Z",
  "level": "INFO",
  "service": "cardwise-backend",
  "version": "1.2.3",
  "requestId": "req_01HX...",
  "userId": "usr_***abc",
  "traceId": "4bf92f3577b34da6",
  "logger": "com.cardwise.card.CardUseCase",
  "message": "Card registered successfully",
  "cardId": "card_01HX...",
  "durationMs": 45
}
```

**로그 레벨 정책**:

| 환경 | 레벨 | 상세도 |
|------|------|--------|
| 로컬 개발 | DEBUG | 모든 SQL 쿼리 포함 |
| 스테이징 | DEBUG | SQL 쿼리 포함 |
| 프로덕션 | INFO | 비즈니스 이벤트 위주 |

**PII (개인식별정보) 마스킹 필수**:

```kotlin
// 마스킹 처리 예시
object MaskingUtils {
    fun maskUserId(id: String) = "usr_***${id.takeLast(3)}"
    fun maskCardNumber(number: String) = "•••• •••• •••• ${number.takeLast(4)}"
    fun maskEmail(email: String) = email.replaceAfterLast('@', "***")
    // 로그에 카드번호/이메일/전화번호 절대 평문 기록 금지
}
```

**로그 분류**:

| 카테고리 | 예시 | 레벨 |
|---------|------|------|
| 비즈니스 이벤트 | 카드 등록, 실적 달성, 바우처 사용 | INFO |
| 보안 이벤트 | 로그인 실패, 토큰 갱신, Rate Limit 초과 | WARN |
| 에러 | 파싱 실패, API 호출 실패, DB 오류 | ERROR |
| 성능 | 응답 시간 > 1초인 요청 | WARN |
| 감사 로그 | 데이터 수정, 삭제 | INFO (별도 appender) |

### 2.2 프론트엔드 (Next.js)

- **Vercel Analytics**: Core Web Vitals 자동 수집
- **Sentry** (Phase 1): JS 런타임 에러, 스택 트레이스
- **Console 로그**: 프로덕션에서 자동 제거 (babel-plugin-transform-remove-console)

---

## 3. 핵심 메트릭 및 SLO

### 3.1 API 성능

> NFR 기준: 일반 API P95 < 200ms / 검색 API P95 < 500ms / AI 추천 P95 < 3s (`docs/requirements/non-functional-requirements.md`)

| 메트릭 | SLO 목표 | 알림 임계값 | 측정 도구 |
|--------|---------|------------|----------|
| 응답 시간 P50 | < 100ms | > 200ms | Cloud Run |
| 응답 시간 P95 (일반 API) | < 200ms | > 500ms | Cloud Run |
| 응답 시간 P95 (검색 API) | < 500ms | > 1,000ms | Cloud Run |
| 응답 시간 P95 (AI 추천) | < 3,000ms | > 5,000ms | Cloud Run |
| 응답 시간 P99 | < 2,000ms | > 5,000ms | Cloud Run |
| 에러율 (5xx) | < 0.1% | > 1% | Cloud Run |
| 에러율 (4xx) | < 5% | > 10% | Cloud Run |

### 3.2 인프라

| 메트릭 | 목표 | 알림 임계값 |
|--------|------|------------|
| DB 연결 풀 사용률 | < 70% | > 85% |
| DB 쿼리 평균 시간 | < 50ms | > 200ms |
| Redis Hit Ratio | > 80% | < 60% |
| Redis 메모리 사용률 | < 70% | > 85% |
| Cloud Run CPU 사용률 | < 60% | > 80% |
| Cloud Run 메모리 사용률 | < 70% | > 85% |

### 3.3 비즈니스 메트릭

| 메트릭 | 측정 방식 | 목적 |
|--------|----------|------|
| 일간 활성 사용자 (DAU) | Vercel Analytics | 성장 지표 |
| 카드 등록율 | DB 쿼리 | 온보딩 성공률 |
| AI 추천 사용율 | 로그 집계 | 핵심 기능 채택율 |
| 이메일 파싱 성공률 | 로그 집계 | 데이터 자동화 품질 |
| Claude API 비용 (일/월) | Anthropic 대시보드 | 비용 관리 |

---

## 4. SLA 정의

| 항목 | 목표 |
|------|------|
| 서비스 가용성 | 99.5% / 월 (다운타임 < 3.6시간) |
| 데이터 정확성 | 99.9% (금액 계산 오류 0 목표) |
| 혜택 정보 최신성 | 7일 이내 갱신 |
| 이메일 파싱 SLA | 수신 후 30분 이내 처리 |
| 알림 발송 지연 | < 5분 |

---

## 5. 알림 설정

### 5.1 알림 채널

| 심각도 | 채널 | 대상 |
|--------|------|------|
| Critical (P1) | PagerDuty + Slack #alerts | 즉시 온콜 |
| High (P2) | Slack #alerts | 30분 내 대응 |
| Medium (P3) | Slack #monitoring | 업무 시간 내 |
| Low (P4) | 일간 리포트 이메일 | 다음날 검토 |

### 5.2 알림 규칙

```yaml
# Uptime Kuma 또는 Cloud Monitoring 기준
alerts:
  - name: API 에러율 급증
    condition: error_rate_5xx > 1% for 5m
    severity: Critical
    runbook: docs/monitoring/runbooks/high-error-rate.md

  - name: DB 연결 풀 포화
    condition: db_pool_usage > 85% for 3m
    severity: High
    runbook: docs/monitoring/runbooks/db-pool-exhaustion.md

  - name: Redis Hit Rate 저하
    condition: redis_hit_ratio < 60% for 10m
    severity: Medium

  - name: Cold Start 빈번
    condition: cold_start_count > 10 in 1h
    severity: Medium
    action: "Minimum instances 확인"

  - name: Claude API 비용 초과
    condition: daily_claude_cost > $2
    severity: Low
    action: "캐시 TTL 및 토큰 제한 확인"

  - name: 이메일 파싱 실패율
    condition: email_parse_failure_rate > 20% for 30m
    severity: High
```

---

## 6. 대시보드 구성

### 6.1 운영 대시보드 (Cloud Console)

**Cloud Run 패널**:
- 요청 수 (req/s)
- 응답 시간 히스토그램 (P50/P95/P99)
- 에러율 (4xx/5xx)
- 인스턴스 수 (자동 스케일링 상태)
- CPU/메모리 사용률

**Supabase 패널**:
- 활성 연결 수
- 쿼리 성능 상위 10개
- DB 크기 추이
- Auth 활동 (로그인/가입)

**Upstash 패널**:
- 일간 요청 수 vs 무료 한도
- Hit/Miss 비율
- 메모리 사용량

### 6.2 비즈니스 대시보드

- DAU/MAU 추이 (Vercel Analytics)
- 기능별 사용 빈도
- Claude API 비용 추이

---

## 7. 장애 대응 Runbook

### 7.1 DB 연결 고갈 (R-T1 대응)

**증상**: `HikariPool connection timeout` 에러 급증

**조치 순서**:
1. Supabase 대시보드에서 현재 연결 수 확인
2. 장시간 유휴 연결 강제 종료: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE idle...`
3. PgBouncer 설정에서 max_pool_size 조정
4. 임시: Cloud Run 인스턴스 수 축소 (연결 수 감소)
5. 근본 해결: 쿼리 최적화, 커넥션 풀 크기 재설정

### 7.2 Cloud Run Cold Start 급증

**증상**: P95 응답 시간 > 5초, Cold Start 횟수 증가

**조치**:
1. Minimum instances를 1→2로 증가 (Cloud Console)
2. 빌드 이미지 크기 확인 및 최적화 (레이어 캐싱)
3. 필요 시 GraalVM Native Image 검토 (빌드 시간 증가, 기동 시간 감소)

### 7.3 이메일 파싱 실패율 급증

**증상**: 파싱 성공률 < 80%, 사용자 민원 증가

**조치**:
1. 실패한 이메일 원본 샘플 수집 (S3/GCS 저장)
2. 어떤 카드사 이메일 형식이 변경됐는지 파악
3. 파싱 규칙 (Regex/DOM selector) 업데이트 → 배포
4. 파싱 실패한 사용자에게 "수동 입력" 안내 푸시 발송

### 7.4 Claude API 비용 급증

**증상**: 일간 비용 > $3

**조치**:
1. 토큰 사용량 상위 요청 로그 분석
2. 캐시 미스 원인 파악 (캐시 키 충돌, TTL 너무 짧음)
3. 프롬프트 최적화 (입력 토큰 감소)
4. 필요 시 AI 추천 기능 임시 Rate Limit 강화 (5→2 req/min)

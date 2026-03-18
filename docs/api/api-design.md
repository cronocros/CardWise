# CardWise — API 설계

> 최종 갱신: 2026-03-19
> 구현 단계에서 OpenAPI 3.1 (SpringDoc) 자동 생성 예정

---

## 1. API 설계 원칙

| 원칙 | 내용 |
|------|------|
| 스타일 | RESTful (HATEOAS 미적용) |
| Base URL | `https://api.cardwise.app/api/v1/` |
| 인증 | JWT Bearer Token (`Authorization: Bearer <token>`) |
| 응답 형식 | `application/json` |
| 에러 형식 | RFC 9457 (Problem Details for HTTP APIs) |
| 페이지네이션 | Cursor-based (timestamp + UUID) |
| 버전 관리 | URL 경로 (`/api/v1/`, `/api/v2/`) |
| 문서 | Swagger UI (`/swagger-ui.html`) — 개발/스테이징 환경만 |

---

## 2. 공통 응답 형식

### 성공 응답

```json
{
  "data": { ... },
  "meta": {
    "requestId": "req_01HX...",
    "timestamp": "2026-03-18T09:00:00Z"
  }
}
```

### 목록 응답 (페이지네이션)

```json
{
  "data": [ ... ],
  "meta": {
    "requestId": "req_01HX...",
    "timestamp": "2026-03-18T09:00:00Z",
    "pagination": {
      "nextCursor": "eyJ0aW1lc3RhbXAiOiI...",
      "hasMore": true,
      "limit": 20
    }
  }
}
```

### 에러 응답 (RFC 9457)

```json
{
  "type": "https://cardwise.app/errors/card-not-found",
  "title": "Card Not Found",
  "status": 404,
  "detail": "Card with ID 'card-abc123' does not exist for this user.",
  "instance": "/api/v1/cards/card-abc123",
  "extensions": {
    "requestId": "req_01HX..."
  }
}
```

### 공통 에러 타입

| HTTP Status | type | 상황 |
|-------------|------|------|
| 400 | /errors/invalid-request | 입력값 검증 실패 |
| 401 | /errors/unauthorized | 토큰 없음/만료 |
| 403 | /errors/forbidden | 다른 사용자 리소스 접근 |
| 404 | /errors/not-found | 리소스 없음 |
| 409 | /errors/conflict | 중복 리소스 |
| 422 | /errors/unprocessable | 비즈니스 규칙 위반 |
| 429 | /errors/rate-limit-exceeded | Rate Limit 초과 |
| 500 | /errors/internal | 서버 오류 |

---

## 3. Rate Limiting

| 엔드포인트 그룹 | 제한 | 방식 |
|----------------|------|------|
| 일반 API | 100 req/min per user | Redis Sliding Window |
| AI 추천 API | 10 req/min per user | Redis Sliding Window |
| 이메일 파싱 트리거 | 5 req/hour per user | Redis Fixed Window |
| 인증 API (로그인 등) | 10 req/5min per IP | Redis Sliding Window |

**응답 헤더**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1710748800
Retry-After: 43  (초과 시에만)
```

---

## 4. 엔드포인트 명세

### 4.1 카드 관리 (`/api/v1/cards`)

```
GET    /cards                    내 카드 목록
POST   /cards                    카드 등록
GET    /cards/{cardId}           카드 상세
DELETE /cards/{cardId}           카드 삭제
PATCH  /cards/{cardId}           카드 정보 수정 (별칭, 색상 등)
GET    /cards/{cardId}/benefits  카드 혜택 목록
GET    /cards/{cardId}/tiers     실적 구간 목록 (30만/50만/100만)
GET    /cards/{cardId}/performance  실적 현황 (연간/월간, benefitQualification·specialPeriod 포함)
```

**GET /cards/{cardId}/tiers 응답 예시**:
```json
{
  "data": {
    "currentAmount": 820000,
    "currency": "KRW",
    "tiers": [
      {
        "tierAmount": 300000,
        "achieved": true,
        "achievedAt": "2026-03-10",
        "benefits": ["스타벅스 30% 할인", "편의점 5% 캐시백"]
      },
      {
        "tierAmount": 500000,
        "achieved": true,
        "achievedAt": "2026-03-15",
        "benefits": ["주유 5% 캐시백", "외식 3% 적립"]
      },
      {
        "tierAmount": 1000000,
        "achieved": false,
        "achievedAt": null,
        "remainingAmount": 180000,
        "benefits": ["항공 마일리지 3,000점", "해외 결제 수수료 면제"]
      }
    ]
  }
}
```

### 4.2 가계부 (`/api/v1/payments`)

```
GET    /payments                 거래 목록 (cursor pagination)
POST   /payments                 거래 수동 입력
GET    /payments/{paymentId}     거래 상세
PATCH  /payments/{paymentId}     거래 수정 (메모, 카테고리)
DELETE /payments/{paymentId}     거래 삭제
GET    /payments/summary         월간 요약 (총지출, 총혜택, 카테고리별)
POST   /payments/parse-email     이메일 파싱 트리거 (비동기)
```

**GET /payments 쿼리 파라미터**:
```
?cursor=<base64-encoded-cursor>
&limit=20
&cardId=<cardId>        (선택: 특정 카드 필터)
&category=CAFE          (선택: 카테고리 필터)
&from=2026-03-01        (선택: 시작일)
&to=2026-03-31          (선택: 종료일)
```

**Payment → PaymentItem 구조**:
```json
{
  "data": {
    "id": "pay_01HX...",
    "merchantName": "쿠팡",
    "totalAmount": 45000,
    "currency": "KRW",
    "paidAt": "2026-03-18T14:30:00Z",
    "cardId": "card_01HX...",
    "items": [
      { "name": "무선 이어폰", "amount": 35000, "category": "ELECTRONICS" },
      { "name": "케이블", "amount": 10000, "category": "ELECTRONICS" }
    ],
    "appliedBenefits": [
      { "type": "CASHBACK", "amount": 1350, "description": "온라인쇼핑 3% 캐시백" }
    ]
  }
}
```

### 4.2.1 결제 보정 (`/api/v1/payments/{paymentId}/adjustments`)

```
POST   /payments/{paymentId}/adjustments     보정 생성
GET    /payments/{paymentId}/adjustments     보정 이력 조회
```

**POST /payments/{paymentId}/adjustments 요청**:
```json
{
  "adjustmentType": "FX_CORRECTION",
  "originalKrwAmount": 58500,
  "adjustedKrwAmount": 57825,
  "reason": "USD 매입 전표 확정 환율 적용"
}
```

**POST /payments/{paymentId}/adjustments 응답** (201):
```json
{
  "data": {
    "adjustmentId": 1,
    "paymentId": 123,
    "adjustmentType": "FX_CORRECTION",
    "originalKrwAmount": 58500,
    "adjustedKrwAmount": 57825,
    "differenceAmount": -675,
    "reason": "USD 매입 전표 확정 환율 적용",
    "createdAt": "2026-03-19T10:00:00Z"
  }
}
```

### 4.2.2 사용자 인박스 (`/api/v1/pending-actions`)

```
GET    /pending-actions                       확인 필요 목록
GET    /pending-actions/count                 미처리 건수 (배지용)
PATCH  /pending-actions/{actionId}/resolve    처리 완료
PATCH  /pending-actions/{actionId}/dismiss    무시
```

**GET /pending-actions 쿼리 파라미터**:
```
?status=PENDING        (PENDING | RESOLVED | DISMISSED)
&priority=HIGH         (HIGH | MEDIUM | LOW)
&cursor=<base64>
&limit=20
```

**GET /pending-actions 응답**:
```json
{
  "data": [
    {
      "pendingActionId": 1,
      "actionType": "FX_CORRECTION_NEEDED",
      "referenceTable": "payment",
      "referenceId": 123,
      "title": "USD 결제 환율 확정 필요",
      "description": "Amazon $45.00 → 확정 환율 적용 대기 중",
      "status": "PENDING",
      "priority": "HIGH",
      "createdAt": "2026-03-17T14:00:00Z"
    }
  ],
  "meta": {
    "pagination": { "nextCursor": "...", "hasMore": true, "limit": 20 }
  }
}
```

**PATCH /pending-actions/{actionId}/resolve 요청**:
```json
{
  "resolution": {
    "action": "APPLY_FX_CORRECTION",
    "adjustedAmount": 57825
  }
}
```

### 4.2.3 엑셀 업로드 (`/api/v1/payments/upload`)

```
GET    /payments/upload/template            엑셀 템플릿 다운로드
POST   /payments/upload                      엑셀 파일 업로드
```

**POST /payments/upload 요청**: `multipart/form-data`
- `file`: .xlsx 파일

**POST /payments/upload 응답** (202):
```json
{
  "data": {
    "uploadId": "upload_01HX...",
    "totalRows": 45,
    "validRows": 42,
    "duplicateRows": 2,
    "errorRows": 1,
    "status": "REVIEW_NEEDED",
    "pendingActionId": 15
  }
}
```

### 4.3 혜택 (`/api/v1/benefits`)

```
GET    /benefits                 혜택 목록 (검색/필터)
GET    /benefits/{benefitId}     혜택 상세
GET    /benefits/categories      카테고리별 최고 혜택 카드
```

**GET /benefits 쿼리 파라미터**:
```
?query=스타벅스            (가맹점 검색)
&category=CAFE            (카테고리)
&type=DISCOUNT|CASHBACK|POINTS|MILEAGE
&cardId=<cardId>          (특정 카드 혜택만)
&limit=20
```

### 4.4 바우처 (`/api/v1/vouchers`)

```
GET    /vouchers                 내 바우처 목록
GET    /vouchers/{voucherId}     바우처 상세
POST   /vouchers/{voucherId}/use 바우처 사용 처리
GET    /vouchers/expiring-soon   만료 임박 바우처 (D-7 이내)
```

### 4.5 알림 (`/api/v1/notifications`)

```
GET    /notifications            알림 목록
PATCH  /notifications/{id}/read  알림 읽음 처리
PATCH  /notifications/read-all   전체 읽음
GET    /notifications/settings   알림 설정 조회
PUT    /notifications/settings   알림 설정 변경
```

**알림 설정 예시**:
```json
{
  "data": {
    "tierAchievement": true,      // 실적 구간 달성 시
    "voucherExpiry": true,         // 바우처 만료 7일 전
    "monthlyReport": true,         // 월말 지출 리포트
    "aiRecommendation": false,     // AI 추천 알림
    "emailParsed": true            // 이메일 파싱 완료 시
  }
}
```

### 4.6 AI 추천 (`/api/v1/recommendations`)

```
POST   /recommendations/card     상황별 최적 카드 추천
POST   /recommendations/benefit  가맹점별 혜택 조회
GET    /recommendations/history  추천 이력
```

**POST /recommendations/card 요청**:
```json
{
  "query": "스타벅스 갈 건데 어떤 카드?",
  "merchantName": "스타벅스",
  "category": "CAFE",
  "expectedAmount": 5500
}
```

**POST /recommendations/card 응답**:
```json
{
  "data": {
    "recommendedCard": {
      "cardId": "card_01HX...",
      "cardName": "신한 딥드림",
      "benefit": {
        "type": "DISCOUNT",
        "rate": 0.30,
        "description": "스타벅스 30% 할인"
      },
      "estimatedSaving": 1650,
      "reason": "보유 카드 중 스타벅스 혜택 최고. 이번 달 실적 82만원으로 혜택 활성화 상태."
    },
    "alternatives": [
      {
        "cardId": "card_02HX...",
        "cardName": "KB 탄탄대로",
        "benefit": { "type": "CASHBACK", "rate": 0.05 },
        "estimatedSaving": 275
      }
    ],
    "modelUsed": "claude-sonnet-4-6",
    "cacheHit": false
  }
}
```

### 4.7 대시보드 (`/api/v1/dashboard`)

```
GET    /dashboard                대시보드 요약 데이터 (캐시 5분)
```

**GET /dashboard 응답**:
```json
{
  "data": {
    "greeting": "안녕하세요, 김민지님!",
    "currentMonth": {
      "totalExpense": 1234800,
      "totalBenefit": 45200,
      "netCost": 1189600,
      "currency": "KRW"
    },
    "topCard": {
      "cardId": "card_01HX...",
      "cardName": "신한 딥드림",
      "currentPerformance": 820000,
      "nextTierAmount": 1000000,
      "nextTierRemaining": 180000
    },
    "recentTransactions": [ ... ],
    "expiringVouchers": [ ... ],
    "achievedTierToday": {
      "achieved": true,
      "tierAmount": 500000,
      "cardName": "신한 딥드림"
    }
  }
}
```

### 4.8 인증/계정 (`/api/v1/auth`, `/api/v1/account`)

```
POST   /auth/signup              이메일 회원가입
POST   /auth/login               이메일 로그인
POST   /auth/logout              로그아웃 (Refresh Token 쿠키 삭제)
POST   /auth/refresh             토큰 갱신 (Refresh Token → 새 Access Token)
POST   /auth/forgot-password     비밀번호 재설정 이메일 전송
POST   /auth/reset-password      비밀번호 재설정 처리
GET    /auth/callback/:provider  OAuth 콜백 (google, kakao)
```

**POST /auth/signup 요청**:
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1",
  "displayName": "김민지"
}
```

**POST /auth/signup 응답**:
```json
{
  "data": {
    "accountId": "uuid-...",
    "email": "user@example.com",
    "message": "인증 이메일이 발송되었습니다."
  }
}
```

```
GET    /account/profile          프로필 조회
PATCH  /account/profile          프로필 수정 (displayName, birthYear, gender)
PUT    /account/password         비밀번호 변경 (currentPassword, newPassword)
DELETE /account                  계정 삭제 요청 (30일 유예)
POST   /account/deactivate      계정 비활성화
```

**PATCH /account/profile 요청**:
```json
{
  "displayName": "김민지",
  "birthYear": 1995,
  "gender": "F"
}
```

### 4.9 그룹 (`/api/v1/groups`)

```
POST   /groups                              그룹 생성
GET    /groups                              내 그룹 목록
GET    /groups/{groupId}                    그룹 상세
PATCH  /groups/{groupId}                    그룹 설정 수정 (OWNER)
DELETE /groups/{groupId}                    그룹 삭제 (OWNER)
POST   /groups/{groupId}/invite             멤버 초대 (OWNER)
DELETE /groups/{groupId}/members/{memberId}  멤버 추방 (OWNER)
POST   /groups/{groupId}/leave              그룹 탈퇴 (MEMBER)
GET    /groups/{groupId}/payments           그룹 가계부 조회
POST   /groups/{groupId}/payments           그룹 결제 입력
GET    /groups/{groupId}/tags               그룹 태그 목록
POST   /groups/{groupId}/tags               그룹 태그 생성
GET    /groups/{groupId}/stats              그룹 통계 (멤버별/태그별)
```

**POST /groups 요청**:
```json
{
  "groupName": "우리 가족",
  "description": "가족 공동 가계부"
}
```

**POST /groups/{groupId}/invite 요청**:
```json
{
  "email": "family@example.com"
}
```

**GET /groups/{groupId}/stats 응답**:
```json
{
  "data": {
    "groupId": 1,
    "groupName": "우리 가족",
    "currentMonth": {
      "totalExpense": 2450000,
      "currency": "KRW"
    },
    "memberStats": [
      { "accountId": "uuid-1", "displayName": "김민지", "spent": 1200000 },
      { "accountId": "uuid-2", "displayName": "박영희", "spent": 1250000 }
    ],
    "tagStats": [
      { "tagName": "식비", "amount": 800000, "count": 25 },
      { "tagName": "교통비", "amount": 350000, "count": 40 }
    ]
  }
}
```

### 4.10 태그 (`/api/v1/tags`)

```
GET    /tags                       내 태그 목록 (자동완성용, ?q=검색어)
POST   /tags                       태그 생성
DELETE /tags/{tagId}                태그 삭제
GET    /tags/stats                  태그별 통계 (?from=&to=&tagId=)
GET    /tags/stats/cross            교차 분석 (?dimension=category|member|period|tag&tagId=)
```

**GET /tags/stats 응답**:
```json
{
  "data": [
    {
      "tagId": 1,
      "tagName": "용돈",
      "totalAmount": 350000,
      "count": 12,
      "currency": "KRW"
    }
  ]
}
```

**GET /tags/stats/cross?dimension=category&tagId=1 응답**:
```json
{
  "data": {
    "tagName": "용돈",
    "crossDimension": "category",
    "breakdown": [
      { "categoryName": "카페", "amount": 85000, "count": 5 },
      { "categoryName": "분식", "amount": 120000, "count": 4 },
      { "categoryName": "편의점", "amount": 45000, "count": 3 }
    ]
  }
}
```

---

## 5. 인증 흐름

```
1. 클라이언트 → Supabase Auth (로그인)
2. Supabase Auth → 클라이언트 (Access Token + Refresh Token)
3. 클라이언트 → CardWise Backend (Authorization: Bearer <access_token>)
4. Backend → Supabase (JWT 서명 검증)
5. Backend → 응답
```

**토큰 전략**:
- Access Token: 메모리 저장 (60분 만료)
- Refresh Token: httpOnly + Secure + SameSite=Strict Cookie (7일 만료)
- Refresh Token Rotation: 사용 시마다 새 토큰 발급

---

## 6. 페이지네이션 상세

Cursor 기반 (Offset 방식 사용 금지 — 실시간 데이터 정합성):

```
cursor = base64(JSON({ "timestamp": "2026-03-18T14:30:00Z", "id": "pay_01HX..." }))
```

클라이언트는 `meta.pagination.nextCursor`를 다음 요청의 `?cursor=` 파라미터로 사용.

---

## 7. API 버전 관리

| 버전 | 상태 | 설명 |
|------|------|------|
| v1 | 현재 (개발 예정) | MVP |
| v2 | 미정 | MSA 전환 시 필요할 수 있음 |

- 기존 버전 최소 6개월 유지 후 Deprecation 공지
- `Sunset` 헤더로 폐기 예정일 안내

---

## 8. API 문서화 & 테스트 전략

### 8.1 SpringDoc OpenAPI 3.1

| 항목 | 내용 |
|------|------|
| 의존성 | `org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8+` |
| Swagger UI | `/swagger-ui.html` (dev/staging만 활성화) |
| OpenAPI JSON | `/v3/api-docs` |
| prod 비활성화 | `springdoc.swagger-ui.enabled=false` |

**어노테이션 사용 규칙**:
- `@Tag(name = "Cards")` — Bounded Context별 그룹화
- `@Operation(summary = "카드 등록")` — 엔드포인트 설명
- `@ApiResponse` — 응답 상태 코드별 문서화
- `@Schema` — DTO 필드 설명

> SpringDoc은 Springfox의 후속 프로젝트로, 2026년 현재 Spring Boot 3.x의 표준 OpenAPI 도구이다.

### 8.2 API 테스트 도구

| 용도 | 도구 | 비고 |
|------|------|------|
| 인터랙티브 테스트 | Swagger UI | 개발/스테이징 환경 |
| 수동/탐색 테스트 | Bruno | git-friendly, 오픈소스, Postman 대안 |
| CI 자동 테스트 | Spring MockMvc | test-strategy.md 참조 |
| 부하 테스트 | k6 | Phase 1.5에서 도입 |

**Bruno 컬렉션 관리**:
- 저장 경로: `backend/api-tests/`
- git commit 대상 (팀 공유)
- 환경 파일: local, staging 분리

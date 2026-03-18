# CardWise 인증 및 계정 관리 설계

> 한국 신용카드 혜택 관리 플랫폼 — 인증/인가 및 계정 관리 아키텍처 설계 문서
>
> 최종 갱신: 2026-03-18

---

## 목차

1. [개요](#1-개요)
2. [Auth Provider 설정](#2-auth-provider-설정)
3. [회원가입 흐름](#3-회원가입-흐름)
4. [로그인 흐름](#4-로그인-흐름)
5. [비밀번호 재설정](#5-비밀번호-재설정)
6. [세션 관리](#6-세션-관리)
7. [계정 관리](#7-계정-관리)
8. [보안 고려사항](#8-보안-고려사항)
9. [BFF 패턴과 인증](#9-bff-패턴과-인증)
10. [프로세스 흐름 다이어그램](#10-프로세스-흐름-다이어그램)

---

## 1. 개요

CardWise는 **Supabase Auth**를 인증 인프라로 사용하며, JWT 기반의 Stateless 인증을 구현한다.

### 핵심 설계 원칙

| 원칙 | 설명 |
|------|------|
| Supabase Auth 위임 | 회원가입, 로그인, 토큰 발급/갱신을 Supabase에 위임 |
| JWT Stateless 인증 | Access Token으로 API 요청 인증, 서버 세션 불필요 |
| OAuth 지원 | Google, Kakao 소셜 로그인 (한국 시장 필수) |
| BFF 패턴 준수 | Client Component는 반드시 Next.js API Route 경유 |
| Token 보안 | Access Token 메모리 저장, Refresh Token httpOnly 쿠키 |

### 인증 아키텍처 개요

```
+------------------+        +------------------+        +------------------+
|                  |  JWT   |                  |  JWT   |                  |
|   Next.js (FE)   +------->+  Next.js API     +------->+  Spring Boot     |
|   Client Comp.   |        |  Route (BFF)     |        |  (Backend)       |
|                  |        |                  |        |                  |
+--------+---------+        +--------+---------+        +--------+---------+
         |                           |                           |
         |                           |                           |
         v                           v                           v
+--------+---------+        +--------+---------+        +--------+---------+
|                  |        |                  |        |                  |
|  Supabase Auth   |        |  Redis Session   |        |  PostgreSQL DB   |
|  (Provider)      |        |  Cache           |        |  (Supabase)      |
|                  |        |                  |        |                  |
+------------------+        +------------------+        +------------------+
```

---

## 2. Auth Provider 설정

### 2.1 지원 Provider 목록

| Provider | 용도 | Scope | 우선순위 |
|----------|------|-------|----------|
| Email/Password | 기본 인증 | - | MVP |
| Google OAuth 2.0 | 글로벌 소셜 로그인 | `openid`, `email`, `profile` | MVP |
| Kakao OAuth | 한국 사용자 필수 | `profile_nickname`, `account_email` | MVP |

### 2.2 Callback URL 설정

모든 OAuth Provider의 Callback URL은 통일된 패턴을 따른다:

```
/api/auth/callback/:provider
```

| 환경 | Callback URL |
|------|-------------|
| 로컬 개발 | `http://localhost:3000/api/auth/callback/:provider` |
| 스테이징 | `https://staging.cardwise.kr/api/auth/callback/:provider` |
| 운영 | `https://cardwise.kr/api/auth/callback/:provider` |

### 2.3 Supabase Auth 설정

```
Supabase Dashboard > Authentication > Providers
├── Email
│   ├── Enable Email Signup: ON
│   ├── Confirm Email: ON (Magic Link)
│   ├── Double Confirm Changes: ON
│   └── Secure Email Change: ON
├── Google
│   ├── Client ID: {GOOGLE_CLIENT_ID}
│   ├── Client Secret: {GOOGLE_CLIENT_SECRET}
│   └── Authorized Redirect URI: /api/auth/callback/google
└── Kakao
    ├── REST API Key: {KAKAO_REST_API_KEY}
    ├── Client Secret: {KAKAO_CLIENT_SECRET}
    └── Authorized Redirect URI: /api/auth/callback/kakao
```

### 2.4 Kakao OAuth 추가 설정

한국 서비스 필수 사항:

| 항목 | 설정값 |
|------|--------|
| Kakao Developers 앱 등록 | 비즈 앱 전환 필수 (이메일 수집) |
| 동의 항목 | `profile_nickname` (필수), `account_email` (필수) |
| 카카오 로그인 활성화 | ON |
| Redirect URI 등록 | Supabase Auth Callback URL |
| 비즈 앱 전환 사유 | 이메일 기반 계정 연동 |

---

## 3. 회원가입 흐름

### 3.1 이메일/비밀번호 회원가입

1. 사용자가 회원가입 폼 작성 (이메일, 비밀번호, display_name)
2. 프론트엔드에서 Zod 스키마로 입력값 검증
3. `POST /api/auth/signup` → Supabase `auth.signUp()` 호출
4. Supabase가 인증 이메일 발송 (Magic Link)
5. 사용자가 이메일 링크 클릭 → 이메일 인증 완료
6. 인증 완료 시 Database Trigger로 초기 데이터 생성:
   - `account` 레코드 생성 (Supabase Auth UUID 연결)
   - `account_profile` 레코드 생성 (display_name 설정)
   - `subscription` 레코드 생성 (plan: `FREE`)
   - `notification_setting` 레코드 생성 (기본값)

### 3.2 OAuth 회원가입 (Google / Kakao)

1. 사용자가 "Google로 시작" 또는 "카카오로 시작" 버튼 클릭
2. `POST /api/auth/signin/oauth` → Supabase `auth.signInWithOAuth()` 호출
3. Provider 로그인 페이지로 리다이렉트
4. 사용자 인증 완료 → `/api/auth/callback/:provider`로 리다이렉트
5. Callback에서 `code`를 `session`으로 교환
6. 최초 로그인 시 Database Trigger로 `account` + 관련 테이블 upsert:
   - `account.email` = Provider에서 받은 이메일
   - `account_profile.display_name` = Provider에서 받은 이름
   - 기존 이메일과 일치하는 계정이 있으면 연결 (Account Linking)

### 3.3 비밀번호 정책

| 규칙 | 조건 |
|------|------|
| 최소 길이 | 8자 이상 |
| 영문 포함 | 대문자 또는 소문자 1개 이상 |
| 숫자 포함 | 숫자 1개 이상 |
| 특수문자 포함 | 특수문자 1개 이상 (`!@#$%^&*` 등) |
| 최대 길이 | 128자 이하 |

Zod 검증 스키마 (프론트엔드):

```typescript
const passwordSchema = z
  .string()
  .min(8, '비밀번호는 8자 이상이어야 합니다')
  .max(128, '비밀번호는 128자 이하여야 합니다')
  .regex(/[a-zA-Z]/, '영문을 1자 이상 포함해야 합니다')
  .regex(/[0-9]/, '숫자를 1자 이상 포함해야 합니다')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, '특수문자를 1자 이상 포함해야 합니다');
```

### 3.4 회원가입 시 초기 데이터 생성 (Database Trigger)

```sql
-- Supabase Database Trigger: auth.users INSERT 시 실행
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- account 생성
  INSERT INTO public.account (id, email)
  VALUES (NEW.id, NEW.email);

  -- account_profile 생성
  INSERT INTO public.account_profile (account_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));

  -- subscription 생성 (FREE 플랜)
  INSERT INTO public.subscription (account_id, plan)
  VALUES (NEW.id, 'FREE');

  -- notification_setting 생성 (기본값)
  INSERT INTO public.notification_setting (account_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## 4. 로그인 흐름

### 4.1 이메일/비밀번호 로그인

1. 사용자가 이메일, 비밀번호 입력
2. `POST /api/auth/signin` → Supabase `auth.signInWithPassword()` 호출
3. 인증 성공 시:
   - **Access Token**: 메모리 저장 (60분 만료)
   - **Refresh Token**: httpOnly 쿠키 저장 (7일 만료, Secure, SameSite=Strict)
4. Redis에 세션 정보 캐싱: `session:{accountId}` (24h TTL)

### 4.2 OAuth 로그인 (Google / Kakao)

1. 사용자가 소셜 로그인 버튼 클릭
2. `POST /api/auth/signin/oauth` → Supabase `auth.signInWithOAuth()` 호출
3. Provider 로그인 페이지로 리다이렉트
4. 인증 완료 → `/api/auth/callback/:provider`로 리다이렉트
5. Callback Handler에서 `code` → `session` 교환
6. Token 발급 (이메일 로그인과 동일한 토큰 저장 방식)

### 4.3 Token 구성

| Token | 저장 위치 | 만료 시간 | 용도 |
|-------|----------|----------|------|
| Access Token (JWT) | 메모리 (JavaScript 변수) | 60분 | API 요청 인증 |
| Refresh Token | httpOnly Cookie | 7일 | Access Token 갱신 |

### 4.4 Access Token Payload (JWT Claims)

```json
{
  "sub": "uuid-account-id",
  "email": "user@example.com",
  "role": "authenticated",
  "aud": "authenticated",
  "exp": 1700000000,
  "iat": 1699996400,
  "app_metadata": {
    "provider": "email"
  },
  "user_metadata": {
    "display_name": "사용자"
  }
}
```

### 4.5 Refresh Token Rotation

Supabase Auth는 **Refresh Token Rotation**을 기본 지원한다:

| 항목 | 동작 |
|------|------|
| 갱신 시 | 기존 Refresh Token 무효화 + 새 Refresh Token 발급 |
| 재사용 감지 | 이미 사용된 Refresh Token으로 갱신 시도 시 모든 세션 무효화 |
| Family 추적 | Supabase가 Token Family를 추적하여 탈취 감지 |

---

## 5. 비밀번호 재설정

### 5.1 흐름

1. 사용자가 "비밀번호 찾기" 페이지에서 이메일 입력
2. `POST /api/auth/forgot-password` → Supabase `auth.resetPasswordForEmail()` 호출
3. Supabase가 비밀번호 재설정 이메일 발송
4. 사용자가 이메일 내 링크 클릭 → `/auth/reset-password?token=...`으로 이동
5. 새 비밀번호 입력 (비밀번호 정책 검증)
6. `POST /api/auth/reset-password` → Supabase `auth.updateUser({ password })` 호출
7. 비밀번호 변경 완료 → 로그인 페이지로 리다이렉트

### 5.2 보안 규칙

| 항목 | 설정 |
|------|------|
| 토큰 만료 시간 | 1시간 |
| 토큰 일회용 | 사용 후 즉시 무효화 |
| Rate Limiting | 동일 이메일 5회/시간 제한 |
| 이메일 열거 방지 | 존재하지 않는 이메일에도 동일한 응답 반환 |

---

## 6. 세션 관리

### 6.1 Silent Refresh (자동 갱신)

Access Token 만료 **5분 전**에 자동으로 갱신을 수행한다:

```
Token 발급 (T=0)
    |
    |--- 55분 경과 ---
    |
    v
Silent Refresh 트리거 (T=55min)
    |
    POST /api/auth/refresh
    |
    Supabase auth.refreshSession()
    |
    v
새 Access Token (60분) + 새 Refresh Token (7일) 발급
```

구현 방식:
- `setInterval`로 Access Token의 `exp` 클레임 기준 갱신 타이머 설정
- Supabase Client의 `onAuthStateChange` 이벤트 리스너 활용
- 네트워크 오류 시 exponential backoff 재시도 (최대 3회)

### 6.2 다중 디바이스 세션

| 항목 | 동작 |
|------|------|
| 세션 독립성 | 각 디바이스/브라우저별 독립적인 Refresh Token 발급 |
| 동시 로그인 | 제한 없음 (MVP), 향후 최대 세션 수 제한 가능 |
| 세션 목록 조회 | 향후 "활성 세션 관리" 기능에서 제공 (Phase 2) |

### 6.3 로그아웃

1. `POST /api/auth/signout` 호출
2. Supabase `auth.signOut()` → Access Token 무효화
3. Refresh Token httpOnly 쿠키 삭제 (`Set-Cookie: Max-Age=0`)
4. Redis 세션 캐시 삭제: `DEL session:{accountId}`
5. 클라이언트 메모리의 Access Token 폐기
6. `/login` 페이지로 리다이렉트

### 6.4 Redis 세션 캐시

| 항목 | 설정 |
|------|------|
| Key 패턴 | `session:{accountId}` |
| TTL | 24시간 |
| 저장 데이터 | `{ accountId, email, plan, lastAccessAt }` |
| 용도 | 빈번한 세션 조회 시 DB 부하 경감 |
| 갱신 시점 | 로그인, Token Refresh, 프로필 변경 시 |

```
Redis Key 구조:

session:{accountId}
├── accountId    : UUID
├── email        : string
├── plan         : "FREE" | "PREMIUM"
└── lastAccessAt : ISO 8601 timestamp
```

---

## 7. 계정 관리

### 7.1 프로필 수정

| 항목 | 엔드포인트 | 수정 가능 필드 |
|------|-----------|---------------|
| 프로필 수정 | `PATCH /api/account/profile` | `display_name`, `birth_year`, `gender` |

- `display_name`: 2~20자, 공백/특수문자 제한
- `birth_year`: 1900~현재연도 사이 정수
- `gender`: `M` \| `F` \| `null` (선택)

### 7.2 비밀번호 변경

| 항목 | 설정 |
|------|------|
| 엔드포인트 | `PUT /api/account/password` |
| 현재 비밀번호 확인 | 필수 (재인증) |
| 새 비밀번호 정책 | 3.3절 비밀번호 정책과 동일 |
| 변경 후 동작 | 현재 세션 유지, 타 디바이스 세션 무효화 |
| OAuth 전용 계정 | 비밀번호 변경 불가 (비밀번호 미설정 상태) |

### 7.3 계정 비활성화 (Soft Delete)

| 단계 | 동작 |
|------|------|
| 비활성화 요청 | `DELETE /api/account` → `account.deleted_at = NOW()` |
| 즉시 효과 | 로그인 차단, API 접근 차단, 모든 세션 무효화 |
| 유예 기간 | 30일 (기간 내 복구 가능) |
| 복구 | `/api/auth/reactivate` → `account.deleted_at = NULL` |
| 유예 기간 만료 | Hard Delete 실행 |

### 7.4 계정 삭제 (Hard Delete)

유예 기간(30일) 만료 후 배치 작업으로 실행:

| 순서 | 삭제 대상 | 처리 방식 |
|------|----------|----------|
| 1 | `notification_setting` | CASCADE DELETE |
| 2 | `subscription` | CASCADE DELETE |
| 3 | `user_voucher_log` | CASCADE DELETE |
| 4 | `user_voucher` | CASCADE DELETE |
| 5 | `user_benefit_usage` | CASCADE DELETE |
| 6 | `user_performance` | CASCADE DELETE |
| 7 | `payment_item_tag` → `payment_item` → `payment` | CASCADE DELETE |
| 8 | `payment_draft` | CASCADE DELETE |
| 9 | `user_card` | CASCADE DELETE |
| 10 | `account_profile` | CASCADE DELETE |
| 11 | `account` | DELETE |
| 12 | Supabase `auth.users` | `auth.admin.deleteUser()` |

### 7.5 PIPA (개인정보보호법) 준수

| 의무 | CardWise 대응 |
|------|--------------|
| 데이터 삭제 요청 | 요청 접수 후 30일 내 처리 완료 |
| 삭제 확인 통보 | 삭제 완료 시 이메일 통보 |
| 최소 수집 원칙 | 이메일, display_name, birth_year, gender만 수집 |
| 수집 동의 | 회원가입 시 개인정보 수집·이용 동의 필수 |
| 처리방침 공개 | 개인정보 처리방침 페이지 제공 |
| 파기 기록 | 삭제 실행 로그 보존 (5년) |

---

## 8. 보안 고려사항

### 8.1 CSRF 방어

| 방어 수단 | 설명 |
|----------|------|
| SameSite=Strict | Refresh Token 쿠키에 `SameSite=Strict` 설정 |
| httpOnly | JavaScript에서 쿠키 접근 불가 |
| Secure | HTTPS에서만 쿠키 전송 (운영 환경) |

### 8.2 Brute Force 방어

`/api/auth/*` 엔드포인트에 Rate Limiting 적용:

| 항목 | 설정 |
|------|------|
| 제한 기준 | IP 주소 |
| 허용량 | 10 req / 5분 |
| 알고리즘 | Redis Sliding Window |
| 초과 시 응답 | `429 Too Many Requests` |
| Redis Key | `ratelimit:auth:{ip}` |
| TTL | 5분 |

```
Redis Sliding Window 동작:

ZADD ratelimit:auth:{ip} {timestamp} {requestId}
ZREMRANGEBYSCORE ratelimit:auth:{ip} -inf {timestamp - 300}
ZCARD ratelimit:auth:{ip}
→ count > 10 이면 429 반환
```

### 8.3 XSS 방어

| 항목 | 대응 |
|------|------|
| Access Token | **메모리 저장** (JavaScript 변수, Zustand store) |
| localStorage 금지 | Access Token을 localStorage/sessionStorage에 저장하지 않음 |
| Refresh Token | httpOnly 쿠키 (JavaScript 접근 불가) |
| CSP 헤더 | `Content-Security-Policy` 설정으로 인라인 스크립트 제한 |

### 8.4 Token 탈취 대응

| 시나리오 | 대응 |
|----------|------|
| Access Token 탈취 | 60분 후 자동 만료, 피해 범위 제한 |
| Refresh Token 탈취 | Refresh Token Rotation으로 단일 사용 보장 |
| 재사용 감지 | 이미 교환된 Refresh Token 재사용 시 → **해당 Token Family 전체 무효화** |
| 전체 세션 무효화 | 의심 상황 발생 시 `auth.admin.signOut(userId, 'global')` |

```
Refresh Token Rotation + 재사용 감지:

정상 흐름:
  RT-1 → RT-2 → RT-3 (각 사용 시 이전 토큰 무효화)

탈취 시나리오:
  공격자: RT-1 사용 시도
  → RT-1은 이미 RT-2로 교환됨 (무효)
  → Supabase가 재사용 감지
  → RT-1, RT-2, RT-3... Token Family 전체 무효화
  → 사용자 재로그인 필요
```

### 8.5 추가 보안 설정

| 항목 | 설정 |
|------|------|
| CORS | 허용 Origin: `cardwise.kr`, `localhost:3000` |
| HSTS | `Strict-Transport-Security: max-age=31536000` |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` |
| Referrer-Policy | `strict-origin-when-cross-origin` |

---

## 9. BFF 패턴과 인증

### 9.1 Client Component → Next.js API Route 경유 (필수)

모든 인증 관련 요청은 Next.js API Route를 경유한다:

```
Client Component
    |
    POST /api/auth/signin       ← 로그인
    POST /api/auth/signup       ← 회원가입
    POST /api/auth/signout      ← 로그아웃
    POST /api/auth/refresh      ← 토큰 갱신
    POST /api/auth/forgot-password  ← 비밀번호 재설정 요청
    POST /api/auth/reset-password   ← 비밀번호 재설정 실행
    GET  /api/auth/callback/:provider  ← OAuth Callback
    PATCH /api/account/profile   ← 프로필 수정
    PUT   /api/account/password  ← 비밀번호 변경
    DELETE /api/account          ← 계정 비활성화
```

### 9.2 Server Component → Supabase 서버 클라이언트 직접 사용

Server Component에서는 Supabase 서버 클라이언트를 통해 세션을 직접 확인할 수 있다:

```typescript
// app/dashboard/page.tsx (Server Component)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // 읽기 전용 데이터 조회 가능
  const { data: profile } = await supabase
    .from('account_profile')
    .select('*')
    .eq('account_id', session.user.id)
    .single();

  return <Dashboard profile={profile} />;
}
```

### 9.3 middleware.ts — 경로 보호

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요한 경로
const PROTECTED_ROUTES = [
  '/dashboard',
  '/cards',
  '/ledger',
  '/benefits',
  '/settings',
  '/analytics',
];

// 인증된 사용자가 접근하면 안 되는 경로
const AUTH_ROUTES = ['/login', '/signup', '/auth'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  // 미인증 사용자가 보호 경로 접근 시 → /login 리다이렉트
  if (!session && PROTECTED_ROUTES.some((route) => path.startsWith(route))) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }

  // 인증된 사용자가 auth 경로 접근 시 → /dashboard 리다이렉트
  if (session && AUTH_ROUTES.some((route) => path.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
```

### 9.4 API Route 인증 미들웨어

```typescript
// lib/auth/api-guard.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function withAuth(
  handler: (req: Request, session: Session) => Promise<NextResponse>
) {
  return async (req: Request) => {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error } = await supabase.auth.getSession();

    if (!session || error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(req, session);
  };
}
```

---

## 10. 프로세스 흐름 다이어그램

### 10.1 이메일 회원가입 흐름

```
사용자                  Next.js (BFF)           Supabase Auth          PostgreSQL
  |                        |                        |                      |
  |  1. 가입 폼 제출       |                        |                      |
  |  (email, pw, name)    |                        |                      |
  +----------------------->|                        |                      |
  |                        |  2. signUp()           |                      |
  |                        +----------------------->|                      |
  |                        |                        |  3. auth.users INSERT|
  |                        |                        +--------------------->|
  |                        |                        |                      |
  |                        |                        |  4. Trigger 실행     |
  |                        |                        |  account, profile,   |
  |                        |                        |  subscription,       |
  |                        |                        |  notification INSERT |
  |                        |                        |<---------------------+
  |                        |                        |                      |
  |                        |  5. 응답 (확인 필요)    |                      |
  |                        |<-----------------------+                      |
  |  6. "이메일 확인" 안내  |                        |                      |
  |<-----------------------+                        |                      |
  |                        |                        |                      |
  |  7. 이메일 링크 클릭   |                        |                      |
  +------------------------------------------------>|                      |
  |                        |                        |  8. email_confirmed  |
  |                        |                        +--------------------->|
  |  9. 로그인 페이지 이동  |                        |                      |
  |<------------------------------------------------+                      |
```

### 10.2 이메일 로그인 흐름

```
사용자                  Next.js (BFF)           Supabase Auth           Redis
  |                        |                        |                      |
  |  1. 로그인 요청        |                        |                      |
  |  (email, password)    |                        |                      |
  +----------------------->|                        |                      |
  |                        |  2. signInWithPassword()|                     |
  |                        +----------------------->|                      |
  |                        |                        |                      |
  |                        |  3. JWT + Refresh Token|                      |
  |                        |<-----------------------+                      |
  |                        |                        |                      |
  |                        |  4. 세션 캐시 저장      |                      |
  |                        |  SET session:{id}      |                      |
  |                        +---------------------------------------------->|
  |                        |                        |                      |
  |  5. Access Token       |                        |                      |
  |     (메모리 저장)       |                        |                      |
  |  + Refresh Token       |                        |                      |
  |     (httpOnly Cookie)  |                        |                      |
  |<-----------------------+                        |                      |
  |                        |                        |                      |
  |  6. /dashboard 이동    |                        |                      |
  +----------------------->|                        |                      |
```

### 10.3 OAuth 로그인 흐름 (Google / Kakao)

```
사용자                  Next.js (BFF)           Supabase Auth          Provider
  |                        |                        |                      |
  |  1. "소셜 로그인" 클릭 |                        |                      |
  +----------------------->|                        |                      |
  |                        |  2. signInWithOAuth()  |                      |
  |                        +----------------------->|                      |
  |                        |                        |                      |
  |  3. Provider 로그인    |                        |                      |
  |     페이지 리다이렉트   |                        |                      |
  |<--------------------------------------------------------+              |
  |                        |                        |       |              |
  |  4. Provider 로그인    |                        |       |              |
  +---------------------------------------------------------------->       |
  |                        |                        |                      |
  |  5. Callback 리다이렉트 |                        |                     |
  |     /api/auth/callback/:provider?code=xxx                              |
  |<-----------------------------------------------------------------------+
  |                        |                        |                      |
  +----------------------->|                        |                      |
  |                        |  6. code → session     |                      |
  |                        |     교환               |                      |
  |                        +----------------------->|                      |
  |                        |                        |                      |
  |                        |  7. JWT + Refresh Token|                      |
  |                        |  (신규 시 account 생성) |                      |
  |                        |<-----------------------+                      |
  |                        |                        |                      |
  |  8. Token 저장 +       |                        |                      |
  |     /dashboard 이동    |                        |                      |
  |<-----------------------+                        |                      |
```

### 10.4 Token 갱신 (Silent Refresh) 흐름

```
사용자                  Next.js (BFF)           Supabase Auth           Redis
  |                        |                        |                      |
  |  [Access Token 만료    |                        |                      |
  |   5분 전 자동 트리거]   |                        |                      |
  |                        |                        |                      |
  |  1. POST /api/auth/refresh                      |                      |
  |  (Refresh Token =      |                        |                      |
  |   httpOnly Cookie)    |                        |                      |
  +----------------------->|                        |                      |
  |                        |  2. refreshSession()   |                      |
  |                        |  (Refresh Token 전달)  |                      |
  |                        +----------------------->|                      |
  |                        |                        |                      |
  |                        |  3. 새 Access Token    |                      |
  |                        |  + 새 Refresh Token    |                      |
  |                        |  (Rotation)            |                      |
  |                        |<-----------------------+                      |
  |                        |                        |                      |
  |                        |  4. 세션 캐시 갱신      |                      |
  |                        +---------------------------------------------->|
  |                        |                        |                      |
  |  5. 새 Access Token    |                        |                      |
  |     (메모리 교체)       |                        |                      |
  |  + 새 Refresh Token    |                        |                      |
  |     (Cookie 교체)      |                        |                      |
  |<-----------------------+                        |                      |
```

### 10.5 비밀번호 재설정 흐름

```
사용자                  Next.js (BFF)           Supabase Auth          이메일
  |                        |                        |                      |
  |  1. 이메일 입력        |                        |                      |
  |  POST /api/auth/       |                        |                      |
  |  forgot-password       |                        |                      |
  +----------------------->|                        |                      |
  |                        |  2. resetPasswordForEmail()                   |
  |                        +----------------------->|                      |
  |                        |                        |  3. 재설정 링크 발송  |
  |                        |                        +--------------------->|
  |                        |                        |                      |
  |  4. "이메일 확인" 안내  |                        |                      |
  |<-----------------------+                        |                      |
  |                        |                        |                      |
  |  5. 이메일 링크 클릭   |                        |                      |
  |  /auth/reset-password  |                        |                      |
  |  ?token=xxx            |                        |                      |
  +----------------------->|                        |                      |
  |                        |                        |                      |
  |  6. 새 비밀번호 입력   |                        |                      |
  |  POST /api/auth/       |                        |                      |
  |  reset-password        |                        |                      |
  +----------------------->|                        |                      |
  |                        |  7. updateUser()       |                      |
  |                        |  { password: new }     |                      |
  |                        +----------------------->|                      |
  |                        |                        |                      |
  |                        |  8. 변경 완료          |                      |
  |                        |<-----------------------+                      |
  |  9. 로그인 페이지 이동  |                        |                      |
  |<-----------------------+                        |                      |
```

### 10.6 로그아웃 흐름

```
사용자                  Next.js (BFF)           Supabase Auth           Redis
  |                        |                        |                      |
  |  1. 로그아웃 클릭      |                        |                      |
  |  POST /api/auth/signout|                        |                      |
  +----------------------->|                        |                      |
  |                        |  2. signOut()          |                      |
  |                        +----------------------->|                      |
  |                        |                        |                      |
  |                        |  3. Token 무효화 완료  |                      |
  |                        |<-----------------------+                      |
  |                        |                        |                      |
  |                        |  4. 세션 캐시 삭제      |                      |
  |                        |  DEL session:{id}      |                      |
  |                        +---------------------------------------------->|
  |                        |                        |                      |
  |  5. Refresh Token      |                        |                      |
  |     쿠키 삭제          |                        |                      |
  |  + Access Token        |                        |                      |
  |     메모리 폐기        |                        |                      |
  |  + /login 리다이렉트   |                        |                      |
  |<-----------------------+                        |                      |
```

---

## 부록: API 엔드포인트 요약

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|----------|
| `POST` | `/api/auth/signup` | 이메일 회원가입 | No |
| `POST` | `/api/auth/signin` | 이메일 로그인 | No |
| `POST` | `/api/auth/signin/oauth` | OAuth 로그인 시작 | No |
| `GET` | `/api/auth/callback/:provider` | OAuth Callback | No |
| `POST` | `/api/auth/signout` | 로그아웃 | Yes |
| `POST` | `/api/auth/refresh` | Token 갱신 | Cookie |
| `POST` | `/api/auth/forgot-password` | 비밀번호 재설정 요청 | No |
| `POST` | `/api/auth/reset-password` | 비밀번호 재설정 실행 | Token |
| `POST` | `/api/auth/reactivate` | 계정 복구 | No |
| `PATCH` | `/api/account/profile` | 프로필 수정 | Yes |
| `PUT` | `/api/account/password` | 비밀번호 변경 | Yes |
| `DELETE` | `/api/account` | 계정 비활성화 | Yes |

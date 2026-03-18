# AUTH - 회원가입 / 로그인 / OAuth

> 최종 갱신: 2026-03-18

---

## 1. 개요

### 목적

CardWise 서비스의 사용자 인증 체계를 정의한다. 이메일 기반 회원가입/로그인과 OAuth(Google, Kakao) 소셜 로그인을 지원하며, Supabase Auth를 인증 백엔드로 사용한다. JWT 기반 토큰 관리(Access Token 메모리 저장, Refresh Token httpOnly Cookie)를 통해 보안성과 UX를 동시에 확보한다.

### 대상 사용자

- 신규 가입 희망 사용자 (이메일 또는 소셜 계정 보유자)
- 기존 회원 (로그인, 비밀번호 재설정, 로그아웃)
- OAuth 연동 사용자 (Google, Kakao 계정 보유자)

---

## 2. 유저 스토리

| ID | 역할 | 스토리 | 비즈니스 가치 |
|----|------|--------|-------------|
| AUTH-US-01 | 비회원 | 이메일과 비밀번호로 회원가입하여 CardWise 서비스를 이용하고 싶다 | 사용자 획득 |
| AUTH-US-02 | 비회원 | Google 계정으로 간편 가입하여 별도 비밀번호 없이 시작하고 싶다 | 가입 전환율 향상 |
| AUTH-US-03 | 비회원 | Kakao 계정으로 간편 가입하여 한국 환경에 친숙한 방법으로 시작하고 싶다 | 한국 사용자 가입 편의성 |
| AUTH-US-04 | 회원 | 이메일과 비밀번호로 로그인하여 내 데이터에 접근하고 싶다 | 서비스 이용 |
| AUTH-US-05 | 회원 | OAuth로 로그인하여 빠르게 서비스에 접근하고 싶다 | UX 편의성 |
| AUTH-US-06 | 회원 | 로그아웃하여 공유 기기에서 내 계정을 보호하고 싶다 | 보안 |
| AUTH-US-07 | 회원 | 비밀번호를 잊었을 때 이메일로 재설정하여 계정에 다시 접근하고 싶다 | 계정 복구 |
| AUTH-US-08 | 회원 | 이메일 인증을 완료하여 계정 보안을 강화하고 싶다 | 이메일 유효성 확인 |

---

## 3. 화면 명세

### 3.1 로그인 화면

- **진입 경로**: 앱 최초 진입 (미인증 상태), `/auth/login`
- **테마**: Rose Blossom (라이트)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| CardWise 로고 + 마스코트 (Waving) | 이미지 | - | 상단 중앙, 마스코트 40px |
| 이메일 입력 필드 | Input (email) | O | RFC 5322 이메일 형식 |
| 비밀번호 입력 필드 | Input (password) | O | 최소 8자 |
| 비밀번호 표시/숨김 토글 | IconButton (Eye/EyeOff) | - | 기본: 숨김 |
| 로그인 버튼 | Button (Primary) | - | 이메일+비밀번호 유효 시 활성화 |
| 비밀번호 찾기 링크 | TextLink | - | `/auth/forgot-password`로 이동 |
| 구분선 ("또는") | Divider | - | - |
| Google 로그인 버튼 | Button (OAuth) | - | Google 브랜드 가이드라인 준수 |
| Kakao 로그인 버튼 | Button (OAuth) | - | Kakao 브랜드 가이드라인 준수 (#FEE500 배경) |
| 회원가입 링크 | TextLink | - | "아직 계정이 없으신가요? 회원가입" |

**데이터 표시 규칙**:
- 로그인 실패 시 입력 필드 하단에 에러 메시지 표시 (rose-500 텍스트)
- 연속 5회 실패 시 30초 쿨다운 안내 표시
- OAuth 버튼은 각 제공자 공식 브랜드 아이콘 포함

**사용자 인터랙션**:
1. 이메일 입력 → 포커스 아웃 시 형식 검증
2. 비밀번호 입력 → Enter 키로 로그인 가능
3. 로그인 버튼 클릭 → 로딩 스피너 표시 → 성공 시 `/dashboard` 리다이렉트
4. OAuth 버튼 클릭 → 해당 제공자 인증 페이지로 리다이렉트

---

### 3.2 회원가입 화면

- **진입 경로**: 로그인 화면 하단 "회원가입" 링크, `/auth/signup`
- **테마**: Rose Blossom (라이트)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 페이지 제목 "회원가입" | Text (title-lg) | - | - |
| 이메일 입력 필드 | Input (email) | O | RFC 5322 형식, 중복 체크 |
| 비밀번호 입력 필드 | Input (password) | O | 최소 8자, 영문+숫자+특수문자 각 1개 이상 |
| 비밀번호 확인 필드 | Input (password) | O | 비밀번호 일치 여부 |
| 닉네임 입력 필드 | Input (text) | O | 2~20자, 특수문자 불가 (한글/영문/숫자만) |
| 비밀번호 강도 표시 | ProgressBar | - | 약함/보통/강함 3단계, 색상 변화 |
| 비밀번호 규칙 체크리스트 | CheckList | - | 실시간 충족 여부 표시 (체크 아이콘) |
| 이용약관 동의 체크박스 | Checkbox | O | 미동의 시 가입 불가 |
| 개인정보처리방침 동의 체크박스 | Checkbox | O | 미동의 시 가입 불가 |
| 가입하기 버튼 | Button (Primary) | - | 모든 필수 항목 유효 시 활성화 |
| 로그인 페이지 링크 | TextLink | - | "이미 계정이 있으신가요? 로그인" |

**비밀번호 검증 규칙 상세**:
```
- 최소 8자 이상
- 영문(대문자 또는 소문자) 1자 이상
- 숫자 1자 이상
- 특수문자(!@#$%^&*()_+-=[]{}|;:',.<>?/) 1자 이상
- 이메일과 동일한 문자열 불가
```

**사용자 인터랙션**:
1. 이메일 입력 → 포커스 아웃 시 중복 체크 API 호출 (debounce 500ms)
2. 비밀번호 입력 → 실시간 강도 표시 + 규칙 체크리스트 업데이트
3. 가입 버튼 클릭 → 로딩 → 성공 시 이메일 인증 안내 화면으로 이동

---

### 3.3 이메일 인증 안내 화면

- **진입 경로**: 회원가입 완료 후 자동 이동, `/auth/verify-email`
- **테마**: Rose Blossom (라이트)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 마스코트 (Thinking 포즈) | 이미지 | - | 60px, 중앙 |
| 안내 메시지 | Text | - | "인증 이메일을 발송했습니다" |
| 발송된 이메일 주소 | Text (bold) | - | user@example.com (마스킹: u***@example.com) |
| 안내 설명 | Text (body-sm) | - | "이메일의 인증 링크를 클릭하면 가입이 완료됩니다" |
| 이메일 재발송 버튼 | Button (Secondary) | - | 60초 쿨다운 (카운트다운 표시) |
| 로그인 페이지로 이동 | TextLink | - | - |

**사용자 인터랙션**:
1. 이메일 수신 → 인증 링크 클릭 → Supabase Auth 처리 → `/auth/login`으로 리다이렉트 (성공 토스트)
2. 이메일 미수신 시 "재발송" 버튼 클릭 (60초 간격 제한)

---

### 3.4 비밀번호 재설정 화면

- **진입 경로**: 로그인 화면 "비밀번호 찾기" 링크, `/auth/forgot-password`
- **테마**: Rose Blossom (라이트)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 페이지 제목 "비밀번호 재설정" | Text (title-lg) | - | - |
| 안내 메시지 | Text (body-md) | - | "가입 시 사용한 이메일을 입력해주세요" |
| 이메일 입력 필드 | Input (email) | O | RFC 5322 형식 |
| 재설정 링크 발송 버튼 | Button (Primary) | - | 유효한 이메일 입력 시 활성화 |
| 로그인으로 돌아가기 | TextLink | - | `/auth/login` |

**재설정 완료 후 화면 (이메일 링크 클릭 시)**:

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 새 비밀번호 입력 | Input (password) | O | 회원가입과 동일 규칙 |
| 새 비밀번호 확인 | Input (password) | O | 일치 여부 |
| 비밀번호 변경 버튼 | Button (Primary) | - | - |

**사용자 인터랙션**:
1. 이메일 입력 → 발송 버튼 클릭 → "재설정 이메일을 발송했습니다" 안내 표시
2. 등록되지 않은 이메일이어도 동일 메시지 표시 (보안: 이메일 존재 여부 노출 방지)
3. 이메일 링크 클릭 → 새 비밀번호 입력 → 변경 완료 → 로그인 화면으로 이동

---

## 4. Acceptance Criteria

### AC-01: 이메일 회원가입 성공

```
Given 비회원이 회원가입 화면에 접근한 상태
When  유효한 이메일, 비밀번호(8자 이상, 영문+숫자+특수문자), 닉네임을 입력하고
      이용약관 및 개인정보처리방침에 동의한 후 "가입하기" 버튼을 클릭하면
Then  Supabase Auth에 계정이 생성되고
      account, account_profile, subscription(FREE), notification_setting 레코드가 생성되고
      인증 이메일이 발송되고
      이메일 인증 안내 화면으로 이동한다
```

### AC-02: 이메일 중복 가입 방지

```
Given 이미 가입된 이메일 "user@example.com"이 존재하는 상태
When  동일한 이메일로 회원가입을 시도하면
Then  "이미 사용 중인 이메일입니다" 에러 메시지가 이메일 필드 하단에 표시되고
      가입이 진행되지 않는다
```

### AC-03: 비밀번호 검증 실패

```
Given 비회원이 회원가입 화면에서 비밀번호를 입력하는 중
When  비밀번호가 8자 미만이거나 영문/숫자/특수문자 조건을 충족하지 않으면
Then  비밀번호 규칙 체크리스트에서 미충족 항목이 빨간색으로 표시되고
      "가입하기" 버튼이 비활성화 상태를 유지한다
```

### AC-04: 이메일 로그인 성공

```
Given 이메일 인증을 완료한 회원이 로그인 화면에 접근한 상태
When  올바른 이메일과 비밀번호를 입력하고 "로그인" 버튼을 클릭하면
Then  Access Token이 메모리에 저장되고 (60분 만료)
      Refresh Token이 httpOnly Cookie에 저장되고 (7일 만료, SameSite=Strict)
      /dashboard로 리다이렉트된다
```

### AC-05: 로그인 실패 (잘못된 자격 증명)

```
Given 회원이 로그인 화면에 접근한 상태
When  잘못된 비밀번호로 로그인을 시도하면
Then  "이메일 또는 비밀번호가 올바르지 않습니다" 에러 메시지가 표시된다
      (보안: 이메일/비밀번호 중 어느 것이 틀렸는지 구분하지 않음)
```

### AC-06: OAuth 로그인 (Google)

```
Given 비회원 또는 회원이 로그인 화면에서 "Google로 로그인" 버튼을 클릭하면
When  Google 인증 화면에서 계정을 선택하고 권한을 승인하면
Then  /auth/callback/google 콜백이 처리되고
      (신규) account + account_profile + subscription(FREE) + notification_setting이 생성되고
      (기존) 기존 계정으로 로그인되고
      /dashboard로 리다이렉트된다
```

### AC-07: 로그아웃

```
Given 로그인된 회원이 서비스를 이용 중인 상태
When  로그아웃을 요청하면
Then  Access Token이 메모리에서 삭제되고
      Refresh Token 쿠키가 삭제되고
      서버 측 Refresh Token이 무효화되고
      /auth/login으로 리다이렉트된다
```

### AC-08: 비밀번호 재설정

```
Given 회원이 비밀번호를 잊어 "비밀번호 찾기" 화면에 접근한 상태
When  가입된 이메일을 입력하고 "재설정 링크 발송" 버튼을 클릭하면
Then  비밀번호 재설정 이메일이 발송되고 안내 메시지가 표시된다
When  이메일의 재설정 링크를 클릭하고 새 비밀번호를 입력하면
Then  비밀번호가 변경되고 로그인 화면으로 이동하며 성공 토스트가 표시된다
```

### AC-09: 토큰 자동 갱신

```
Given 로그인된 회원의 Access Token이 만료된 상태
When  API 요청을 보내면
Then  Refresh Token을 사용하여 자동으로 새 Access Token을 발급받고
      원래 요청이 재시도되고
      사용자에게 중단 없이 서비스가 제공된다
      (Refresh Token Rotation: 사용된 Refresh Token은 즉시 무효화, 새 Refresh Token 발급)
```

---

## 5. Edge Cases & 에러 시나리오

| # | 시나리오 | 예상 동작 |
|---|---------|----------|
| E-01 | **중복 이메일 (이메일 vs OAuth)**: Google로 가입한 사용자가 동일 이메일로 이메일 회원가입 시도 | "이미 Google 계정으로 가입된 이메일입니다. Google로 로그인해주세요" 안내 |
| E-02 | **OAuth 계정 연동 충돌**: 이메일로 가입 후 동일 이메일의 Google 계정으로 로그인 시도 | 기존 이메일 계정에 Google OAuth 자동 연동 (Supabase Auto Linking) |
| E-03 | **Access Token 만료**: API 호출 시 401 응답 | 프론트엔드 인터셉터에서 자동으로 `/auth/refresh` 호출 후 재시도 |
| E-04 | **Refresh Token 만료 (7일 경과)**: 장기 미접속 후 서비스 접근 | 로그인 화면으로 리다이렉트, "세션이 만료되었습니다. 다시 로그인해주세요" 안내 |
| E-05 | **동시 로그인 (다른 기기)**: 여러 기기에서 동일 계정 로그인 | 허용 (각 기기별 독립 토큰). Refresh Token Rotation으로 탈취 감지 |
| E-06 | **Refresh Token 재사용 공격**: 이미 사용된(무효화된) Refresh Token으로 갱신 시도 | 해당 계정의 모든 Refresh Token 무효화 (전체 로그아웃 강제), 재로그인 요구 |
| E-07 | **이메일 인증 미완료 상태에서 로그인 시도** | "이메일 인증이 완료되지 않았습니다" 안내 + 재발송 버튼 제공 |
| E-08 | **비밀번호 재설정 링크 만료** | 재설정 링크는 1시간 유효. 만료 시 "링크가 만료되었습니다. 다시 요청해주세요" 안내 |
| E-09 | **Rate Limit 초과 (로그인)** | 10 req/5min per IP 초과 시 429 응답 + "잠시 후 다시 시도해주세요" + Retry-After 헤더 |
| E-10 | **OAuth 제공자 장애** | OAuth 버튼 클릭 후 제공자 응답 없음 시 30초 타임아웃 → "일시적으로 서비스를 이용할 수 없습니다" 안내 |
| E-11 | **네트워크 오류** | 회원가입/로그인 요청 실패 시 "네트워크 연결을 확인해주세요" 에러 메시지 |
| E-12 | **OAuth 권한 거부** | 사용자가 OAuth 동의 화면에서 취소 → 로그인 화면으로 복귀, "인증이 취소되었습니다" 토스트 |

---

## 6. API 연동

### 6.1 회원가입

```
POST /api/v1/auth/signup
```

**요청**:
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1",
  "displayName": "김민지"
}
```

**성공 응답** (201):
```json
{
  "data": {
    "accountId": "uuid-...",
    "email": "user@example.com",
    "message": "인증 이메일이 발송되었습니다."
  }
}
```

**실패 응답** (409 Conflict):
```json
{
  "type": "https://cardwise.app/errors/conflict",
  "title": "Email Already Exists",
  "status": 409,
  "detail": "이미 사용 중인 이메일입니다."
}
```

### 6.2 로그인

```
POST /api/v1/auth/login
```

**요청**:
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1"
}
```

**성공 응답** (200):
```json
{
  "data": {
    "accessToken": "eyJ...",
    "expiresIn": 3600,
    "user": {
      "accountId": "uuid-...",
      "email": "user@example.com",
      "displayName": "김민지"
    }
  }
}
```
- Refresh Token은 `Set-Cookie` 헤더로 전달 (httpOnly, Secure, SameSite=Strict)

### 6.3 로그아웃

```
POST /api/v1/auth/logout
```
- Authorization 헤더 필요
- 서버에서 Refresh Token 무효화 + Clear-Cookie 응답

### 6.4 토큰 갱신

```
POST /api/v1/auth/refresh
```
- 요청 Body 없음. Refresh Token은 Cookie에서 자동 전송
- 응답: 새 Access Token + 새 Refresh Token (Cookie)

### 6.5 비밀번호 재설정 요청

```
POST /api/v1/auth/forgot-password
```

**요청**:
```json
{
  "email": "user@example.com"
}
```

**응답** (200 — 이메일 존재 여부와 무관):
```json
{
  "data": {
    "message": "입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다."
  }
}
```

### 6.6 비밀번호 재설정 처리

```
POST /api/v1/auth/reset-password
```

**요청**:
```json
{
  "token": "reset-token-from-email-link",
  "newPassword": "NewSecureP@ss2"
}
```

### 6.7 OAuth 콜백

```
GET /api/v1/auth/callback/:provider
```
- `provider`: `google` | `kakao`
- Supabase Auth가 처리하는 콜백 URL
- 성공 시 토큰 발급 후 프론트엔드 `/auth/callback`으로 리다이렉트

---

## 7. 데이터 모델 연동

### 관련 테이블

| 테이블 | 역할 | 생성 시점 |
|--------|------|----------|
| `account` | 사용자 계정 (PK: Supabase Auth uid) | 회원가입 시 |
| `account_profile` | 프로필 (display_name, gender, birth_year) | 회원가입 시 (1:1) |
| `subscription` | 구독 플랜 (기본 FREE) | 회원가입 시 |
| `notification_setting` | 알림 설정 (기본값 적용) | 회원가입 시 (1:1) |

### 회원가입 시 트랜잭션 (순서)

```sql
-- 1. Supabase Auth에서 사용자 생성 (auth.users)
-- 2. account 생성
INSERT INTO account (account_id, email, is_admin)
VALUES ($supabase_uid, $email, false);

-- 3. account_profile 생성
INSERT INTO account_profile (account_id, display_name)
VALUES ($supabase_uid, $displayName);

-- 4. subscription 생성 (FREE)
INSERT INTO subscription (account_id, subscription_plan, started_at)
VALUES ($supabase_uid, 'FREE', now());

-- 5. notification_setting 생성 (기본값)
INSERT INTO notification_setting (account_id)
VALUES ($supabase_uid);
-- 기본값: voucher_expiry_alert=true, performance_reminder=true,
--         payment_confirm_alert=true, email_notification=false, push_notification=true
```

### 인증 흐름 (JWT)

```
Client → Supabase Auth (로그인) → JWT 발급
Client → Next.js API Route (/api/*) → Backend (Authorization: Bearer <token>)
Backend → Supabase JWT 서명 검증 → account_id 추출 → 비즈니스 로직
```

### 주요 쿼리 패턴

```sql
-- 이메일 중복 확인
SELECT EXISTS(SELECT 1 FROM account WHERE email = $email);

-- 사용자 프로필 조회 (로그인 후 사용자 정보)
SELECT a.account_id, a.email, ap.display_name, s.subscription_plan
FROM account a
JOIN account_profile ap ON a.account_id = ap.account_id
JOIN subscription s ON a.account_id = s.account_id
WHERE a.account_id = $accountId;
```

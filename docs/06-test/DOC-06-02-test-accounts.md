# CardWise 테스트 계정 및 멀티 테넌시 가이드 (DOC-06-02)

CardWise는 Supabase Auth와 백엔드 API 간의 원활한 멀티 테넌시를 구현하고 테스트하기 위해 사전 정의된 4개의 표준 테스트 계정을 운용합니다. UUID의 `account_id`는 모든 도메인의 핵심 Foreign Key로 사용됩니다.

## 👥 표준 테스트 계정 목록

백엔드의 `seed_data.py`를 실행하면 아래 계정에 대해 계정 정보(`account`, `account_profile`), 장부 데이터(`payment`), 커뮤니티 데이터(`community_post`)가 일괄 자동 생성됩니다.

| 계정 역할 | Account ID (UUID) | 이메일 (Email) | 설명 및 시드 특징 |
| :--- | :--- | :--- | :--- |
| **마스터 / 메인** | `11111111-1111-1111-1111-111111111111` | `admin@cardwise.com` | RLS 우회 관리자. 카드 풀소유, 거래 250건, 게시글 35건 등 방대한 데이터 세팅 |
| **활성 일반 유저** | `22222222-2222-2222-2222-222222222222` | `userA@cardwise.com` | 주로 커뮤니티 추천 및 가계부 사용성을 검증하기 위한 120건의 거래 데이터를 가진 일반 유저 |
| **신규 비활성 유저** | `33333333-3333-3333-3333-333333333333` | `userB@cardwise.com` | 이제 막 가입한 사용자(뉴비) 역할. 거래 10건 미만의 빈약한 데이터를 가짐 (온보딩 테스트) |
| **실제 포맷 랜덤 유저**| `a8d9f12b-3c4e-5a6b-7c8d-9e0f1a2b3c4d` | `random@cardwise.com` | 실제 발생형 UUID(`a8d9...`) 처리가 정상적인지 테스트하는 검증용 유저. |

---

## 🛠️ 개발 및 테스트 가이드

### 1. 백엔드 시딩 적용하기 (Python Script)
PostgreSQL(Supabase) DB에 더미 데이터를 주입하고자 할 때 스크립트를 실행합니다. 4개 계정의 프로필 및 매핑이 초기화됩니다.
```bash
cd backend
python seed_data.py
```

### 2. UUID `최상위 포맷` 원칙
> **대시(`-`)를 유지하세요.**

PostgreSQL의 `UUID` 타입은 대시 포함 여부에 구애받지 않고 입력받지만 (예: `f47ac10b58cc4372a5670e02b2c3d479`), Supabase Auth 및 DB 기본 출력값이 모두 `8-4-4-4-12` 규격이므로 중간에서 이를 파싱(Parsing)해 대시를 지우거나 치환하는 작업은 하지 마십시오. 변환 비용 없이 원형 그대로(`a8d9f12b-3c4e-5a6b-7c8d-9e0f1a2b3c4d`) 엔티티 및 프론트 상태로 직렬화하여 사용합니다.

### 3. 인증 시스템 로직 흐름
1. **Frontend / Mobile 앱**: Supabase Client에서 Auth Sign-in.
2. **Supabase Auth 서버**: 임의의 무작위 내부 UUID(`user.id`)를 생성.
3. **Database (Public)**: `public.account`에 해당 UUID가 매핑/동기화 됨.
4. **Backend (Spring Boot)**: 해당 UUID를 JWT 토큰 Claim 에서 추출하여 권한 및 인가를 수행. RLS(Row Level Security) 필드가 자동으로 적용됨.

### 4. 로컬 환경 테스트 (프론트엔드 연동)
Supabase Auth 스키마(`auth.users`)에도 동일한 4개의 테스트 계정 정보가 들어가 있어야 프론트엔드에서 정상적으로 로그인 테스트를 수행할 수 있습니다.
*   **Auth 주입 스크립트 실행:** `python seed_auth_users.py` (백엔드 디렉토리)
    * 이 스크립트를 실행하면 4개의 계정이 모두 비밀번호 `password123!` 으로 `auth.users`에 강제 세팅됩니다.
*   **프론트엔드 간편 로그인:** 로컬 개발 환경(`process.env.NODE_ENV === 'development'`)에서는 `/login` 페이지 상단에 **[Dev Mode: Quick Test Login]** 버튼 4개가 노출됩니다. 비밀번호나 이메일 입력 없이 버튼만 누르면 즉시 해당 계정으로 로그인 및 JWT 쿠키 세팅이 완료됩니다.

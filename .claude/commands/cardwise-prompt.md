# cardwise-prompt: AI 추천 프롬프트 최적화

Claude API를 사용한 카드 추천/분석 프롬프트를 설계하고 응답 포맷을 정의한다.

## 사용 시점

- AI 추천 기능 구현 시
- 프롬프트 튜닝 필요 시
- 사용자가 "프롬프트", "AI 추천", "Claude API" 등을 언급할 때

## 프로세스

### 1. 사용 목적 파악

CardWise에서 Claude API를 사용하는 시나리오:

| 시나리오 | 입력 | 출력 |
|---------|------|------|
| 카드 추천 | 가맹점 + 보유 카드 + 혜택 목록 | 최적 카드 + 이유 |
| 지출 분석 | 월간 결제 데이터 | 인사이트 + 절약 팁 |
| 카테고리 자동 분류 | 가맹점명 | 카테고리 추천 |
| 사후 분석 (Phase 3) | 결제 이력 + 미보유 카드 혜택 | 절약 시뮬레이션 |

### 2. 프롬프트 설계 원칙

- **System prompt**: 역할 정의 + 응답 포맷 고정
- **User prompt**: 구조화된 데이터 전달 (JSON)
- **응답**: 반드시 파싱 가능한 구조 (JSON)
- **토큰 절약**: 불필요한 설명 제거, 필요한 데이터만 전달
- **한국어**: 시스템 프롬프트는 영어, 응답 내용은 한국어

### 3. 프롬프트 템플릿

#### 카드 추천

```
System:
You are a Korean credit card benefit advisor. Given the user's cards and a target merchant, recommend the best card to use.

Respond in JSON format:
{
  "recommended_card": "card name",
  "benefit_type": "DISCOUNT|POINT|CASHBACK|MILEAGE",
  "benefit_detail": "혜택 상세 설명 (한국어)",
  "estimated_saving": 금액(정수),
  "reason": "추천 이유 (한국어)",
  "alternatives": [
    {"card": "name", "benefit": "설명", "saving": 금액}
  ]
}

User:
{
  "merchant": "스타벅스",
  "amount": 5000,
  "cards": [
    {
      "card_name": "삼성카드 taptap O",
      "benefits": [
        {"type": "DISCOUNT", "target": "카페", "rate": 10, "monthly_limit": 3, "used": 1}
      ]
    }
  ]
}
```

### 4. 응답 검증

Claude API 응답을 받은 후:
1. JSON 파싱 검증
2. 필수 필드 존재 확인
3. benefit_type이 유효한 ENUM 값인지 확인
4. estimated_saving이 양수인지 확인
5. 실패 시 fallback 응답 (혜택 목록 기반 단순 정렬)

### 5. API 호출 설정

```kotlin
// Backend (Kotlin)
model = "claude-sonnet-4-6"
max_tokens = 1024
temperature = 0.0  // 추천은 결정론적
```

### 6. 비용/성능 관리

- Redis 캐시: 동일 조합 추천 결과 30분 캐시
- Rate Limit: FREE 분당 30회, PREMIUM 분당 100회
- 토큰 예산: 추천 1회당 ~500 토큰 (입출력 합계)
- Fallback: API 실패/지연 시 규칙 기반 추천으로 대체

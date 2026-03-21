# CardWise Gamification System — FINAL DESIGN DOC v1.0

---

# 0. 문서 개요

## 목적

사용자의 금융 행동을 유도하고 리텐션을 극대화하기 위한  
Gamification 시스템 설계

---

# 1. 시스템 아키텍처

## 구조

User Action → Event → Gamification Engine → Reward → UI

---

# 2. XP 시스템

## 공식

XP = base *weight* decay * bonus

## 기본 XP

| 행동 | XP |
|------|----|
| 로그인 | 5 |
| 결제 등록 | 5 |
| 카드 등록 | 20 |
| 글 작성 | 15 |
| 댓글 | 3 |
| 좋아요 | 1 |

## 반복 감소

| 횟수 | 배율 |
|------|------|
| 1~3 | 1.0 |
| 4~10 | 0.7 |
| 10+ | 0.4 |

---

# 3. 레벨 시스템

XP 필요량 = 100 * (level ^ 1.5)

---

# 4. Tier

| Tier | Level |
|------|------|
| BRONZE | 1~10 |
| SILVER | 11~20 |
| GOLD | 21~30 |
| PLATINUM | 31~50 |
| ELITE | 51+ |

---

# 5. Badge 시스템

## 타입

- ONE_TIME
- PROGRESSIVE
- HIDDEN
- SEASONAL

## 예시

카페 매니아:

- Bronze (3회)
- Silver (10회)
- Gold (30회)
- Platinum (100회)

---

# 6. Achievement

복합 조건 기반

예:

- 카드 5개
- 절약 5만원
- 실적 1000만원

보상:

- XP
- Title

---

# 7. Title 시스템

| 조건 | 호칭 |
|------|------|
| LV10 | 금융 입문자 |
| LV20 | 절약러 |
| LV30 | 카드 전문가 |
| ELITE | 금융 전략가 |

---

# 8. 이벤트 시스템

## 이벤트

- USER_LOGIN
- PAYMENT_CREATED
- CARD_ADDED
- POST_CREATED
- COMMENT_CREATED
- LIKE_CREATED

## 흐름

Event → XP → Badge → Achievement → Level → Tier

---

# 9. DB 설계

## gamification_profile

- user_id
- xp
- level
- tier
- title
- streak

## badge

- badge_id
- name
- type
- condition_json

## user_badge

- user_id
- badge_id
- progress
- achieved_at

---

# 10. Rule Engine

## Badge DSL

{
  "type": "COUNT",
  "event": "PAYMENT_CREATED",
  "filter": {
    "category": "CAFE"
  },
  "target": 10
}

---

# 11. API

GET /api/gamification/profile  
GET /api/gamification/badges  
POST /api/gamification/event  

---

# 12. UX

- XP bar
- Level 표시
- Badge Center
- Toast / Animation

---

# 13. 운영 전략

- 초반 빠른 성장
- 반복 XP 감소
- 의미 있는 보상

---

# 최종 구조

Event → XP → Level → Tier → Badge → Achievement → Title → Reward

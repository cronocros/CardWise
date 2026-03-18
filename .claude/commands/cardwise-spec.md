# cardwise-spec: 기능 요구사항 문서화

새 기능 구현 전 요구사항을 정리하고 설계 문서를 작성하는 스킬.
구현 전에 반드시 이 스킬로 명세를 만들어야 한다.

## 사용 시점

- 새 기능 개발 시작 전
- 기존 기능 변경/확장 시
- 사용자가 "스펙", "명세", "요구사항", "설계" 등을 언급할 때

## 프로세스

### 1. 기능 분석

기존 설계 문서 3개를 먼저 읽는다:
- `docs/superpowers/specs/2026-03-17-cardwise-requirements.md` (요구사항)
- `docs/superpowers/specs/2026-03-17-cardwise-architecture.md` (아키텍처)
- `docs/superpowers/specs/2026-03-17-cardwise-database.md` (DB 설계)

### 2. 사용자 인터뷰

다음을 파악한다:
- 어떤 기능인지 (기존 F1~F11 중 하나인지, 새 기능인지)
- 관련 Bounded Context (Card, UserCard, Ledger, Benefit, Analytics 등)
- 영향받는 테이블
- 필요한 API 엔드포인트
- 프론트엔드 화면

### 3. 스펙 문서 생성

`docs/superpowers/specs/` 디렉토리에 아래 템플릿으로 작성한다:

```markdown
# [기능명] - Feature Specification

## Overview
- 기능 ID: F{N}
- 관련 요구사항: R{N}
- Bounded Context: {context}
- 우선순위: MVP / Phase 2 / Phase 3

## 상세 요구사항
{기능 설명}

## 프로세스 흐름
{ASCII 다이어그램}

## API 설계
| Method | Path | 설명 | Request | Response |
|--------|------|------|---------|----------|

## DB 변경사항
- 새 테이블: {있으면}
- 컬럼 추가: {있으면}
- 새 인덱스: {있으면}

## 이벤트
| 이벤트 | 발행 | 구독 | 처리 |
|--------|------|------|------|

## 캐시 전략
- 캐시 키: {패턴}
- TTL: {시간}
- 무효화: {조건}

## 보안 체크리스트
- [ ] RLS 정책 필요 여부
- [ ] 입력 검증 (Bean Validation)
- [ ] 인증 필요 여부
- [ ] Rate Limiting 필요 여부

## 테스트 시나리오
1. {정상 케이스}
2. {엣지 케이스}
3. {에러 케이스}
```

### 4. 사용자 확인

작성된 스펙을 보여주고 확인받는다. 수정 요청이 있으면 반영한다.
확정 후에만 구현 단계로 진행 가능하다.

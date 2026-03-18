# cardwise-feature-team: 기능 개발 서브에이전트 팀

기능 구현 시 Plan -> Code -> Review 순서로 서브에이전트 팀을 구성하여 분업한다.
Context7 MCP로 최신 라이브러리 문서를 참조하면서 구현한다.

## 사용 시점

- 기능 구현 시작 시 (스펙 문서가 이미 존재해야 함)
- 사용자가 "구현해줘", "개발해줘", "만들어줘" 등을 언급할 때

## 전제 조건

- 해당 기능의 스펙 문서가 `docs/superpowers/specs/`에 존재할 것
- 스펙 문서가 사용자에게 확정되었을 것

## 팀 구성 및 실행 순서

### Phase 1: Plan Agent

Agent tool로 `Plan` 서브에이전트를 실행한다.

프롬프트에 포함할 것:
- 스펙 문서 경로
- 아키텍처 문서 경로
- DB 설계 문서 경로
- 구현 대상 모듈 (backend / frontend / both)

Plan Agent가 산출할 것:
- 파일 생성/수정 목록
- 구현 순서 (의존성 기반)
- 예상 이벤트 흐름

### Phase 2: Code Agent(s)

Plan 결과를 기반으로 Code 에이전트를 실행한다.
독립적인 모듈은 병렬 실행 가능.

**Backend 구현 시 참조:**
```
Context7으로 최신 문서 확인:
- Spring Boot (Kotlin)
- Spring Data JPA
- Spring Security (JWT)
```

**Frontend 구현 시 참조:**
```
Context7으로 최신 문서 확인:
- Next.js 15 (App Router)
- Tailwind CSS
- shadcn/ui
```

Code Agent 프롬프트에 포함할 것:
- Plan Agent의 구현 계획
- 헥사고날 아키텍처 패키지 구조 준수
  ```
  module/domain/model/
  module/domain/event/
  module/application/port/in/
  module/application/port/out/
  module/application/service/
  module/adapter/in/web/
  module/adapter/out/persistence/
  module/adapter/out/messaging/
  module/adapter/out/cache/
  ```
- 코딩 컨벤션: snake_case (DB), camelCase (Kotlin/TS)

### Phase 3: Review Agent

구현 완료 후 `superpowers:requesting-code-review` 스킬로 리뷰한다.
또는 `cardwise-review-team` 스킬로 보안/품질/성능 리뷰를 수행한다.

## 결과물

각 Phase 완료 시 사용자에게 요약 보고:
- Plan: 구현 계획 요약
- Code: 생성/수정된 파일 목록
- Review: 발견된 이슈 및 수정 사항

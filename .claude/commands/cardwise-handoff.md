# cardwise-handoff: 프로젝트 상태 기록 및 인수인계

현재 작업 상태를 기록하여 다른 LLM/AI 에이전트 또는 IDE(Cursor, VS Code 등)에서 이어서 작업할 수 있도록 인수인계 문서를 갱신한다.

## 사용 시점

- 세션 종료 전
- 주요 마일스톤 완료 시
- 다른 도구/IDE로 전환 시
- 사용자가 "상태 저장", "인수인계", "handoff", "정리" 등을 언급할 때

## 프로세스

### 1. 현재 상태 수집

다음을 파악한다:
- 이번 세션에서 완료한 작업
- 현재 진행 중인 작업
- 다음에 해야 할 작업
- 변경된 파일 목록
- 내린 핵심 결정 사항

### 2. STATUS.md 갱신

`docs/STATUS.md` 파일을 업데이트한다:

```markdown
## 최종 갱신
- **날짜**: {오늘 날짜}
- **갱신자**: {Claude / Cursor / 사용자}
- **내용**: {변경 요약}

## 현재 Phase
{현재 단계}

## 완료된 작업
{테이블에 새 항목 추가}

## 진행 중인 작업
{현재 진행 중인 것}

## 다음 단계
{우선순위 순서로}
```

### 3. 변경 파일 동기화 확인

설계 문서 변경 시 관련 문서 간 일관성 확인:
- 아키텍처 변경 -> system/application/frontend 모두 확인
- DB 변경 -> schema-design.md + data-dictionary.md 동기화
- 요구사항 변경 -> 프로세스 흐름 업데이트

### 4. git status 기록 (선택)

커밋하지 않은 변경사항이 있다면 목록화:
```
Unstaged changes:
- docs/architecture/application-architecture.md (modified)
- src/... (new file)
```

## 인수인계 메시지 형식

STATUS.md 갱신 후 사용자에게 요약 보고:

```
## 인수인계 요약

### 이번 세션 완료
- {항목 1}
- {항목 2}

### 다음 세션에서 이어할 것
1. {우선순위 1}
2. {우선순위 2}

### 주의사항
- {있으면 기록}

STATUS.md가 갱신되었습니다. 다른 AI/IDE에서 이어 작업 시
docs/STATUS.md -> docs/README.md -> CLAUDE.md 순서로 읽으면 됩니다.
```

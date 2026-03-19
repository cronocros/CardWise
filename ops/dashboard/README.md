# CardWise 작업판

현재 단계의 실시간 작업 추적판입니다.

## Files

- `work-items.json`: 터미널과 웹이 함께 읽는 공유 상태
- `seed-state.json`: 대시보드 초기 상태
- `serve.js`: 로컬 웹 대시보드 서버
- `render-terminal.js`: 터미널 상태판
- `dashboard-lib.js`: 공통 상태 및 렌더링 헬퍼
- `traceability-map.json`: 기능/요구/API/DB 매핑 기준

## Run

```bash
node ops/dashboard/serve.js
```

출력된 URL을 브라우저에서 엽니다.

```bash
node ops/dashboard/render-terminal.js
```

터미널 연속 갱신:

```bash
node ops/dashboard/render-terminal.js --watch
```

## State Model

각 작업 항목에는 다음이 포함됩니다.

- `todo_id`
- `title`
- `priority`
- `owner_agent`
- `status`
- `feature_refs`
- `requirement_refs`
- `api_refs`
- `db_refs`
- `acceptance`
- `dependencies`
- `blocker`
- `evidence`

웹 대시보드는 다음을 보여줍니다.

- 실행 단계
- 에이전트별 진행률
- 완료된 기능/요구사항/API 수
- 차단 항목
- 최근 20개 대화 이벤트
- 미해결 질문 수

## Update Flow

- 진행 상황은 `work-items.json`에 반영합니다.
- 터미널과 브라우저는 같은 파일을 읽습니다.
- 시작 기준은 `seed-state.json`을 유지합니다.

# Orchestration Protocol

This folder defines how the orchestrator and sub-agents collaborate during Phase 1 implementation.

## Branch Map

- `codex/integration-phase1`: integration branch for merged work
- `codex/backend-platform-core`: backend core platform work
- `codex/backend-ledger-f2f3`: F2/F3 backend domain work
- `codex/backend-performance-f4f6`: F4/F6 backend domain work
- `codex/frontend-bff-core`: frontend BFF and app shell work
- `codex/frontend-features-mvp`: frontend feature work

## Agent Event Types

- `QUESTION`: an agent asks for required input from another agent
- `ANSWER`: response to a prior question
- `DECISION`: orchestrator or owner finalized a choice
- `BLOCKED`: agent cannot continue due to dependency or failure

## State Rules

- Every work item must include:
  - `todo_id`, `title`, `priority`, `owner_agent`, `status`
  - `feature_refs`, `requirement_refs`, `api_refs`, `db_refs`
  - `acceptance`, `dependencies`, `blocker`, `evidence`
- Allowed `priority`: `P0`, `P1`, `P2`, `P3`
- Allowed `status`: `TODO`, `IN_PROGRESS`, `BLOCKED`, `REVIEW`, `DONE`

## Coordination Rules

- Agents never overwrite unrelated files.
- Agents append conversation events instead of rewriting history.
- Blockers are escalated immediately and the orchestrator reassigns ownership.
- A work item can move to `DONE` only when evidence is recorded.

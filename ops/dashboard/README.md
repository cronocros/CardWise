# CardWise Dashboard

Live implementation tracker for the current phase.

## Files

- `work-items.json`: shared live state consumed by terminal and web renderers
- `seed-state.json`: initial seed state for the dashboard
- `serve.js`: local web dashboard server
- `render-terminal.js`: terminal status board
- `dashboard-lib.js`: shared state and rendering helpers
- `traceability-map.json`: feature/requirement/API/DB mapping baseline

## Run

```bash
node ops/dashboard/serve.js
```

Open the printed URL in a browser.

```bash
node ops/dashboard/render-terminal.js
```

Continuous terminal refresh:

```bash
node ops/dashboard/render-terminal.js --watch
```

## State Model

Each work item includes:

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

The web dashboard shows:

- plan phases
- per-agent progress
- completed feature, requirement, and API counts (done/total)
- blockers
- last 20 conversation events
- unresolved question count

## Update Flow

- Edit `work-items.json` to reflect progress.
- Terminal and browser views read the same file.
- Keep `seed-state.json` as the canonical starting point.

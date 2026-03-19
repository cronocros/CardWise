const fs = require('node:fs');
const path = require('node:path');

const rootDir = __dirname;
const statePath = path.join(rootDir, 'work-items.json');
const seedPath = path.join(rootDir, 'seed-state.json');
const REFRESH_INTERVAL_MS = 10_000;
const QUICK_LINKS = [
  { label: 'Live Dashboard', href: 'http://127.0.0.1:4173/', note: '운영 컨트롤센터', status: 'live' },
  { label: 'Frontend', href: 'http://127.0.0.1:3000/', note: 'Next.js 앱', status: 'live' },
  { label: 'Backend Health', href: 'http://127.0.0.1:8080/actuator/health', note: '런타임 헬스', status: 'live' },
  { label: 'Backend Info', href: 'http://127.0.0.1:8080/actuator/info', note: '액추에이터 정보', status: 'live' },
  { label: 'API Base', href: 'http://127.0.0.1:8080/api/v1', note: '백엔드 기본 경로', status: 'live' },
  { label: 'Swagger UI', href: 'http://127.0.0.1:8080/swagger-ui.html', note: 'SpringDoc 연결 대상', status: 'live' },
  { label: 'OpenAPI JSON', href: 'http://127.0.0.1:8080/v3/api-docs', note: '스키마 확인', status: 'live' },
  { label: 'BFF Pending Count', href: 'http://127.0.0.1:3000/api/pending-actions/count?status=PENDING', note: 'BFF 스모크', status: 'live' },
  { label: 'BFF Active Vouchers', href: 'http://127.0.0.1:3000/api/vouchers?status=active', note: '바우처 스모크', status: 'live' },
  { label: 'BFF Performance', href: 'http://127.0.0.1:3000/api/cards/1/performance', note: '실적 스모크', status: 'live' }
];
const statusLabels = {
  TODO: '대기',
  IN_PROGRESS: '진행중',
  REVIEW: '검토중',
  DONE: '완료',
  BLOCKED: '차단',
  RESOLVED: '해결',
  UNRESOLVED: '미해결',
  QUESTION: '질의',
  ANSWER: '응답',
  DECISION: '결정'
};
const agentLabels = {
  Orchestrator: '오케스트레이터',
  'BE-Platform': '백엔드 플랫폼',
  'BE-Ledger': '백엔드 원장',
  'BE-Performance': '백엔드 실적',
  'FE-Foundation': '프론트 기반',
  'FE-Features': '프론트 기능',
  'FE-Vouchers': '프론트 바우처',
  'Dashboard-UX': '대시보드 UX',
  'Senior Designer': '시니어 디자이너',
  'FE-Theme': '프론트 테마',
  'FE-AppShell': '앱 셸',
  'FE-Route-A': '프론트 라우트 A',
  'FE-Route-B': '프론트 라우트 B',
  'FE-Route-C': '프론트 라우트 C',
  'FE-MotionAssets': '모션 자산'
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function ensureState() {
  if (!fs.existsSync(statePath)) {
    const legacyStatePath = path.join(rootDir, 'state.json');
    if (fs.existsSync(legacyStatePath)) {
      writeJson(statePath, readJson(legacyStatePath));
    } else {
      writeJson(statePath, readJson(seedPath));
    }
  }
  return readJson(statePath);
}

function countDistinct(list) {
  return new Set(list.filter(Boolean)).size;
}

function countDistinctFromItems(workItems, fieldName, statusFilter) {
  return countDistinct(
    workItems
      .filter((item) => !statusFilter || item.status === statusFilter)
      .flatMap((item) => item[fieldName] || [])
  );
}

function priorityWeight(priority) {
  const weights = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4, P5: 5 };
  return weights[priority] ?? 9;
}

function buildDashboardModel(state) {
  const workItems = Array.isArray(state.work_items) ? state.work_items : [];
  const phases = Array.isArray(state.phases) ? state.phases : [];
  const agents = Array.isArray(state.agents) ? state.agents : [];
  const events = Array.isArray(state.events) ? state.events : [];
  const questions = Array.isArray(state.questions) ? state.questions : [];

  const blockers = workItems
    .filter((item) => item.status === 'BLOCKED' || (item.blocker && String(item.blocker).trim().length > 0))
    .map((item) => ({
      todo_id: item.todo_id,
      owner_agent: item.owner_agent,
      title: item.title,
      blocker: item.blocker || 'Status marked BLOCKED'
    }));

  const featureTotalCount = countDistinctFromItems(workItems, 'feature_refs');
  const requirementTotalCount = countDistinctFromItems(workItems, 'requirement_refs');
  const apiTotalCount = countDistinctFromItems(workItems, 'api_refs');
  const featureDoneCount = countDistinctFromItems(workItems, 'feature_refs', 'DONE');
  const requirementDoneCount = countDistinctFromItems(workItems, 'requirement_refs', 'DONE');
  const apiDoneCount = countDistinctFromItems(workItems, 'api_refs', 'DONE');
  const doneItems = workItems.filter((item) => item.status === 'DONE');
  const activeItems = workItems.filter((item) => item.status === 'IN_PROGRESS' || item.status === 'REVIEW');
  const todoItems = workItems.filter((item) => item.status === 'TODO');
  const nextFocus = [...activeItems, ...todoItems]
    .sort((left, right) => {
      const priorityDiff = priorityWeight(left.priority) - priorityWeight(right.priority);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return left.todo_id.localeCompare(right.todo_id);
    })
    .slice(0, 8);

  const agentRows = agents.map((agent) => {
    const owned = workItems.filter((item) => item.owner_agent === agent.name);
    const done = owned.filter((item) => item.status === 'DONE').length;
    const progress = owned.length ? Math.round((done / owned.length) * 100) : (agent.progress || 0);
    return { ...agent, done, total: owned.length, progress };
  });

  return {
    project: state.project || 'CardWise',
    updated_at: state.updated_at || '',
    refresh_interval_ms: REFRESH_INTERVAL_MS,
    phases,
    agents: agentRows,
    work_items: workItems,
    blockers,
    next_focus: nextFocus,
    quick_links: QUICK_LINKS,
    recent_events: events.slice(-20),
    unresolved_questions: questions.filter((question) => question.status !== 'RESOLVED').length,
    questions,
    counts: {
      feature_total: featureTotalCount,
      requirement_total: requirementTotalCount,
      api_total: apiTotalCount,
      feature_done: featureDoneCount,
      requirement_done: requirementDoneCount,
      api_done: apiDoneCount,
      done_items: doneItems.length,
      active_items: activeItems.length,
      todo_items: todoItems.length,
      blocked_items: blockers.length,
      total_items: workItems.length
    }
  };
}

function labelStatus(value) {
  return statusLabels[value] || value;
}

function labelAgent(value) {
  return agentLabels[value] || value;
}

function renderTerminal(state) {
  const model = buildDashboardModel(state);
  const lines = [];
  lines.push(`CardWise 작업판 | ${model.updated_at}`);
  lines.push(`단계: ${model.phases.map((phase) => `${phase.phase}:${labelStatus(phase.status)}`).join(' | ')}`);
  lines.push(
    `집계: 완료 ${model.counts.done_items}/${model.counts.total_items} | 진행 ${model.counts.active_items} | 대기 ${model.counts.todo_items} | 차단 ${model.counts.blocked_items} | 미해결 질문 ${model.unresolved_questions}`
  );
  lines.push('');
  lines.push('즉시 집중');
  model.next_focus.forEach((item) => {
    lines.push(`- ${item.todo_id} [${item.priority}] ${labelAgent(item.owner_agent)} :: ${item.title}`);
  });
  lines.push('');
  lines.push('에이전트');
  model.agents.forEach((agent) => {
    lines.push(`- ${labelAgent(agent.name).padEnd(16)} ${String(agent.progress).padStart(3)}% ${labelStatus(agent.status).padEnd(12)} ${agent.done}/${agent.total}`);
  });
  lines.push('');
  lines.push('바로가기');
  model.quick_links.forEach((link) => {
    lines.push(`- ${link.label}: ${link.href}`);
  });
  return lines.join('\n');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderList(items, renderer, emptyText) {
  if (!items.length) {
    return `<div class="empty">${escapeHtml(emptyText)}</div>`;
  }
  return items.map(renderer).join('');
}

function renderHtml(state) {
  const model = buildDashboardModel(state);
  const data = JSON.stringify(model).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CardWise 실행 대시보드</title>
  <style>
    :root {
      --bg:#f7f3f4;
      --bg-accent:#fff7f8;
      --panel:#ffffff;
      --panel-alt:#fff9fa;
      --text:#211820;
      --muted:#756776;
      --line:rgba(140, 110, 128, .18);
      --rose:#fb7185;
      --rose-strong:#f43f5e;
      --rose-soft:#ffe4e8;
      --good:#10b981;
      --warn:#f59e0b;
      --bad:#ef4444;
      --info:#3b82f6;
      --shadow:0 24px 60px rgba(99, 65, 86, .12);
      --radius-xl:28px;
      --radius-lg:22px;
      --radius-md:16px;
    }
    * { box-sizing:border-box; }
    html, body { margin:0; min-height:100%; }
    body {
      font-family:"Pretendard", "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color:var(--text);
      background:
        radial-gradient(circle at top left, rgba(251, 113, 133, .18), transparent 28%),
        radial-gradient(circle at top right, rgba(244, 63, 94, .08), transparent 22%),
        linear-gradient(180deg, var(--bg-accent) 0%, var(--bg) 100%);
    }
    a { color:inherit; text-decoration:none; }
    .page {
      max-width:1600px;
      margin:0 auto;
      padding:18px;
      min-height:100vh;
      display:grid;
      gap:16px;
    }
    .top-grid {
      display:grid;
      gap:16px;
      grid-template-columns:minmax(0, 1.45fr) minmax(320px, .85fr);
      align-items:start;
    }
    .main-grid {
      display:grid;
      gap:16px;
      grid-template-columns:minmax(280px, .88fr) minmax(0, 1.45fr) minmax(300px, .95fr);
      align-items:stretch;
      min-height:0;
    }
    .stack { display:grid; gap:16px; min-height:0; }
    .stack-left { grid-template-rows:minmax(0, .92fr) minmax(0, 1.08fr); }
    .stack-center { grid-template-rows:minmax(0, 1.3fr) minmax(0, .82fr); }
    .stack-right { grid-template-rows:minmax(0, .72fr) minmax(0, .95fr) minmax(0, 1.12fr); }
    .panel {
      background:rgba(255,255,255,.92);
      border:1px solid var(--line);
      border-radius:var(--radius-xl);
      box-shadow:var(--shadow);
      overflow:hidden;
      min-height:0;
      display:flex;
      flex-direction:column;
    }
    .panel.soft { background:linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,249,250,.96)); }
    .panel-header { padding:20px 22px 0; }
    .panel-body { padding:18px 22px 22px; }
    .panel-body.scroll-body {
      flex:1;
      min-height:0;
      overflow:auto;
      scrollbar-width:thin;
      scrollbar-color:rgba(140, 110, 128, .28) transparent;
    }
    .panel-body.scroll-body::-webkit-scrollbar { width:8px; height:8px; }
    .panel-body.scroll-body::-webkit-scrollbar-thumb {
      background:rgba(140, 110, 128, .24);
      border-radius:999px;
    }
    .eyebrow {
      display:inline-flex;
      align-items:center;
      min-height:28px;
      padding:0 12px;
      border-radius:999px;
      background:var(--rose-soft);
      color:var(--rose-strong);
      font-size:12px;
      font-weight:700;
      letter-spacing:.08em;
      text-transform:uppercase;
    }
    .hero {
      padding:20px 22px;
      background:
        radial-gradient(circle at top right, rgba(244, 63, 94, .16), transparent 28%),
        linear-gradient(135deg, rgba(255,255,255,.96), rgba(255,248,249,.98));
    }
    .hero h1 {
      margin:12px 0 8px;
      font-size:38px;
      line-height:1.02;
      letter-spacing:-.05em;
    }
    .hero p {
      margin:0;
      max-width:820px;
      color:var(--muted);
      font-size:14px;
      line-height:1.68;
    }
    .hero-meta {
      margin-top:18px;
      display:grid;
      gap:12px;
      grid-template-columns:repeat(3, minmax(0, 1fr));
    }
    .hero-card {
      min-height:96px;
      padding:14px 16px;
      border-radius:var(--radius-lg);
      background:rgba(255,255,255,.9);
      border:1px solid var(--line);
    }
    .hero-card .label {
      color:var(--muted);
      font-size:12px;
      font-weight:700;
      letter-spacing:.08em;
      text-transform:uppercase;
    }
    .hero-card .value {
      margin-top:8px;
      font-size:28px;
      font-weight:800;
      letter-spacing:-.04em;
    }
    #updated-value {
      font-size:22px;
      line-height:1.24;
      word-break:break-word;
    }
    .hero-card .subvalue {
      margin-top:6px;
      color:var(--muted);
      font-size:12px;
      line-height:1.5;
    }
    .hero-rail { display:grid; gap:14px; min-height:0; }
    .status-card {
      padding:18px 20px;
      border-radius:var(--radius-lg);
      background:linear-gradient(160deg, rgba(32,23,29,.96), rgba(62,37,47,.96));
      color:#fff8fb;
      box-shadow:0 26px 60px rgba(63, 27, 44, .28);
      height:100%;
    }
    .status-grid {
      margin-top:14px;
      display:grid;
      gap:10px;
      grid-template-columns:repeat(2, minmax(0, 1fr));
    }
    .status-chip {
      padding:12px 14px;
      border-radius:var(--radius-md);
      background:rgba(255,255,255,.08);
      border:1px solid rgba(255,255,255,.12);
    }
    .status-chip .title {
      color:rgba(255,255,255,.72);
      font-size:12px;
      font-weight:700;
      letter-spacing:.06em;
      text-transform:uppercase;
    }
    .status-chip .number {
      margin-top:8px;
      font-size:24px;
      font-weight:800;
      letter-spacing:-.04em;
    }
    .timeline, .card-list { display:grid; gap:12px; }
    .card-list.compact { gap:10px; }
    .phase-row, .card-row, .link-row {
      border-radius:var(--radius-md);
      border:1px solid var(--line);
      background:var(--panel-alt);
      padding:14px 16px;
    }
    .card-row.compact {
      padding:12px 14px;
      background:linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,249,250,.96));
    }
    .row-head {
      display:flex;
      gap:12px;
      justify-content:space-between;
      align-items:flex-start;
      margin-bottom:8px;
    }
    .row-head strong {
      font-size:15px;
      line-height:1.45;
      letter-spacing:-.02em;
    }
    .small {
      color:var(--muted);
      font-size:13px;
      line-height:1.65;
    }
    .mono {
      color:var(--muted);
      font-family:"Cascadia Code","SFMono-Regular",Consolas,monospace;
      font-size:12px;
    }
    .badge {
      display:inline-flex;
      align-items:center;
      min-height:26px;
      padding:0 10px;
      border-radius:999px;
      border:1px solid transparent;
      font-size:12px;
      font-weight:700;
      white-space:nowrap;
    }
    .badge.done { color:var(--good); background:rgba(16,185,129,.1); border-color:rgba(16,185,129,.18); }
    .badge.progress { color:var(--warn); background:rgba(245,158,11,.12); border-color:rgba(245,158,11,.18); }
    .badge.todo { color:var(--muted); background:rgba(117,103,118,.08); border-color:rgba(117,103,118,.12); }
    .badge.blocked { color:var(--bad); background:rgba(239,68,68,.1); border-color:rgba(239,68,68,.18); }
    .badge.live { color:var(--good); background:rgba(16,185,129,.1); border-color:rgba(16,185,129,.18); }
    .badge.planned { color:var(--info); background:rgba(59,130,246,.08); border-color:rgba(59,130,246,.18); }
    .progress-track {
      width:100%;
      height:9px;
      overflow:hidden;
      border-radius:999px;
      background:rgba(117,103,118,.12);
      margin-top:10px;
    }
    .progress-fill {
      height:100%;
      border-radius:999px;
      background:linear-gradient(90deg, var(--rose), var(--good));
    }
    .link-row a {
      display:flex;
      gap:12px;
      justify-content:space-between;
      align-items:flex-start;
    }
    .link-row a:hover strong { color:var(--rose-strong); }
    .board-note {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:12px;
      margin-bottom:14px;
    }
    .board-note .small strong { color:var(--text); }
    .kanban-board {
      display:grid;
      gap:12px;
      grid-template-columns:repeat(3, minmax(0, 1fr));
      min-height:0;
    }
    .kanban-lane {
      min-height:0;
      display:flex;
      flex-direction:column;
      border-radius:var(--radius-lg);
      border:1px solid var(--line);
      background:linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,245,247,.96));
      overflow:hidden;
    }
    .lane-head {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:12px;
      padding:14px 16px;
      border-bottom:1px solid var(--line);
      background:rgba(255,255,255,.8);
    }
    .lane-title {
      font-size:13px;
      font-weight:800;
      letter-spacing:.08em;
      text-transform:uppercase;
      color:var(--text);
    }
    .lane-body {
      min-height:0;
      overflow:auto;
      padding:12px;
      display:grid;
      gap:10px;
      scrollbar-width:thin;
      scrollbar-color:rgba(140, 110, 128, .28) transparent;
    }
    .lane-body::-webkit-scrollbar { width:8px; }
    .lane-body::-webkit-scrollbar-thumb {
      background:rgba(140, 110, 128, .24);
      border-radius:999px;
    }
    .link-grid {
      display:grid;
      gap:10px;
      grid-template-columns:repeat(2, minmax(0, 1fr));
    }
    .link-tile {
      border-radius:var(--radius-md);
      border:1px solid var(--line);
      background:linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,247,249,.96));
      transition:transform .16s ease, border-color .16s ease, box-shadow .16s ease;
    }
    .link-tile:hover {
      transform:translateY(-2px);
      border-color:rgba(244, 63, 94, .28);
      box-shadow:0 18px 30px rgba(99, 65, 86, .1);
    }
    .link-tile a {
      height:100%;
      display:grid;
      gap:8px;
      padding:14px 14px 12px;
    }
    .link-topline {
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      gap:10px;
    }
    .tiny {
      color:var(--muted);
      font-size:11px;
      line-height:1.45;
      word-break:break-all;
    }
    .split-stack {
      display:grid;
      gap:14px;
      grid-template-rows:minmax(0, 1fr) minmax(0, 1fr);
      min-height:0;
    }
    .split-card {
      min-height:0;
      display:flex;
      flex-direction:column;
    }
    .split-card .card-list {
      min-height:0;
      overflow:auto;
      padding-right:4px;
    }
    .tag {
      display:inline-flex;
      align-items:center;
      min-height:24px;
      padding:0 10px;
      border-radius:999px;
      background:var(--rose-soft);
      color:var(--rose-strong);
      font-size:11px;
      font-weight:700;
      margin:6px 6px 0 0;
    }
    .pill-row {
      display:flex;
      flex-wrap:wrap;
      gap:8px;
    }
    .pill {
      display:inline-flex;
      align-items:center;
      gap:8px;
      min-height:28px;
      padding:0 12px;
      border-radius:999px;
      background:rgba(117,103,118,.08);
      color:var(--muted);
      font-size:12px;
      font-weight:700;
    }
    .dot {
      width:8px;
      height:8px;
      border-radius:50%;
      background:currentColor;
      opacity:.9;
    }
    .empty {
      color:var(--muted);
      font-size:13px;
      line-height:1.7;
      padding:8px 0;
    }
    @media (min-width: 1321px) {
      html, body { height:100%; }
      body { overflow:hidden; }
      .page { height:100vh; grid-template-rows:auto minmax(0, 1fr); }
      .top-grid, .main-grid, .hero-rail { min-height:0; }
    }
    @media (max-width: 1320px) {
      body { overflow:auto; }
      .top-grid, .main-grid { grid-template-columns:1fr; }
      .stack-left, .stack-center, .stack-right { grid-template-rows:auto; }
    }
    @media (max-width: 860px) {
      .page { padding:16px; }
      .hero h1 { font-size:34px; }
      .hero-meta, .status-grid { grid-template-columns:1fr; }
      .kanban-board, .link-grid { grid-template-columns:1fr; }
    }
  </style>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%23f43f5e'/%3E%3Ctext x='50%25' y='54%25' text-anchor='middle' font-size='28' font-family='Arial' font-weight='700' fill='white'%3ECW%3C/text%3E%3C/svg%3E" />
</head>
<body>
  <div class="page">
    <section class="top-grid">
      <article class="panel soft hero">
        <span class="eyebrow">Wave 1 · Dashboard First</span>
        <h1>CardWise 실행 대시보드</h1>
        <p>첫 번째 가시 산출물은 라이브 대시보드입니다. 여기서 바로 현재 시각, 마지막 갱신, 다음 갱신 카운트다운, Quick Links, 신규 P4/P5 작업 트랙을 함께 확인할 수 있습니다.</p>
        <div class="hero-meta">
          <div class="hero-card">
            <div class="label">현재 시각</div>
            <div class="value" id="clock-value" data-role="current-time">--:--:--</div>
            <div class="subvalue" id="clock-date">날짜 계산 중</div>
          </div>
          <div class="hero-card">
            <div class="label">마지막 갱신</div>
            <div class="value" id="updated-value" data-role="last-updated">--</div>
            <div class="subvalue">상태 파일 기준 스냅샷 시각</div>
          </div>
          <div class="hero-card">
            <div class="label">다음 갱신까지</div>
            <div class="value" id="countdown-value" data-role="countdown">--</div>
            <div class="subvalue">자동 polling 10초 간격</div>
          </div>
        </div>
      </article>
      <aside class="hero-rail">
        <article class="status-card">
          <div class="eyebrow" style="background:rgba(255,255,255,.08); color:#ffd5de;">운영 상태</div>
          <div style="margin-top:14px; font-size:28px; font-weight:800; letter-spacing:-.04em;">실행 우선순위 재정렬</div>
          <div class="small" style="color:rgba(255,248,251,.74); margin-top:10px;">대시보드를 먼저 공개하고, Swagger와 프론트 테마 코어를 병렬로 밀어 올리는 실행 모드입니다.</div>
          <div class="status-grid">
            <div class="status-chip"><div class="title">진행중 항목</div><div class="number" id="active-items">0</div></div>
            <div class="status-chip"><div class="title">대기 항목</div><div class="number" id="todo-items">0</div></div>
            <div class="status-chip"><div class="title">차단 항목</div><div class="number" id="blocked-items">0</div></div>
            <div class="status-chip"><div class="title">미해결 질문</div><div class="number" id="question-count">0</div></div>
          </div>
        </article>
      </aside>
    </section>

    <section class="main-grid">
      <section class="stack stack-left">
        <article class="panel">
          <div class="panel-header"><div class="eyebrow">실행 단계</div></div>
          <div class="panel-body scroll-body"><div class="timeline" id="phases"></div></div>
        </article>
        <article class="panel">
          <div class="panel-header"><div class="eyebrow">에이전트 진행률</div></div>
          <div class="panel-body scroll-body"><div class="card-list compact" id="agents"></div></div>
        </article>
      </section>
      <section class="stack stack-center">
        <article class="panel">
          <div class="panel-header"><div class="eyebrow">작업 항목</div></div>
          <div class="panel-body scroll-body">
            <div class="board-note">
              <div class="small"><strong>상태별 레인</strong>으로 한 화면에서 진행 흐름을 봅니다.</div>
              <div class="pill-row">
                <span class="pill"><span class="dot" style="color:var(--good)"></span><span id="done-summary">완료 0</span></span>
                <span class="pill"><span class="dot" style="color:var(--warn)"></span><span id="progress-summary">진행 0</span></span>
                <span class="pill"><span class="dot" style="color:var(--rose-strong)"></span><span id="feature-summary">기능 0/0</span></span>
                <span class="pill"><span class="dot" style="color:var(--info)"></span><span id="api-summary">API 0/0</span></span>
              </div>
            </div>
            <div class="kanban-board" id="items"></div>
          </div>
        </article>
        <article class="panel">
          <div class="panel-header"><div class="eyebrow">최근 이벤트</div></div>
          <div class="panel-body scroll-body"><div class="card-list compact" id="events"></div></div>
        </article>
      </section>
      <section class="stack stack-right">
        <article class="panel">
          <div class="panel-header"><div class="eyebrow">즉시 집중</div></div>
          <div class="panel-body scroll-body"><div class="card-list compact" id="next-focus"></div></div>
        </article>
        <article class="panel">
          <div class="panel-header"><div class="eyebrow">Quick Links</div></div>
          <div class="panel-body scroll-body"><div class="link-grid" id="quick-links"></div></div>
        </article>
        <article class="panel">
          <div class="panel-header"><div class="eyebrow">차단 / 질문</div></div>
          <div class="panel-body split-stack">
            <div class="split-card">
              <div class="small" style="font-weight:700; color:var(--text); margin-bottom:10px;">차단 항목</div>
              <div class="card-list" id="blockers"></div>
            </div>
            <div class="split-card">
              <div class="small" style="font-weight:700; color:var(--text); margin-bottom:10px;">미해결 질문</div>
              <div class="card-list" id="questions"></div>
            </div>
          </div>
        </article>
      </section>
    </section>
  </div>
  <script>
    const initialState = ${data};
    const REFRESH_INTERVAL_MS = initialState.refresh_interval_ms || 10000;
    let nextRefreshAt = Date.now() + REFRESH_INTERVAL_MS;

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
    function labelStatus(value) {
      const labels = ${JSON.stringify(statusLabels)};
      return labels[value] || value;
    }
    function labelAgent(value) {
      const labels = ${JSON.stringify(agentLabels)};
      return labels[value] || value;
    }
    function badgeClass(status) {
      if (status === 'DONE' || status === 'RESOLVED') return 'done';
      if (status === 'IN_PROGRESS' || status === 'REVIEW' || status === 'QUESTION') return 'progress';
      if (status === 'BLOCKED' || status === 'UNRESOLVED') return 'blocked';
      return 'todo';
    }
    function linkBadgeClass(status) {
      return status === 'live' ? 'live' : 'planned';
    }
    function formatDateParts(date) {
      return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(date);
    }
    function formatClock(date) {
      return date.toLocaleTimeString('ko-KR', { hour12: false });
    }
    function formatDuration(ms) {
      const safeMs = Math.max(0, ms);
      const totalSeconds = Math.floor(safeMs / 1000);
      const seconds = String(totalSeconds % 60).padStart(2, '0');
      const minutes = String(Math.floor(totalSeconds / 60) % 60).padStart(2, '0');
      const hours = Math.floor(totalSeconds / 3600);
      if (hours > 0) {
        return String(hours).padStart(2, '0') + ':' + minutes + ':' + seconds;
      }
      return minutes + ':' + seconds;
    }
    function formatSnapshotTimestamp(value) {
      if (!value) return '--';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return new Intl.DateTimeFormat('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(date);
    }
    function updateClockChrome() {
      const now = new Date();
      document.getElementById('clock-value').textContent = formatClock(now);
      document.getElementById('clock-date').textContent = formatDateParts(now);
      document.getElementById('countdown-value').textContent = formatDuration(nextRefreshAt - Date.now());
    }
    function renderPhases(phases) {
      return phases.map((phase) => (
        '<div class="phase-row">' +
          '<div class="row-head">' +
            '<strong>' + escapeHtml(phase.phase + ' · ' + phase.title) + '</strong>' +
            '<span class="badge ' + badgeClass(phase.status) + '">' + escapeHtml(labelStatus(phase.status)) + '</span>' +
          '</div>' +
          '<div class="small">' + escapeHtml(phase.summary) + '</div>' +
        '</div>'
      )).join('');
    }
    function renderFocus(items) {
      if (!items.length) {
        return '<div class="empty">진행 중이거나 대기 중인 항목이 없습니다.</div>';
      }
      return items.map((item) => (
        '<div class="card-row">' +
          '<div class="row-head">' +
            '<strong>' + escapeHtml(item.todo_id + ' ' + item.title) + '</strong>' +
            '<span class="badge ' + badgeClass(item.status) + '">' + escapeHtml(item.priority + ' / ' + labelStatus(item.status)) + '</span>' +
          '</div>' +
          '<div class="small">담당: ' + escapeHtml(labelAgent(item.owner_agent)) + '</div>' +
        '</div>'
      )).join('');
    }
    function renderItems(items) {
      const lanes = [
        { key: 'active', label: '진행', tone: 'progress', statuses: ['IN_PROGRESS', 'REVIEW'] },
        { key: 'queue', label: '대기 / 차단', tone: 'todo', statuses: ['TODO', 'BLOCKED'] },
        { key: 'done', label: '완료', tone: 'done', statuses: ['DONE'] }
      ];
      return lanes.map((lane) => {
        const laneItems = items.filter((item) => lane.statuses.includes(item.status));
        const body = laneItems.length ? laneItems.map((item) => {
          const refs = []
            .concat(item.feature_refs && item.feature_refs.length ? ['기능 ' + item.feature_refs.join(', ')] : [])
            .concat(item.requirement_refs && item.requirement_refs.length ? ['요구 ' + item.requirement_refs.join(', ')] : [])
            .concat(item.api_refs && item.api_refs.length ? ['API ' + item.api_refs.length] : [])
            .concat(item.db_refs && item.db_refs.length ? ['DB ' + item.db_refs.length] : []);
          return (
            '<div class="card-row compact">' +
              '<div class="row-head">' +
                '<strong>' + escapeHtml(item.todo_id + ' ' + item.title) + '</strong>' +
                '<span class="badge ' + badgeClass(item.status) + '">' + escapeHtml(item.priority) + '</span>' +
              '</div>' +
              '<div class="small">상태: ' + escapeHtml(labelStatus(item.status)) + ' · 담당: ' + escapeHtml(labelAgent(item.owner_agent)) + '</div>' +
              '<div class="small">' + escapeHtml(refs.join(' | ') || '참조 없음') + '</div>' +
              (item.blocker ? '<div class="small" style="color:var(--bad); margin-top:6px;">차단 사유: ' + escapeHtml(item.blocker) + '</div>' : '') +
            '</div>'
          );
        }).join('') : '<div class="empty">표시할 항목이 없습니다.</div>';
        return (
          '<section class="kanban-lane">' +
            '<div class="lane-head">' +
              '<div class="lane-title">' + escapeHtml(lane.label) + '</div>' +
              '<span class="badge ' + lane.tone + '">' + laneItems.length + '</span>' +
            '</div>' +
            '<div class="lane-body">' + body + '</div>' +
          '</section>'
        );
      }).join('');
    }
    function renderEvents(events) {
      return events.slice().reverse().map((event) => (
        '<div class="card-row">' +
          '<div class="row-head">' +
            '<strong>' + escapeHtml(labelAgent(event.agent)) + '</strong>' +
            '<span class="badge ' + badgeClass(event.type) + '">' + escapeHtml(labelStatus(event.type)) + '</span>' +
          '</div>' +
          '<div class="mono">' + escapeHtml(event.ts || event.timestamp || '--') + '</div>' +
          '<div class="small">' + escapeHtml(event.message || event.summary || event.detail || '상세 없음') + '</div>' +
        '</div>'
      )).join('');
    }
    function renderLinks(links) {
      return links.map((link) => (
        '<div class="link-tile">' +
          '<a href="' + escapeHtml(link.href) + '" target="_blank" rel="noreferrer">' +
            '<div class="link-topline">' +
              '<strong>' + escapeHtml(link.label) + '</strong>' +
              '<span class="badge ' + linkBadgeClass(link.status) + '">' + escapeHtml(link.status === 'live' ? 'live' : 'planned') + '</span>' +
            '</div>' +
            '<div class="small">' + escapeHtml(link.note) + '</div>' +
            '<div class="tiny">' + escapeHtml(link.href) + '</div>' +
          '</a>' +
        '</div>'
      )).join('');
    }
    function renderAgents(agents) {
      return agents.map((agent) => (
        '<div class="card-row">' +
          '<div class="row-head">' +
            '<strong>' + escapeHtml(labelAgent(agent.name)) + '</strong>' +
            '<span class="badge ' + badgeClass(agent.status) + '">' + escapeHtml(labelStatus(agent.status)) + '</span>' +
          '</div>' +
          '<div class="small">완료 ' + agent.done + '/' + agent.total + ' · 진행률 ' + agent.progress + '%</div>' +
          '<div class="progress-track"><div class="progress-fill" style="width:' + agent.progress + '%"></div></div>' +
        '</div>'
      )).join('');
    }
    function renderBlockers(items) {
      if (!items.length) {
        return '<div class="empty">차단 항목이 없습니다.</div>';
      }
      return items.map((item) => (
        '<div class="card-row">' +
          '<div class="row-head">' +
            '<strong>' + escapeHtml(item.todo_id + ' ' + item.title) + '</strong>' +
            '<span class="badge blocked">차단</span>' +
          '</div>' +
          '<div class="small">담당: ' + escapeHtml(labelAgent(item.owner_agent)) + '</div>' +
          '<div class="small">' + escapeHtml(item.blocker) + '</div>' +
        '</div>'
      )).join('');
    }
    function renderQuestions(items) {
      const unresolved = items.filter((item) => item.status !== 'RESOLVED');
      if (!unresolved.length) {
        return '<div class="empty">미해결 질문이 없습니다.</div>';
      }
      return unresolved.map((item) => (
        '<div class="card-row">' +
          '<div class="row-head">' +
            '<strong>' + escapeHtml(item.question_id + ' ' + item.topic) + '</strong>' +
            '<span class="badge ' + badgeClass(item.status) + '">' + escapeHtml(labelStatus(item.status)) + '</span>' +
          '</div>' +
          '<div class="small">' + escapeHtml(item.detail) + '</div>' +
        '</div>'
      )).join('');
    }
    function render(state) {
      const updated = document.getElementById('updated-value');
      updated.textContent = formatSnapshotTimestamp(state.updated_at);
      updated.title = state.updated_at || '';
      document.getElementById('active-items').textContent = state.counts.active_items;
      document.getElementById('todo-items').textContent = state.counts.todo_items;
      document.getElementById('blocked-items').textContent = state.counts.blocked_items;
      document.getElementById('question-count').textContent = state.unresolved_questions;
      document.getElementById('done-summary').textContent = '완료 ' + state.counts.done_items + '/' + state.counts.total_items;
      document.getElementById('progress-summary').textContent = '진행 ' + state.counts.active_items + ' · 대기 ' + state.counts.todo_items;
      document.getElementById('feature-summary').textContent = '기능 ' + state.counts.feature_done + '/' + state.counts.feature_total;
      document.getElementById('api-summary').textContent = 'API ' + state.counts.api_done + '/' + state.counts.api_total;
      document.getElementById('phases').innerHTML = renderPhases(state.phases);
      document.getElementById('next-focus').innerHTML = renderFocus(state.next_focus);
      document.getElementById('items').innerHTML = renderItems(state.work_items);
      document.getElementById('events').innerHTML = renderEvents(state.recent_events);
      document.getElementById('quick-links').innerHTML = renderLinks(state.quick_links);
      document.getElementById('agents').innerHTML = renderAgents(state.agents);
      document.getElementById('blockers').innerHTML = renderBlockers(state.blockers);
      document.getElementById('questions').innerHTML = renderQuestions(state.questions);
      updateClockChrome();
    }
    async function refreshState() {
      try {
        const response = await fetch('/api/state', { cache: 'no-store' });
        if (response.ok) {
          render(await response.json());
        }
      } catch (_) {
        // Keep the previous state visible and just reset the next refresh window.
      } finally {
        nextRefreshAt = Date.now() + REFRESH_INTERVAL_MS;
        updateClockChrome();
      }
    }
    render(initialState);
    setInterval(() => {
      updateClockChrome();
      if (Date.now() >= nextRefreshAt) {
        void refreshState();
      }
    }, 1000);
  </script>
</body>
</html>`;
}

module.exports = {
  ensureState,
  buildDashboardModel,
  renderTerminal,
  renderHtml,
  statePath,
  seedPath,
  readJson,
  writeJson,
  escapeHtml,
  renderList,
  REFRESH_INTERVAL_MS
};

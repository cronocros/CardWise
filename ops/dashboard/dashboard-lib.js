const fs = require('node:fs');
const path = require('node:path');

const rootDir = __dirname;
const statePath = path.join(rootDir, 'work-items.json');
const seedPath = path.join(rootDir, 'seed-state.json');
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
  'FE-Vouchers': '프론트 바우처'
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function ensureState() {
  if (!fs.existsSync(statePath)) {
    // Backward compatibility with previously generated state filename.
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

  const agentRows = agents.map((agent) => {
    const owned = workItems.filter((item) => item.owner_agent === agent.name);
    const done = owned.filter((item) => item.status === 'DONE').length;
    const progress = owned.length ? Math.round((done / owned.length) * 100) : (agent.progress || 0);
    return { ...agent, done, total: owned.length, progress };
  });

  return {
    project: state.project || 'CardWise',
    updated_at: state.updated_at || '',
    phases,
    agents: agentRows,
    work_items: workItems,
    blockers,
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
      done_items: workItems.filter((item) => item.status === 'DONE').length,
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
    `집계: 항목 ${model.counts.done_items}/${model.counts.total_items} 완료 | 기능 ${model.counts.feature_done}/${model.counts.feature_total} | 요구사항 ${model.counts.requirement_done}/${model.counts.requirement_total} | API ${model.counts.api_done}/${model.counts.api_total} | 미해결 질문 ${model.unresolved_questions}`
  );
  lines.push('');
  lines.push('에이전트');
  model.agents.forEach((agent) => {
    lines.push(`- ${labelAgent(agent.name).padEnd(16)} ${String(agent.progress).padStart(3)}% ${labelStatus(agent.status).padEnd(12)} ${agent.done}/${agent.total}`);
  });
  lines.push('');
  lines.push('작업 항목');
  model.work_items.forEach((item) => {
    const refs = [
      item.feature_refs && item.feature_refs.length ? `F:${item.feature_refs.join(',')}` : '',
      item.requirement_refs && item.requirement_refs.length ? `R:${item.requirement_refs.join(',')}` : '',
      item.api_refs && item.api_refs.length ? `API:${item.api_refs.length}` : '',
      item.db_refs && item.db_refs.length ? `DB:${item.db_refs.length}` : ''
    ].filter(Boolean).join(' ');
    const blocker = item.blocker ? ` | 차단 사유: ${item.blocker}` : '';
    lines.push(`- ${item.todo_id} [${item.priority}] [${labelStatus(item.status)}] ${labelAgent(item.owner_agent)} :: ${item.title}${blocker}${refs ? ` | ${refs}` : ''}`);
  });
  lines.push('');
  lines.push('최근 이벤트');
  model.recent_events.forEach((event) => {
    lines.push(`- ${event.ts} ${labelAgent(event.agent)} ${labelStatus(event.type)}: ${event.message}`);
  });
  lines.push('');
  lines.push('차단 항목');
  if (!model.blockers.length) {
    lines.push('- 없음');
  } else {
    model.blockers.forEach((blocker) => {
      lines.push(`- ${blocker.todo_id} ${labelAgent(blocker.owner_agent)}: ${blocker.blocker}`);
    });
  }
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
  <title>CardWise 진행 대시보드</title>
  <style>
    :root { --bg:#0b1020; --panel:#121a32; --panel2:#17213f; --text:#e6ebff; --muted:#96a2cf; --accent:#7dd3fc; --good:#34d399; --warn:#fbbf24; --bad:#fb7185; --border:rgba(150,168,255,.16); }
    * { box-sizing: border-box; }
    body { margin:0; font-family: system-ui, sans-serif; color:var(--text); background: radial-gradient(circle at top left, rgba(125,211,252,.16), transparent 25%), linear-gradient(180deg, #070b15, var(--bg)); }
    .wrap { max-width: 1480px; margin: 0 auto; padding: 20px; }
    .hero, .grid { display:grid; gap:16px; }
    .hero { grid-template-columns: 1.2fr .8fr; margin-bottom:16px; }
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .panel { background: rgba(18,26,50,.95); border:1px solid var(--border); border-radius:16px; padding:18px; box-shadow:0 24px 80px rgba(0,0,0,.3); }
    h1,h2,h3 { margin:0 0 10px; }
    h1 { font-size: 36px; letter-spacing: -0.04em; }
    h2 { color:var(--accent); font-size:13px; text-transform:uppercase; letter-spacing:.12em; }
    .meta { color:var(--muted); font-size:13px; line-height:1.6; }
    .stats { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:10px; margin-top:14px; }
    .stat { background:var(--panel2); border:1px solid var(--border); border-radius:14px; padding:12px; }
    .label { color:var(--muted); font-size:12px; text-transform:uppercase; letter-spacing:.08em; }
    .value { font-size:24px; font-weight:700; margin-top:6px; }
    .list { display:grid; gap:10px; }
    .row { background:var(--panel2); border:1px solid var(--border); border-radius:14px; padding:12px 14px; }
    .row-head { display:flex; justify-content:space-between; gap:12px; align-items:baseline; margin-bottom:8px; }
    .badge { font-size:12px; padding:3px 8px; border-radius:999px; border:1px solid var(--border); font-family:monospace; }
    .done { color:var(--good); } .progress { color:var(--warn); } .todo { color:var(--muted); } .blocked { color:var(--bad); }
    .small { color:var(--muted); font-size:13px; line-height:1.6; }
    .mono { font-family: monospace; font-size:12px; color:var(--muted); }
    .progress-track { background:rgba(255,255,255,.06); border-radius:999px; height:8px; overflow:hidden; margin-top:8px; }
    .progress-fill { height:100%; background:linear-gradient(90deg, var(--accent), var(--good)); }
    .tag { display:inline-block; margin:4px 6px 0 0; padding:3px 7px; border-radius:999px; background:rgba(125,211,252,.08); border:1px solid rgba(125,211,252,.18); font-size:11px; }
    .empty { color:var(--muted); font-size:13px; }
    @media (max-width: 1080px) { .hero, .grid, .stats { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <div class="panel">
        <h2>실시간 작업판</h2>
        <h1>CardWise</h1>
        <div class="meta" id="meta"></div>
        <div class="stats">
          <div class="stat"><div class="label">완료 기능</div><div class="value" id="feature-count">0</div></div>
          <div class="stat"><div class="label">완료 요구사항</div><div class="value" id="requirement-count">0</div></div>
          <div class="stat"><div class="label">완료 API</div><div class="value" id="api-count">0</div></div>
          <div class="stat"><div class="label">미해결 질문</div><div class="value" id="question-count">0</div></div>
        </div>
      </div>
      <div class="panel">
        <h3>에이전트 진행률</h3>
        <div class="list" id="agents"></div>
      </div>
    </div>
    <div class="grid">
      <div class="panel"><h3>실행 단계</h3><div class="list" id="phases"></div></div>
      <div class="panel"><h3>최근 이벤트</h3><div class="list" id="events"></div></div>
      <div class="panel"><h3>작업 항목</h3><div class="list" id="items"></div></div>
      <div class="panel"><h3>차단 항목</h3><div class="list" id="blockers"></div></div>
      <div class="panel"><h3>미해결 질문</h3><div class="list" id="questions"></div></div>
    </div>
  </div>
  <script>
    const state = ${data};
    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
    function badgeClass(status) {
      if (status === 'DONE' || status === 'RESOLVED') return 'done';
      if (status === 'IN_PROGRESS' || status === 'QUESTION') return 'progress';
      if (status === 'BLOCKED' || status === 'UNRESOLVED') return 'blocked';
      return 'todo';
    }
    function row(html) { return '<div class="row">' + html + '</div>'; }
    function labelStatus(value) {
      const labels = ${JSON.stringify(statusLabels)};
      return labels[value] || value;
    }
    function labelAgent(value) {
      const labels = ${JSON.stringify(agentLabels)};
      return labels[value] || value;
    }
    function render(s) {
      document.getElementById('meta').textContent = '갱신 시각 ' + s.updated_at + ' | ' + s.counts.done_items + '/' + s.counts.total_items + ' 항목 완료';
      document.getElementById('feature-count').textContent = s.counts.feature_done + '/' + s.counts.feature_total;
      document.getElementById('requirement-count').textContent = s.counts.requirement_done + '/' + s.counts.requirement_total;
      document.getElementById('api-count').textContent = s.counts.api_done + '/' + s.counts.api_total;
      document.getElementById('question-count').textContent = s.unresolved_questions;
      document.getElementById('phases').innerHTML = s.phases.map((p) => row('<div class="row-head"><strong>' + escapeHtml(p.phase + ' ' + p.title) + '</strong><span class="badge ' + badgeClass(p.status) + '">' + escapeHtml(labelStatus(p.status)) + '</span></div><div class="small">' + escapeHtml(p.summary) + '</div>')).join('');
      document.getElementById('agents').innerHTML = s.agents.map((a) => row('<div class="row-head"><strong>' + escapeHtml(labelAgent(a.name)) + '</strong><span class="badge ' + badgeClass(a.status) + '">' + escapeHtml(labelStatus(a.status)) + '</span></div><div class="small">완료 ' + a.done + '/' + a.total + ' | 진행률 ' + a.progress + '%</div><div class="progress-track"><div class="progress-fill" style="width:' + a.progress + '%"></div></div>')).join('');
      document.getElementById('items').innerHTML = s.work_items.map((item) => {
        const refs = []
          .concat(item.feature_refs && item.feature_refs.length ? ['기능: ' + item.feature_refs.join(', ')] : [])
          .concat(item.requirement_refs && item.requirement_refs.length ? ['요구사항: ' + item.requirement_refs.join(', ')] : [])
          .concat(item.api_refs && item.api_refs.length ? ['API: ' + item.api_refs.length] : [])
          .concat(item.db_refs && item.db_refs.length ? ['DB: ' + item.db_refs.length] : []);
        const tags = (item.acceptance || []).map((t) => '<span class="tag">' + escapeHtml(t) + '</span>').join('');
        return row('<div class="row-head"><strong>' + escapeHtml(item.todo_id + ' ' + item.title) + '</strong><span class="badge ' + badgeClass(item.status) + '">' + escapeHtml(item.priority + ' / ' + labelStatus(item.status)) + '</span></div><div class="small">담당: ' + escapeHtml(labelAgent(item.owner_agent)) + '</div><div class="small">' + escapeHtml(refs.join(' | ') || '참조 없음') + '</div><div>' + tags + '</div>');
      }).join('');
      document.getElementById('events').innerHTML = s.recent_events.slice().reverse().map((e) => row('<div class="row-head"><strong>' + escapeHtml(labelAgent(e.agent)) + '</strong><span class="badge ' + badgeClass(e.type) + '">' + escapeHtml(labelStatus(e.type)) + '</span></div><div class="mono">' + escapeHtml(e.ts) + '</div><div class="small">' + escapeHtml(e.message) + '</div>')).join('');
      document.getElementById('blockers').innerHTML = s.blockers.map((b) => row('<div class="row-head"><strong>' + escapeHtml(b.todo_id + ' ' + b.title) + '</strong><span class="badge blocked">차단</span></div><div class="small">담당: ' + escapeHtml(labelAgent(b.owner_agent)) + '</div><div class="small">' + escapeHtml(b.blocker) + '</div>')).join('') || '<div class="empty">차단 항목이 없습니다.</div>';
      document.getElementById('questions').innerHTML = s.questions.filter((q) => q.status !== 'RESOLVED').map((q) => row('<div class="row-head"><strong>' + escapeHtml(q.question_id + ' ' + q.topic) + '</strong><span class="badge ' + badgeClass(q.status) + '">' + escapeHtml(labelStatus(q.status)) + '</span></div><div class="small">' + escapeHtml(q.detail) + '</div>')).join('') || '<div class="empty">열려 있는 질문이 없습니다.</div>';
    }
    render(state);
    setInterval(async () => {
      try {
        const res = await fetch('/api/state', { cache: 'no-store' });
        if (res.ok) render(await res.json());
      } catch (_) {}
    }, 10000);
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
  renderList
};

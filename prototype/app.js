const state = {
  view: "dashboard",
  selected: null,
  query: "",
  todosDone: new Set()
};

const skills = [
  { id: "java", name: "Java", category: "言語", aliases: ["JAVA"] },
  { id: "spring", name: "Spring Boot", category: "FW", aliases: ["Spring"] },
  { id: "react", name: "React", category: "FW", aliases: ["React.js"] },
  { id: "typescript", name: "TypeScript", category: "言語", aliases: ["TS"] },
  { id: "aws", name: "AWS", category: "クラウド", aliases: ["Amazon Web Services"] },
  { id: "postgresql", name: "PostgreSQL", category: "DB", aliases: ["Postgres"] },
  { id: "python", name: "Python", category: "言語", aliases: ["Py"] },
  { id: "pm", name: "PM", category: "役割", aliases: ["Project Manager"] }
];

const projects = [
  {
    id: "project_001",
    name: "販売管理システム刷新",
    role: "Javaバックエンド",
    unitMin: 60,
    unitMax: 72,
    location: "東京",
    workStyle: "週3リモート",
    start: "即日",
    flow: "エンド直",
    interviewCount: 1,
    status: "募集中",
    owner: "sales_001",
    deadline: "今日",
    requiredSkills: ["java", "spring", "postgresql"],
    niceSkills: ["aws"],
    nextAction: "候補人材を2名選定"
  },
  {
    id: "project_002",
    name: "SaaS管理画面フロント開発",
    role: "Reactフロント",
    unitMin: 65,
    unitMax: 78,
    location: "大阪",
    workStyle: "フルリモート",
    start: "来月",
    flow: "一次請け",
    interviewCount: 2,
    status: "選考中",
    owner: "sales_002",
    deadline: "明日",
    requiredSkills: ["react", "typescript"],
    niceSkills: ["aws"],
    nextAction: "面談結果を確認"
  },
  {
    id: "project_003",
    name: "分析基盤バッチ改修",
    role: "Pythonデータ処理",
    unitMin: 58,
    unitMax: 70,
    location: "福岡",
    workStyle: "常駐",
    start: "翌々月",
    flow: "二次請け",
    interviewCount: 1,
    status: "要件確認中",
    owner: "sales_001",
    deadline: "期限未設定",
    requiredSkills: ["python", "postgresql"],
    niceSkills: ["aws"],
    nextAction: "必須スキル年数を確認"
  }
];

const talents = [
  {
    id: "engineer_001",
    role: "Javaエンジニア",
    status: "提案可",
    unit: 68,
    available: "即日",
    location: "東京",
    workStyle: "リモート希望",
    interviewable: "今週可",
    lastContact: "昨日",
    owner: "sales_001",
    skills: [
      { id: "java", years: 5, level: "実務主力" },
      { id: "spring", years: 4, level: "実務主力" },
      { id: "postgresql", years: 3, level: "実務可" }
    ],
    nextAction: "project_001へ提案検討"
  },
  {
    id: "engineer_002",
    role: "フロントエンド",
    status: "面談中",
    unit: 72,
    available: "来月",
    location: "大阪",
    workStyle: "フルリモート可",
    interviewable: "来週可",
    lastContact: "3日前",
    owner: "sales_002",
    skills: [
      { id: "react", years: 4, level: "実務主力" },
      { id: "typescript", years: 3, level: "実務主力" },
      { id: "aws", years: 1, level: "補助" }
    ],
    nextAction: "面談結果待ち"
  },
  {
    id: "engineer_003",
    role: "データエンジニア",
    status: "確認中",
    unit: 66,
    available: "翌々月",
    location: "福岡",
    workStyle: "常駐可",
    interviewable: "未確認",
    lastContact: "10日前",
    owner: "sales_001",
    skills: [
      { id: "python", years: 5, level: "実務主力" },
      { id: "postgresql", years: 4, level: "実務主力" }
    ],
    nextAction: "面談可能日を確認"
  }
];

const proposals = [
  {
    id: "proposal_001",
    projectId: "project_002",
    talentId: "engineer_002",
    sentTo: "company_002",
    sentAt: "昨日",
    status: "返答待ち",
    due: "今日",
    result: "未確定",
    reason: "React/TypeScript一致",
    nextAction: "返答確認"
  }
];

const interviews = [
  {
    id: "interview_001",
    projectId: "project_002",
    talentId: "engineer_002",
    at: "明日 14:00",
    format: "オンライン",
    status: "確定",
    result: "未実施",
    feedback: "未入力",
    nextAction: "前日確認"
  }
];

const activities = [
  { at: "今日 09:00", target: "project_001", actor: "sales_001", action: "候補者確認", next: "engineer_001を提案候補へ" },
  { at: "昨日 16:20", target: "proposal_001", actor: "sales_002", action: "提案送付", next: "返答待ち" },
  { at: "昨日 11:10", target: "engineer_003", actor: "sales_001", action: "稼働時期確認", next: "面談可能日を確認" }
];

function skillName(id) {
  return skills.find((skill) => skill.id === id)?.name || id;
}

function projectById(id) {
  return projects.find((project) => project.id === id);
}

function talentById(id) {
  return talents.find((talent) => talent.id === id);
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function matchesQuery(record) {
  if (!state.query) return true;
  return normalizeText(JSON.stringify(record)).includes(normalizeText(state.query));
}

function scoreMatch(project, talent) {
  const talentSkillIds = talent.skills.map((skill) => skill.id);
  const requiredMatches = project.requiredSkills.filter((id) => talentSkillIds.includes(id));
  const niceMatches = project.niceSkills.filter((id) => talentSkillIds.includes(id));
  const missing = project.requiredSkills.filter((id) => !talentSkillIds.includes(id));
  const unitOk = talent.unit <= project.unitMax;
  const startOk = project.start === talent.available || project.start === "即日" && talent.available === "即日";
  const locationOk = project.workStyle.includes("リモート") || talent.location === project.location || talent.workStyle.includes("リモート");
  const requiredOk = requiredMatches.length >= Math.ceil(project.requiredSkills.length * 0.7);
  const cutoffOk = requiredOk && unitOk && locationOk;
  const requiredScore = Math.round((requiredMatches.length / project.requiredSkills.length) * 30);
  const niceScore = project.niceSkills.length ? Math.round((niceMatches.length / project.niceSkills.length) * 15) : 0;
  const domainScore = talent.role.includes(project.role.split(/[ァ-ン]+|バック|フロント|データ/)[0]) ? 15 : 8;
  const startScore = startOk ? 10 : 5;
  const unitScore = unitOk ? 10 : 0;
  const locationScore = locationOk ? 10 : 0;
  const proposalScore = requiredOk ? 10 : 3;
  const score = cutoffOk ? requiredScore + niceScore + domainScore + startScore + unitScore + locationScore + proposalScore : Math.min(39, requiredScore + niceScore + unitScore);
  let rank = "除外";
  if (cutoffOk && score >= 80) rank = "A";
  else if (cutoffOk && score >= 60) rank = "B";
  else if (cutoffOk && score >= 40) rank = "C";
  return {
    projectId: project.id,
    talentId: talent.id,
    score,
    rank,
    cutoffOk,
    matchedRequired: requiredMatches.map(skillName),
    missing: missing.map(skillName),
    reasons: [
      requiredMatches.length ? `必須一致: ${requiredMatches.map(skillName).join(" / ")}` : "必須一致なし",
      niceMatches.length ? `尚可一致: ${niceMatches.map(skillName).join(" / ")}` : "尚可一致なし",
      unitOk ? "単価レンジ内" : "単価超過",
      locationOk ? "勤務地/リモート条件OK" : "勤務地条件NG"
    ],
    risk: missing.length ? `不足: ${missing.map(skillName).join(" / ")}` : "大きな不足なし"
  };
}

function allMatches() {
  return projects.flatMap((project) => talents.map((talent) => scoreMatch(project, talent)))
    .sort((a, b) => b.score - a.score);
}

function buildTodos() {
  const base = [
    { id: "todo_001", due: "今日", type: "提案", target: "project_001", text: "Java案件に候補人材を選定", priority: "高" },
    { id: "todo_002", due: "今日", type: "返答確認", target: "proposal_001", text: "提案後の返答を確認", priority: "高" },
    { id: "todo_003", due: "明日", type: "面談", target: "interview_001", text: "面談前の条件確認", priority: "中" },
    { id: "todo_004", due: "期限未設定", type: "確認", target: "project_003", text: "必須スキル年数を確認", priority: "中" },
    { id: "todo_005", due: "期限超過", type: "人材", target: "engineer_003", text: "面談可能日を確認", priority: "高" }
  ];
  return base.map((todo) => ({ ...todo, done: state.todosDone.has(todo.id) }));
}

function setView(view) {
  state.view = view;
  state.selected = null;
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
  render();
}

function setSelected(id) {
  state.selected = id;
  render();
}

function markTodo(id) {
  if (state.todosDone.has(id)) {
    state.todosDone.delete(id);
  } else {
    state.todosDone.add(id);
  }
  render();
}

function pill(text, type = "") {
  return `<span class="pill ${type}">${text}</span>`;
}

function skillPills(ids) {
  return `<div class="pill-list">${ids.map((id) => pill(skillName(id))).join("")}</div>`;
}

function renderTable(headers, rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
  `;
}

function renderDashboard() {
  const todos = buildTodos();
  const matches = allMatches();
  return `
    <div class="metrics">
      <div class="metric"><span>未対応タスク</span><strong>${todos.filter((todo) => !todo.done).length}</strong></div>
      <div class="metric"><span>A/B候補</span><strong>${matches.filter((match) => ["A", "B"].includes(match.rank)).length}</strong></div>
      <div class="metric"><span>提案中</span><strong>${proposals.length}</strong></div>
      <div class="metric"><span>面談予定</span><strong>${interviews.length}</strong></div>
    </div>
    <div class="grid-2">
      <section class="panel">
        <h2>今日の優先対応</h2>
        ${renderTodoList(todos.slice(0, 4))}
      </section>
      <section class="panel">
        <h2>高スコア候補</h2>
        ${renderMatchCards(matches.slice(0, 4))}
      </section>
    </div>
    <section class="panel">
      <h2>直近活動</h2>
      ${renderActivityList(activities)}
    </section>
  `;
}

function renderTodoList(todos) {
  return `<div class="todo-list">${todos.map((todo) => `
    <div class="todo-item ${todo.done ? "done" : ""}">
      <div>
        ${pill(todo.due, todo.due === "期限超過" ? "is-danger" : todo.due === "今日" ? "is-warn" : "is-blue")}
      </div>
      <div>
        <strong>${todo.text}</strong>
        <div class="todo-meta">${todo.type} / ${todo.target} / 優先度 ${todo.priority}</div>
      </div>
      <button class="small-action" onclick="markTodo('${todo.id}')">${todo.done ? "戻す" : "完了"}</button>
    </div>
  `).join("")}</div>`;
}

function renderTodos() {
  return `
    <section class="panel">
      <h2>今日やること</h2>
      <p class="muted">期限超過、本日対応、面談前後、結果待ち、最終接触から日数経過を拾う想定です。</p>
      ${renderTodoList(buildTodos())}
    </section>
  `;
}

function renderProjects() {
  const list = projects.filter(matchesQuery);
  const selected = projectById(state.selected) || list[0];
  return `
    <div class="grid-2">
      <section class="panel">
        <div class="toolbar">
          <select aria-label="案件ステータス">
            <option>全ステータス</option>
            <option>募集中</option>
            <option>選考中</option>
            <option>要件確認中</option>
          </select>
          <button class="ghost-action" onclick="setView('matches')">候補を見る</button>
        </div>
        ${renderTable(
          ["案件", "条件", "必須スキル", "状況", "操作"],
          list.map((project) => `
            <tr>
              <td><strong>${project.name}</strong><br><span class="muted">${project.id} / ${project.role}</span></td>
              <td>${project.unitMin}-${project.unitMax}万円<br>${project.location} / ${project.workStyle}<br>${project.start}</td>
              <td>${skillPills(project.requiredSkills)}</td>
              <td><span class="status ${project.status === "募集中" ? "ok" : "warn"}">${project.status}</span><br><span class="muted">${project.nextAction}</span></td>
              <td><button class="small-action" onclick="setSelected('${project.id}')">詳細</button></td>
            </tr>
          `)
        )}
      </section>
      ${renderProjectDetail(selected)}
    </div>
  `;
}

function renderProjectDetail(project) {
  if (!project) return `<section class="detail-panel"><h2>案件詳細</h2><p>該当なし</p></section>`;
  const candidates = allMatches().filter((match) => match.projectId === project.id).slice(0, 3);
  return `
    <section class="detail-panel">
      <h2>案件詳細</h2>
      <div class="detail-grid">
        <div class="detail-cell"><span>案件ID</span>${project.id}</div>
        <div class="detail-cell"><span>担当</span>${project.owner}</div>
        <div class="detail-cell"><span>単価</span>${project.unitMin}-${project.unitMax}万円</div>
        <div class="detail-cell"><span>商流</span>${project.flow}</div>
        <div class="detail-cell"><span>面談回数</span>${project.interviewCount}回</div>
        <div class="detail-cell"><span>次アクション</span>${project.nextAction}</div>
      </div>
      <h3>必須スキル</h3>
      ${skillPills(project.requiredSkills)}
      <h3>候補人材</h3>
      ${renderMatchCards(candidates)}
    </section>
  `;
}

function renderTalents() {
  const list = talents.filter(matchesQuery);
  const selected = talentById(state.selected) || list[0];
  return `
    <div class="grid-2">
      <section class="panel">
        ${renderTable(
          ["人材", "希望条件", "スキル", "状況", "操作"],
          list.map((talent) => `
            <tr>
              <td><strong>${talent.id}</strong><br><span class="muted">${talent.role}</span></td>
              <td>${talent.unit}万円 / ${talent.available}<br>${talent.location} / ${talent.workStyle}</td>
              <td>${skillPills(talent.skills.map((skill) => skill.id))}</td>
              <td><span class="status ${talent.status === "提案可" ? "ok" : "warn"}">${talent.status}</span><br><span class="muted">${talent.nextAction}</span></td>
              <td><button class="small-action" onclick="setSelected('${talent.id}')">詳細</button></td>
            </tr>
          `)
        )}
      </section>
      ${renderTalentDetail(selected)}
    </div>
  `;
}

function renderTalentDetail(talent) {
  if (!talent) return `<section class="detail-panel"><h2>人材詳細</h2><p>該当なし</p></section>`;
  const candidates = allMatches().filter((match) => match.talentId === talent.id).slice(0, 3);
  return `
    <section class="detail-panel">
      <h2>人材詳細</h2>
      <div class="detail-grid">
        <div class="detail-cell"><span>仮ID</span>${talent.id}</div>
        <div class="detail-cell"><span>担当</span>${talent.owner}</div>
        <div class="detail-cell"><span>面談可能日</span>${talent.interviewable}</div>
        <div class="detail-cell"><span>最終接触</span>${talent.lastContact}</div>
        <div class="detail-cell"><span>ステータス</span>${talent.status}</div>
        <div class="detail-cell"><span>次アクション</span>${talent.nextAction}</div>
      </div>
      <h3>スキル</h3>
      ${renderTable(
        ["スキル", "経験年数", "レベル"],
        talent.skills.map((skill) => `<tr><td>${skillName(skill.id)}</td><td>${skill.years}年</td><td>${skill.level}</td></tr>`)
      )}
      <h3>候補案件</h3>
      ${renderMatchCards(candidates)}
    </section>
  `;
}

function renderMatchCards(matches) {
  return `<div class="todo-list">${matches.map((match) => {
    const project = projectById(match.projectId);
    const talent = talentById(match.talentId);
    const rankClass = match.rank === "A" ? "a" : match.rank === "B" ? "b" : match.rank === "C" ? "c" : "x";
    return `
      <div class="todo-item">
        <div><span class="rank ${rankClass}">${match.rank}</span><br><span class="muted">${match.score}点</span></div>
        <div>
          <strong>${project.name} × ${talent.id}</strong>
          <div class="todo-meta">${match.reasons.join(" / ")}</div>
          <div class="todo-meta">${match.risk}</div>
        </div>
        <button class="small-action" onclick="setView('proposals')">提案へ</button>
      </div>
    `;
  }).join("")}</div>`;
}

function renderMatches() {
  const list = allMatches().filter(matchesQuery);
  return `
    <section class="panel">
      <h2>マッチング候補</h2>
      <p class="muted">足切り、100点配点、A/B/C/除外、理由保存を確認する画面です。</p>
      ${renderTable(
        ["ランク", "案件", "人材", "理由", "不足/除外", "操作"],
        list.map((match) => {
          const project = projectById(match.projectId);
          const talent = talentById(match.talentId);
          const rankClass = match.rank === "A" ? "a" : match.rank === "B" ? "b" : match.rank === "C" ? "c" : "x";
          return `
            <tr>
              <td><span class="rank ${rankClass}">${match.rank}</span><br>${match.score}点</td>
              <td><strong>${project.name}</strong><br><span class="muted">${project.id}</span></td>
              <td><strong>${talent.id}</strong><br><span class="muted">${talent.role}</span></td>
              <td>${match.reasons.join("<br>")}</td>
              <td>${match.risk}</td>
              <td><button class="small-action">理由保存</button></td>
            </tr>
          `;
        })
      )}
    </section>
  `;
}

function renderProposals() {
  return `
    <div class="grid-2">
      <section class="panel">
        <h2>提案管理</h2>
        ${renderTable(
          ["提案", "案件/人材", "状況", "次アクション"],
          proposals.map((proposal) => `
            <tr>
              <td><strong>${proposal.id}</strong><br>${proposal.sentAt} / ${proposal.sentTo}</td>
              <td>${projectById(proposal.projectId).name}<br>${proposal.talentId}</td>
              <td><span class="status warn">${proposal.status}</span><br>${proposal.result}</td>
              <td>${proposal.nextAction}<br><span class="muted">期限: ${proposal.due}</span></td>
            </tr>
          `)
        )}
      </section>
      <section class="form-panel">
        <h2>提案作成フォーム</h2>
        ${renderActionForm("proposal")}
      </section>
    </div>
  `;
}

function renderInterviews() {
  return `
    <div class="grid-2">
      <section class="panel">
        <h2>面談管理</h2>
        ${renderTable(
          ["面談", "案件/人材", "状況", "次アクション"],
          interviews.map((interview) => `
            <tr>
              <td><strong>${interview.id}</strong><br>${interview.at} / ${interview.format}</td>
              <td>${projectById(interview.projectId).name}<br>${interview.talentId}</td>
              <td><span class="status ok">${interview.status}</span><br>${interview.result}</td>
              <td>${interview.nextAction}<br><span class="muted">FB: ${interview.feedback}</span></td>
            </tr>
          `)
        )}
      </section>
      <section class="form-panel">
        <h2>面談結果入力</h2>
        ${renderActionForm("interview")}
      </section>
    </div>
  `;
}

function renderActionForm(type) {
  return `
    <form class="form-grid" onsubmit="event.preventDefault(); alert('仮プロトタイプ: 保存処理は未接続です');">
      <div class="field">
        <label>対象案件</label>
        <select>${projects.map((project) => `<option>${project.id} / ${project.name}</option>`).join("")}</select>
      </div>
      <div class="field">
        <label>対象人材</label>
        <select>${talents.map((talent) => `<option>${talent.id} / ${talent.role}</option>`).join("")}</select>
      </div>
      <div class="field">
        <label>ステータス</label>
        <select>
          <option>下書き</option>
          <option>送付済</option>
          <option>返答待ち</option>
          <option>面談調整中</option>
          <option>結果待ち</option>
          <option>見送り</option>
        </select>
      </div>
      <div class="field">
        <label>次アクション期限</label>
        <input type="date">
      </div>
      <div class="field wide">
        <label>${type === "proposal" ? "提案理由/懸念点" : "面談FB/次対応"}</label>
        <textarea placeholder="個人情報や実データは入力しない"></textarea>
      </div>
      <div class="wide">
        <button class="primary-action">仮保存</button>
      </div>
    </form>
  `;
}

function renderActivityList(list) {
  return `<div class="activity-list">${list.map((item) => `
    <div class="activity-item">
      <div class="todo-meta">${item.at}</div>
      <div>
        <strong>${item.action}</strong>
        <div class="todo-meta">${item.target} / ${item.actor}</div>
      </div>
      <div class="todo-meta">次: ${item.next}</div>
    </div>
  `).join("")}</div>`;
}

function renderActivity() {
  return `
    <section class="panel">
      <h2>活動履歴</h2>
      <p class="muted">ログには本文や個人情報を残さず、仮ID・操作種別・日時・次アクションを保存する想定です。</p>
      ${renderActivityList(activities)}
    </section>
  `;
}

function updateTitle() {
  const titles = {
    dashboard: "ダッシュボード",
    todos: "今日やること",
    projects: "案件",
    talents: "人材",
    matches: "マッチング",
    proposals: "提案管理",
    interviews: "面談管理",
    activity: "活動履歴"
  };
  document.getElementById("view-title").textContent = titles[state.view] || "SES Match Pilot";
}

function render() {
  updateTitle();
  const content = document.getElementById("content");
  const views = {
    dashboard: renderDashboard,
    todos: renderTodos,
    projects: renderProjects,
    talents: renderTalents,
    matches: renderMatches,
    proposals: renderProposals,
    interviews: renderInterviews,
    activity: renderActivity
  };
  content.innerHTML = views[state.view]();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.getElementById("globalSearch").addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  state.view = "dashboard";
  state.selected = null;
  state.query = "";
  state.todosDone.clear();
  document.getElementById("globalSearch").value = "";
  setView("dashboard");
});

render();

const state = {
  view: "overview",
  query: "",
  selectedRequestId: "req_001",
  selectedTalentId: "talent_001",
  autoSend: false
};

const requestTtlDays = 7;
const talentTtlDays = 7;

const skillSheets = [
  {
    id: "talent_001",
    code: "engineer_001",
    role: "Javaバックエンド",
    sourceFile: "engineer_001_skill.xlsx",
    fileType: "Excel",
    skills: ["Java", "Spring Boot", "PostgreSQL", "AWS"],
    unit: 68,
    available: "即日",
    location: "東京",
    workStyle: "週3リモート可",
    updatedAt: "2026-06-16",
    validUntil: "2026-06-23",
    status: "提案可"
  },
  {
    id: "talent_002",
    code: "engineer_002",
    role: "Reactフロント",
    sourceFile: "engineer_002_profile.docx",
    fileType: "Word",
    skills: ["React", "TypeScript", "Next.js", "AWS"],
    unit: 72,
    available: "来月",
    location: "大阪",
    workStyle: "フルリモート可",
    updatedAt: "2026-06-15",
    validUntil: "2026-06-22",
    status: "提案可"
  },
  {
    id: "talent_003",
    code: "engineer_003",
    role: "Pythonデータ処理",
    sourceFile: "engineer_003_resume.pdf",
    fileType: "テキストPDF",
    skills: ["Python", "SQL", "PostgreSQL", "ETL"],
    unit: 66,
    available: "翌々月",
    location: "福岡",
    workStyle: "常駐可",
    updatedAt: "2026-06-10",
    validUntil: "2026-06-17",
    status: "期限注意"
  }
];

const incomingRequests = [
  {
    id: "req_001",
    receivedAt: "2026-06-17 09:12",
    fromCompany: "company_101",
    fromAddress: "bp101@example.invalid",
    subject: "【急募】Java/Spring 案件 即日 70万円",
    attachment: "java_spring_project.xlsx",
    fileType: "Excel",
    extracted: {
      role: "Javaバックエンド",
      required: ["Java", "Spring Boot", "PostgreSQL"],
      nice: ["AWS"],
      unitMax: 70,
      start: "即日",
      location: "東京",
      workStyle: "週3リモート"
    },
    validUntil: "2026-06-24",
    status: "マッチング済み"
  },
  {
    id: "req_002",
    receivedAt: "2026-06-17 10:05",
    fromCompany: "company_203",
    fromAddress: "bp203@example.invalid",
    subject: "React 管理画面 フルリモート 来月開始",
    attachment: "react_requirement.docx",
    fileType: "Word",
    extracted: {
      role: "Reactフロント",
      required: ["React", "TypeScript"],
      nice: ["Next.js", "AWS"],
      unitMax: 75,
      start: "来月",
      location: "大阪",
      workStyle: "フルリモート"
    },
    validUntil: "2026-06-24",
    status: "マッチング済み"
  },
  {
    id: "req_003",
    receivedAt: "2026-06-17 11:18",
    fromCompany: "company_305",
    fromAddress: "bp305@example.invalid",
    subject: "Python バッチ改修 常駐案件",
    attachment: "python_batch.pdf",
    fileType: "テキストPDF",
    extracted: {
      role: "Pythonデータ処理",
      required: ["Python", "SQL"],
      nice: ["PostgreSQL"],
      unitMax: 62,
      start: "翌々月",
      location: "福岡",
      workStyle: "常駐"
    },
    validUntil: "2026-06-24",
    status: "確認必要"
  }
];

const customers = [
  {
    id: "customer_001",
    company: "株式会社アルファ",
    person: "田中",
    honorific: "様",
    email: "tanaka@alpha.example.invalid",
    sendable: true,
    ngSkills: [],
    ngConditions: [],
    templateGroup: "標準"
  },
  {
    id: "customer_002",
    company: "ベータソリューションズ株式会社",
    person: "採用ご担当者",
    honorific: "様",
    email: "ses@beta.example.invalid",
    sendable: true,
    ngSkills: ["常駐のみ"],
    ngConditions: ["単価70万円超NG"],
    templateGroup: "丁寧"
  },
  {
    id: "customer_003",
    company: "株式会社ガンマ",
    person: "佐藤",
    honorific: "様",
    email: "sato@gamma.example.invalid",
    sendable: false,
    ngSkills: [],
    ngConditions: ["送信停止中"],
    templateGroup: "停止"
  },
  {
    id: "customer_004",
    company: "デルタテック株式会社",
    person: "山本",
    honorific: "様",
    email: "yamamoto@delta.example.invalid",
    sendable: true,
    ngSkills: ["Python"],
    ngConditions: [],
    templateGroup: "標準"
  }
];

const histories = [
  {
    id: "hist_001",
    sentAt: "2026-06-16 15:20",
    company: "株式会社アルファ",
    email: "tanaka@alpha.example.invalid",
    request: "Java/Spring 案件",
    talent: "engineer_001",
    status: "返信待ち",
    subject: "Javaエンジニアのご提案"
  },
  {
    id: "hist_002",
    sentAt: "2026-06-16 16:10",
    company: "ベータソリューションズ株式会社",
    email: "ses@beta.example.invalid",
    request: "React 管理画面",
    talent: "engineer_002",
    status: "返信あり",
    subject: "React人材のご提案"
  }
];

const replies = [
  {
    id: "reply_001",
    receivedAt: "2026-06-17 09:40",
    from: "ses@beta.example.invalid",
    subject: "Re: React人材のご提案",
    linkedHistory: "hist_002",
    detected: "メールアドレス + 件名一致",
    nextAction: "面談候補日を送る"
  },
  {
    id: "reply_002",
    receivedAt: "2026-06-17 11:30",
    from: "unknown@example.invalid",
    subject: "Re: Java案件について",
    linkedHistory: "未確定",
    detected: "案件名らしき語句のみ一致",
    nextAction: "手動確認"
  }
];

const templates = [
  "いつもお世話になっております。下記人材をご提案いたします。",
  "お世話になっております。貴社案件に近い人材がおりますのでご共有いたします。",
  "いつもありがとうございます。条件に合いそうな技術者をご紹介いたします。",
  "お世話になっております。直近稼働可能な候補者についてご連絡いたします。"
];

function normalize(value) {
  return String(value || "").toLowerCase();
}

function matchesQuery(record) {
  if (!state.query) return true;
  return normalize(JSON.stringify(record)).includes(normalize(state.query));
}

function selectedRequest() {
  return incomingRequests.find((item) => item.id === state.selectedRequestId) || incomingRequests[0];
}

function selectedTalent() {
  return skillSheets.find((item) => item.id === state.selectedTalentId) || skillSheets[0];
}

function score(request, talent) {
  const req = request.extracted;
  const matchedRequired = req.required.filter((skill) => talent.skills.includes(skill));
  const matchedNice = req.nice.filter((skill) => talent.skills.includes(skill));
  const missing = req.required.filter((skill) => !talent.skills.includes(skill));
  const unitOk = talent.unit <= req.unitMax;
  const startOk = talent.available === req.start || req.start === "即日" && talent.available === "即日";
  const locationOk = req.workStyle.includes("リモート") || talent.location === req.location || talent.workStyle.includes("リモート");
  const cutoff = matchedRequired.length >= Math.ceil(req.required.length * 0.7) && unitOk && locationOk;
  const scoreValue = cutoff
    ? Math.round((matchedRequired.length / req.required.length) * 40)
      + Math.round((matchedNice.length / Math.max(req.nice.length, 1)) * 15)
      + (startOk ? 15 : 8)
      + (unitOk ? 15 : 0)
      + (locationOk ? 15 : 0)
    : Math.min(39, matchedRequired.length * 12 + (unitOk ? 5 : 0));
  let rank = "除外";
  if (cutoff && scoreValue >= 80) rank = "1位";
  else if (cutoff && scoreValue >= 65) rank = "2位";
  else if (cutoff && scoreValue >= 45) rank = "3位";
  return {
    requestId: request.id,
    talentId: talent.id,
    score: scoreValue,
    rank,
    cutoff,
    matchedRequired,
    matchedNice,
    missing,
    reasons: [
      matchedRequired.length ? `必須一致: ${matchedRequired.join(" / ")}` : "必須一致なし",
      matchedNice.length ? `尚可一致: ${matchedNice.join(" / ")}` : "尚可一致なし",
      unitOk ? "単価OK" : "単価NG",
      locationOk ? "勤務地/リモートOK" : "勤務地NG"
    ],
    warning: missing.length ? `不足: ${missing.join(" / ")}` : "大きな不足なし"
  };
}

function rankedMatches(request = selectedRequest()) {
  return skillSheets
    .map((talent) => score(request, talent))
    .sort((a, b) => b.score - a.score);
}

function sendTargets(request = selectedRequest(), talent = selectedTalent()) {
  return customers.map((customer) => {
    const blocked = [];
    if (!customer.sendable) blocked.push("送信停止");
    if (customer.ngSkills.some((ng) => talent.skills.includes(ng) || request.extracted.workStyle.includes(ng))) blocked.push("NG条件");
    if (customer.ngConditions.includes("単価70万円超NG") && talent.unit > 70) blocked.push("単価NG");
    return {
      ...customer,
      blocked,
      canSend: blocked.length === 0
    };
  });
}

function templateFor(customer, request, talent) {
  const body = templates[Math.abs(customer.company.length + talent.code.length) % templates.length];
  return `${customer.company}
${customer.person}${customer.honorific}

${body}

【候補者】${talent.code}
【職種】${talent.role}
【主要スキル】${talent.skills.join(" / ")}
【希望単価】${talent.unit}万円
【稼働】${talent.available}

案件「${request.subject}」の条件に近い候補としてご提案です。
ご確認のほどよろしくお願いいたします。`;
}

function pill(text, type = "") {
  return `<span class="pill ${type}">${text}</span>`;
}

function pills(list, type = "") {
  return `<div class="pill-list">${list.map((item) => pill(item, type)).join("")}</div>`;
}

function table(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
  render();
}

function setRequest(id) {
  state.selectedRequestId = id;
  render();
}

function setTalent(id) {
  state.selectedTalentId = id;
  render();
}

function toggleAutoSend() {
  state.autoSend = !state.autoSend;
  render();
}

function renderOverview() {
  return `
    <div class="metrics">
      <div class="metric"><span>本日受信案件</span><strong>${incomingRequests.length}</strong></div>
      <div class="metric"><span>登録スキルシート</span><strong>${skillSheets.length}</strong></div>
      <div class="metric"><span>送信可能企業</span><strong>${customers.filter((c) => c.sendable).length}</strong></div>
      <div class="metric"><span>返信検知</span><strong>${replies.length}</strong></div>
    </div>
    <section class="panel">
      <h2>作りたいサービスの流れ</h2>
      <div class="flow">
        <div class="flow-step"><span>1</span><strong>案件メール受信</strong><p class="muted">本文と添付を取得</p></div>
        <div class="flow-step"><span>2</span><strong>AIなしで読取</strong><p class="muted">Excel/Word/CSV/テキストPDF</p></div>
        <div class="flow-step"><span>3</span><strong>スキルシート照合</strong><p class="muted">候補者1〜3位</p></div>
        <div class="flow-step"><span>4</span><strong>個別メール生成</strong><p class="muted">BCCなし・会社ごと</p></div>
        <div class="flow-step"><span>5</span><strong>履歴/返信管理</strong><p class="muted">会社名・メールで紐づけ</p></div>
      </div>
    </section>
    <div class="grid-2">
      <section class="panel">
        <h2>今日の案件メール</h2>
        ${renderRequestCards(incomingRequests)}
      </section>
      <section class="panel">
        <h2>上位マッチング</h2>
        ${renderMatchCards(rankedMatches().slice(0, 3))}
      </section>
    </div>
  `;
}

function renderRequestCards(list) {
  return `<div class="card-list">${list.filter(matchesQuery).map((request) => `
    <div class="action-card">
      <div>${pill(request.fileType, "blue")}</div>
      <div>
        <strong>${request.subject}</strong>
        <div class="meta">${request.receivedAt} / ${request.attachment}</div>
        <div class="meta">${request.extracted.required.join(" / ")} / 上限${request.extracted.unitMax}万円 / ${request.extracted.workStyle}</div>
      </div>
      <button class="small-action" onclick="setRequest('${request.id}'); setView('matches')">照合</button>
    </div>
  `).join("")}</div>`;
}

function renderInbox() {
  return `
    <div class="grid-2">
      <section class="panel">
        <div class="toolbar">
          ${pill("メール本文", "blue")}
          ${pill("添付Excel/Word/PDF", "blue")}
          ${pill("AIなし抽出", "gray")}
        </div>
        <h2>案件メール</h2>
        ${table(
          ["受信", "件名/添付", "抽出条件", "状態", "操作"],
          incomingRequests.filter(matchesQuery).map((request) => `
            <tr>
              <td>${request.receivedAt}<br><span class="muted">${request.fromAddress}</span></td>
              <td><strong>${request.subject}</strong><br>${request.attachment} / ${request.fileType}</td>
              <td>${request.extracted.required.join(" / ")}<br>${request.extracted.location} / ${request.extracted.workStyle} / ${request.extracted.unitMax}万円</td>
              <td><span class="status ${request.status === "確認必要" ? "warn" : "ok"}">${request.status}</span><br><span class="muted">有効期限: ${request.validUntil}</span></td>
              <td><button class="small-action" onclick="setRequest('${request.id}'); setView('matches')">候補を見る</button></td>
            </tr>
          `)
        )}
      </section>
      <section class="detail-panel">
        <h2>読取対象</h2>
        <div class="card-list">
          <div class="action-card"><div>${pill("OK")}</div><div><strong>Excel / CSV</strong><div class="meta">セルの文字・数値・日付を読む</div></div></div>
          <div class="action-card"><div>${pill("OK")}</div><div><strong>Word</strong><div class="meta">文書内テキストを読む</div></div></div>
          <div class="action-card"><div>${pill("OK")}</div><div><strong>テキストPDF</strong><div class="meta">コピー可能な文字を読む</div></div></div>
          <div class="action-card"><div>${pill("対象外", "danger")}</div><div><strong>画像PDF / スキャンPDF</strong><div class="meta">OCRまたはAI追加が必要</div></div></div>
        </div>
      </section>
    </div>
  `;
}

function renderSheets() {
  return `
    <section class="panel">
      <div class="toolbar">
        <button class="ghost-action">Drive取込予定</button>
        <button class="ghost-action">CSV/Excel登録予定</button>
        <span class="muted">初期版はスキルシート保管場所の設計確認です。</span>
      </div>
      <h2>スキルシート保管</h2>
      ${table(
        ["仮ID", "ファイル", "スキル", "条件", "有効期限", "操作"],
        skillSheets.filter(matchesQuery).map((talent) => `
          <tr>
            <td><strong>${talent.code}</strong><br>${talent.role}</td>
            <td>${talent.sourceFile}<br><span class="muted">${talent.fileType}</span></td>
            <td>${pills(talent.skills)}</td>
            <td>${talent.unit}万円 / ${talent.available}<br>${talent.location} / ${talent.workStyle}</td>
            <td><span class="status ${talent.status === "期限注意" ? "warn" : "ok"}">${talent.validUntil}</span><br>${talent.status}</td>
            <td><button class="small-action" onclick="setTalent('${talent.id}'); setView('send')">提案文へ</button></td>
          </tr>
        `)
      )}
    </section>
  `;
}

function renderMatchCards(matches) {
  return `<div class="card-list">${matches.map((match) => {
    const request = incomingRequests.find((item) => item.id === match.requestId);
    const talent = skillSheets.find((item) => item.id === match.talentId);
    const rankClass = match.rank === "1位" ? "a" : match.rank === "2位" ? "b" : "c";
    return `
      <div class="action-card">
        <div><span class="rank ${rankClass}">${match.rank}</span><div class="meta">${match.score}点</div></div>
        <div>
          <strong>${request.subject}</strong>
          <div>${talent.code} / ${talent.role}</div>
          <div class="meta">${match.reasons.join(" / ")}</div>
          <div class="meta">${match.warning}</div>
        </div>
        <button class="small-action" onclick="setTalent('${talent.id}'); setView('send')">送信準備</button>
      </div>
    `;
  }).join("")}</div>`;
}

function renderMatches() {
  const request = selectedRequest();
  const matches = rankedMatches(request);
  return `
    <div class="grid-2">
      <section class="panel">
        <h2>案件メール起点のマッチング</h2>
        <p class="muted">人が毎回選ぶのではなく、受信案件から自動で候補者1〜3位を出す想定です。</p>
        ${renderRequestCards([request])}
        <h3>候補者ランキング</h3>
        ${renderMatchCards(matches)}
      </section>
      <section class="detail-panel">
        <h2>抽出された案件条件</h2>
        <div class="card-list">
          <div><strong>職種</strong><div class="meta">${request.extracted.role}</div></div>
          <div><strong>必須</strong>${pills(request.extracted.required)}</div>
          <div><strong>尚可</strong>${pills(request.extracted.nice, "blue")}</div>
          <div><strong>条件</strong><div class="meta">${request.extracted.unitMax}万円 / ${request.extracted.start} / ${request.extracted.location} / ${request.extracted.workStyle}</div></div>
        </div>
      </section>
    </div>
  `;
}

function renderCustomers() {
  return `
    <section class="panel">
      <div class="toolbar">
        <button class="ghost-action">CSVインポート予定</button>
        <button class="ghost-action">列名自動認識予定</button>
        <span class="muted">会社名、担当者、メール、NG条件を先に登録します。</span>
      </div>
      <h2>送信先マスタ</h2>
      ${table(
        ["会社", "宛名", "メール", "送信可否", "NG条件", "テンプレ"],
        customers.filter(matchesQuery).map((customer) => `
          <tr>
            <td><strong>${customer.company}</strong><br>${customer.id}</td>
            <td>${customer.person}${customer.honorific}</td>
            <td>${customer.email}</td>
            <td><span class="status ${customer.sendable ? "ok" : "bad"}">${customer.sendable ? "送信可" : "停止"}</span></td>
            <td>${[...customer.ngSkills, ...customer.ngConditions].length ? pills([...customer.ngSkills, ...customer.ngConditions], "warn") : pill("なし", "gray")}</td>
            <td>${customer.templateGroup}</td>
          </tr>
        `)
      )}
    </section>
  `;
}

function renderSend() {
  const request = selectedRequest();
  const best = rankedMatches(request).find((match) => match.rank !== "除外");
  const talent = selectedTalent() || skillSheets.find((item) => item.id === best.talentId);
  const targets = sendTargets(request, talent);
  const firstTarget = targets.find((target) => target.canSend) || targets[0];
  return `
    <div class="grid-2">
      <section class="panel">
        <div class="toolbar">
          <button class="${state.autoSend ? "primary-action" : "ghost-action"}" onclick="toggleAutoSend()">自動送信 ${state.autoSend ? "ON" : "OFF"}</button>
          <span class="muted">初期値はOFF。ONなら条件OKの会社へ個別送信する想定です。</span>
        </div>
        <h2>BCCなし個別送信</h2>
        ${table(
          ["送信先", "宛名", "判定", "理由", "操作"],
          targets.map((target) => `
            <tr>
              <td><strong>${target.company}</strong><br>${target.email}</td>
              <td>${target.person}${target.honorific}</td>
              <td><span class="status ${target.canSend ? "ok" : "bad"}">${target.canSend ? "送信対象" : "除外"}</span></td>
              <td>${target.blocked.length ? pills(target.blocked, "danger") : pill("NGなし")}</td>
              <td><button class="small-action" ${target.canSend ? "" : "disabled"}>個別メール作成</button></td>
            </tr>
          `)
        )}
      </section>
      <section class="detail-panel">
        <h2>メール文面プレビュー</h2>
        <p class="muted">会社名・担当者名を差し込み、1社ずつToで送る想定です。</p>
        <div class="mail-preview">${templateFor(firstTarget, request, talent)}</div>
      </section>
    </div>
  `;
}

function renderHistory() {
  return `
    <section class="panel">
      <h2>送信履歴</h2>
      <p class="muted">どの会社へ、どの案件で、どの人材を、いつ送ったかを検索できます。</p>
      ${table(
        ["送信日時", "会社/メール", "案件", "人材", "状態", "件名"],
        histories.filter(matchesQuery).map((item) => `
          <tr>
            <td>${item.sentAt}</td>
            <td><strong>${item.company}</strong><br>${item.email}</td>
            <td>${item.request}</td>
            <td>${item.talent}</td>
            <td><span class="status ${item.status === "返信あり" ? "ok" : "warn"}">${item.status}</span></td>
            <td>${item.subject}</td>
          </tr>
        `)
      )}
    </section>
  `;
}

function renderReplies() {
  return `
    <section class="panel">
      <h2>返信検知</h2>
      <p class="muted">返信元メールアドレス、件名、案件名らしき文字から過去の送信履歴に紐づける想定です。</p>
      ${table(
        ["受信", "返信元/件名", "紐づけ", "検知理由", "次アクション"],
        replies.filter(matchesQuery).map((reply) => `
          <tr>
            <td>${reply.receivedAt}</td>
            <td>${reply.from}<br><strong>${reply.subject}</strong></td>
            <td>${reply.linkedHistory}</td>
            <td>${reply.detected}</td>
            <td>${reply.nextAction}</td>
          </tr>
        `)
      )}
    </section>
  `;
}

function renderSettings() {
  return `
    <div class="grid-2">
      <section class="panel">
        <h2>会社別設定</h2>
        <div class="form-grid">
          <div class="field"><label>案件有効期限</label><select><option>${requestTtlDays}日</option><option>1日</option><option>3日</option><option>10日</option></select></div>
          <div class="field"><label>人材有効期限</label><select><option>${talentTtlDays}日</option><option>1日</option><option>3日</option><option>10日</option></select></div>
          <div class="field"><label>自動送信初期値</label><select><option>OFF</option><option>ON</option></select></div>
          <div class="field"><label>送信上限</label><select><option>1日100社</option><option>1日300社</option></select></div>
          <div class="field wide"><label>Drive保管方針</label><textarea readonly>案件添付は期限後もDB履歴として残す。Driveファイルは会社設定に応じてアーカイブ対象にする。</textarea></div>
        </div>
      </section>
      <section class="panel">
        <h2>サブスク制御</h2>
        <div class="card-list">
          <div class="action-card"><div>${pill("支払中")}</div><div><strong>全機能利用可</strong><div class="meta">取込、照合、送信、履歴検索</div></div></div>
          <div class="action-card"><div>${pill("未払い", "warn")}</div><div><strong>取込/送信停止</strong><div class="meta">閲覧のみへ制限</div></div></div>
          <div class="action-card"><div>${pill("解約", "danger")}</div><div><strong>ログイン停止</strong><div class="meta">データ削除は即時にしない</div></div></div>
        </div>
      </section>
    </div>
  `;
}

function updateTitle() {
  const titles = {
    overview: "全体像",
    inbox: "案件メール",
    sheets: "スキルシート",
    matches: "マッチング",
    customers: "送信先マスタ",
    send: "個別送信",
    history: "送信履歴",
    replies: "返信検知",
    settings: "設定"
  };
  document.getElementById("viewTitle").textContent = titles[state.view] || "SES Auto Propose";
}

function render() {
  updateTitle();
  const views = {
    overview: renderOverview,
    inbox: renderInbox,
    sheets: renderSheets,
    matches: renderMatches,
    customers: renderCustomers,
    send: renderSend,
    history: renderHistory,
    replies: renderReplies,
    settings: renderSettings
  };
  document.getElementById("content").innerHTML = views[state.view]();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.getElementById("searchInput").addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  state.view = "overview";
  state.query = "";
  state.selectedRequestId = "req_001";
  state.selectedTalentId = "talent_001";
  document.getElementById("searchInput").value = "";
  setView("overview");
});

render();

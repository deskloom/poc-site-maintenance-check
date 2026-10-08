"use strict";

const SITES = [
  {
    id: "site-a",
    name: "訪問看護サイトA",
    phpVersion: "7.4.33",
    wpVersion: "6.0.1",
    theme: "架空テーマA 1.2.0",
    lastBackup: "2026-09-20",
    issues: [
      { title: "PHPの版を安定版へ上げる", done: false },
      { title: "側面の案内枠が追加できない状態を直す", done: false }
    ]
  },
  {
    id: "site-b",
    name: "訪問介護サイトB",
    phpVersion: "8.0.30",
    wpVersion: "6.3.2",
    theme: "架空テーマB 2.0.1",
    lastBackup: "2026-09-28",
    issues: [
      { title: "側面の案内枠の表示崩れを確認する", done: false },
      { title: "問い合わせ送受信の確認", done: false }
    ]
  },
  {
    id: "site-c",
    name: "相談支援サイトC",
    phpVersion: "8.2.10",
    wpVersion: "6.5.1",
    theme: "架空テーマC 1.0.4",
    lastBackup: "2026-10-01",
    issues: [{ title: "軽微な表示の乱れを確認する", done: false }]
  }
];

function phpStatus(v) {
  const m = String(v).match(/^(\d+)\.(\d+)/);
  if (!m) return { level: "unknown", label: "不明" };
  const n = Number(m[1]) * 100 + Number(m[2]);
  if (n < 801) return { level: "danger", label: "更新が必要" };
  if (n < 802) return { level: "warn", label: "まもなく更新時期" };
  return { level: "ok", label: "安定" };
}

function wpStatus(v) {
  const m = String(v).match(/^(\d+)\.(\d+)/);
  if (!m) return { level: "unknown", label: "不明" };
  const n = Number(m[1]) * 1000 + Number(m[2]);
  if (n < 6003) return { level: "danger", label: "更新が必要" };
  if (n < 6005) return { level: "warn", label: "確認を推奨" };
  return { level: "ok", label: "安定" };
}

function evaluate(site) {
  const php = phpStatus(site.phpVersion);
  const wp = wpStatus(site.wpVersion);
  let overall = "ok";
  let label = "安定";
  if (php.level === "danger" || wp.level === "danger") {
    overall = "danger";
    label = "対応が必要";
  } else if (php.level === "warn" || wp.level === "warn" || site.issues.length > 0) {
    overall = "warn";
    label = "確認を推奨";
  }
  return { php, wp, overall, label };
}

function render() {
  const wrap = document.getElementById("sites");
  const counts = { danger: 0, warn: 0, ok: 0 };
  SITES.forEach((s) => {
    const ev = evaluate(s);
    counts[ev.overall] += 1;
    const div = document.createElement("article");
    div.className = "site";
    const issues = s.issues.map((i) => `<div class="issue">・${i.title}</div>`).join("");
    div.innerHTML =
      `<h3>${s.name} <span class="badge ${ev.overall}">${ev.label}</span></h3>` +
      `<div><span class="badge ${ev.php.level}">PHP ${s.phpVersion}：${ev.php.label}</span>` +
      `<span class="badge ${ev.wp.level}">本体 ${s.wpVersion}：${ev.wp.label}</span></div>` +
      `<p class="meta">${s.theme}／控え ${s.lastBackup}</p>` + issues;
    wrap.appendChild(div);
  });
  document.getElementById("needAction").textContent = counts.danger;
  document.getElementById("needCheck").textContent = counts.warn;
  document.getElementById("stable").textContent = counts.ok;

  const rank = { danger: 0, warn: 1, ok: 2 };
  const tasks = [];
  SITES.forEach((s) => {
    const ev = evaluate(s);
    s.issues.forEach((i) => tasks.push({ site: s.name, title: i.title, o: ev.overall }));
  });
  tasks.sort((a, b) => rank[a.o] - rank[b.o]);
  const ul = document.getElementById("tasks");
  tasks.forEach((t) => {
    const li = document.createElement("li");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.setAttribute("aria-label", t.title);
    box.addEventListener("change", () => li.classList.toggle("done", box.checked));
    const span = document.createElement("div");
    span.innerHTML = `<div class="t-site">${t.site}</div><div class="t-title">${t.title}</div>`;
    li.appendChild(box);
    li.appendChild(span);
    ul.appendChild(li);
  });
}

render();

"use strict";

// PHP バージョンの保守状態を判定する。外部APIなしの固定ルール。
function getPhpStatus(version) {
  const v = String(version || "").trim();
  const m = v.match(/^(\d+)\.(\d+)/);
  if (!m) return { level: "unknown", label: "不明" };
  const major = Number(m[1]);
  const minor = Number(m[2]);
  const num = major * 100 + minor;
  // 2026年時点の想定ルール（POC用の固定値）
  if (num < 801) return { level: "danger", label: "更新が必要" };
  if (num < 802) return { level: "warn", label: "まもなく更新時期" };
  return { level: "ok", label: "安定" };
}

function getWpStatus(version) {
  const v = String(version || "").trim();
  const m = v.match(/^(\d+)\.(\d+)(?:\.(\d+))?/);
  if (!m) return { level: "unknown", label: "不明" };
  const major = Number(m[1]);
  const minor = Number(m[2]);
  const num = major * 1000 + minor;
  if (num < 6003) return { level: "danger", label: "更新が必要" };
  if (num < 6005) return { level: "warn", label: "確認を推奨" };
  return { level: "ok", label: "安定" };
}

// 1サイト分の総合判定
function evaluateSite(site) {
  const php = getPhpStatus(site.phpVersion);
  const wp = getWpStatus(site.wpVersion);
  const openIssues = (site.issues || []).filter((i) => !i.done).length;
  let overall = "ok";
  let overallLabel = "安定";
  if (php.level === "danger" || wp.level === "danger") {
    overall = "danger";
    overallLabel = "対応が必要";
  } else if (php.level === "warn" || wp.level === "warn" || openIssues > 0) {
    overall = "warn";
    overallLabel = "確認を推奨";
  }
  return { id: site.id, php, wp, openIssues, overall, overallLabel };
}

// 未対応タスクを優先度順に並べる（danger サイト由来を先頭に）
function prioritizeTasks(sites) {
  const rank = { danger: 0, warn: 1, ok: 2 };
  const evalById = new Map(sites.map((s) => [s.id, evaluateSite(s)]));
  const tasks = [];
  for (const s of sites) {
    for (const issue of s.issues || []) {
      if (issue.done) continue;
      const ev = evalById.get(s.id);
      tasks.push({
        siteId: s.id,
        siteName: s.name,
        title: issue.title,
        siteOverall: ev.overall,
        _order: rank[ev.overall] ?? 9,
      });
    }
  }
  tasks.sort((a, b) => a._order - b._order || a.siteId.localeCompare(b.siteId));
  return tasks.map(({ _order, ...rest }) => rest);
}

function summarize(sites) {
  const evals = sites.map(evaluateSite);
  return {
    total: sites.length,
    needAction: evals.filter((e) => e.overall === "danger").length,
    needCheck: evals.filter((e) => e.overall === "warn").length,
    stable: evals.filter((e) => e.overall === "ok").length,
  };
}

module.exports = { getPhpStatus, getWpStatus, evaluateSite, prioritizeTasks, summarize };

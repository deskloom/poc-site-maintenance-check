const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { getPhpStatus, getWpStatus, evaluateSite, prioritizeTasks, summarize } = require("../lib/check.js");
const sites = require("../data/sites.json");

describe("保守チェック", () => {
  it("古いPHP版を更新が必要と判定する", () => {
    assert.equal(getPhpStatus("7.4.33").level, "danger");
  });

  it("新しいPHP版を安定と判定する", () => {
    assert.equal(getPhpStatus("8.2.10").level, "ok");
  });

  it("古いサイト全体を対応が必要と判定する", () => {
    const ev = evaluateSite(sites[0]);
    assert.equal(ev.overall, "danger");
    assert.equal(ev.openIssues, 2);
  });

  it("3件の概要件数を正しく数える", () => {
    const s = summarize(sites);
    assert.equal(s.total, 3);
    assert.equal(s.needAction + s.needCheck + s.stable, 3);
  });

  it("対応が必要なサイトの作業を先頭に並べる", () => {
    const tasks = prioritizeTasks(sites);
    assert.equal(tasks[0].siteId, "site-a");
    assert.ok(tasks.length === 5);
    assert.ok(tasks.every((t) => t.title && t.title.length > 0));
  });
});

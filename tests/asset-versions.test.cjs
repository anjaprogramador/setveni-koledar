(function () {
  "use strict";
  const test = require("node:test");
  const assert = require("node:assert/strict");
  const fs = require("node:fs");
  const path = require("node:path");
  const crypto = require("node:crypto");
  const root = path.resolve(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const assets = [
    "style.css",
    "planner.css",
    "app.js",
    "planner-engine.js",
    "planner.js",
  ];
  test("every application asset has a content version matching the deployed file", () => {
    for (const file of assets) {
      const hash = crypto
        .createHash("sha256")
        .update(fs.readFileSync(path.join(root, file)))
        .digest("hex")
        .slice(0, 12);
      assert.ok(
        html.includes(`"${file}?v=${hash}"`),
        `${file} must use its current content version. Run node scripts/update-asset-versions.cjs`,
      );
      assert.ok(
        !html.includes(`"${file}"`),
        `${file} must not have an unversioned reference`,
      );
    }
  });
  test("deferred planner scripts keep the application, engine and UI startup order", () => {
    const scripts = Array.from(
      html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g),
    );
    assert.deepEqual(
      scripts.map((match) => match[1].split("?")[0]),
      ["app.js", "planner-engine.js", "planner.js"],
    );
    for (const [tag] of scripts) assert.match(tag, /\bdefer\b/);
  });
})();

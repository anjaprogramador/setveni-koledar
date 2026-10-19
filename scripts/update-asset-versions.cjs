(function () {
  "use strict";
  const fs = require("node:fs");
  const path = require("node:path");
  const crypto = require("node:crypto");
  const root = path.resolve(__dirname, "..");
  const indexFile = path.join(root, "index.html");
  const assets = new Set([
    "style.css",
    "planner.css",
    "app.js",
    "planner-engine.js",
    "planner.js",
  ]);
  let updated = 0;
  const html = fs
    .readFileSync(indexFile, "utf8")
    .replace(
      /\b(src|href)=(["'])([^"'?#]+)(?:\?[^"']*)?\2/g,
      (match, attribute, quote, filename) => {
        if (!assets.has(filename)) return match;
        const digest = crypto
          .createHash("sha256")
          .update(fs.readFileSync(path.join(root, filename)))
          .digest("hex")
          .slice(0, 12);
        updated++;
        return `${attribute}=${quote}${filename}?v=${digest}${quote}`;
      },
    );
  if (updated !== assets.size)
    throw new Error(
      `Expected ${assets.size} versioned assets; found ${updated}`,
    );
  fs.writeFileSync(indexFile, html);
  console.log(`Updated ${updated} asset versions in index.html.`);
})();

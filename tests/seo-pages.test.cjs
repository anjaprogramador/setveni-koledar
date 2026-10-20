"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const config = require("../site.config.json");
const manifest = require("../seo-manifest.json");
const base = new URL(config.url);
const decode = text => text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const pages = manifest.map(entry => ({...entry, html: fs.readFileSync(path.join(root, entry.route, "index.html"), "utf8")}));

test("every public page has unique search metadata, one H1 and its own canonical URL", () => {
  assert.ok(pages.length >= 37);
  const titles = new Set(), descriptions = new Set();
  for (const p of pages) {
    const title = decode(p.html.match(/<title>([^<]+)<\/title>/)[1]);
    const description = decode(p.html.match(/<meta\s+name="description"\s+content="([^"]+)"/)[1]);
    assert.ok(!titles.has(title), `Duplicate title: ${p.route}`);
    assert.ok(!descriptions.has(description), `Duplicate description: ${p.route}`);
    titles.add(title); descriptions.add(description);
    assert.equal((p.html.match(/<h1\b/g) || []).length, 1, p.route);
    assert.match(p.html, /<html lang="sl">/);
    assert.equal(p.html.match(/<link rel="canonical" href="([^"]+)"/)[1], new URL(p.route, base).href);
    assert.match(p.html, /property="og:image"/);
    assert.ok(description.length >= 70 && description.length <= 190, `${p.route}: ${description.length} character description`);
  }
});

test("the sitemap matches all public pages and uses the GitHub Pages project prefix", () => {
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => decode(m[1]));
  assert.deepEqual(locations.sort(), pages.map(p => new URL(p.route, base).href).sort());
  for (const location of locations) {
    const url = new URL(location);
    assert.equal(url.origin, base.origin);
    assert.ok(url.pathname.startsWith(base.pathname));
    assert.equal(url.search + url.hash, "");
  }
  assert.ok(!fs.existsSync(path.join(root, "robots.txt")), "A project robots.txt does not control the origin crawl rules");
});

test("internal links, fragments and assets resolve under a project URL", () => {
  for (const p of pages) {
    for (const m of p.html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const url = new URL(decode(m[1]), new URL(p.route, base));
      if (url.origin !== base.origin) continue;
      assert.ok(url.pathname.startsWith(base.pathname), `${p.route}: escaped project prefix: ${m[1]}`);
      const local = path.join(root, decodeURIComponent(url.pathname.slice(base.pathname.length)));
      const destination = fs.existsSync(local) && fs.statSync(local).isDirectory() ? path.join(local, "index.html") : local;
      assert.ok(fs.existsSync(destination), `${p.route}: broken path ${m[1]}`);
      if (url.hash && destination.endsWith(".html")) {
        const target = fs.readFileSync(destination, "utf8");
        const id = decodeURIComponent(url.hash.slice(1));
        assert.ok(target.includes(`id="${id}"`), `${p.route}: broken fragment ${m[1]}`);
      }
      if (url.searchParams.has("v")) {
        const hash = crypto.createHash("sha256").update(fs.readFileSync(destination)).digest("hex").slice(0, 12);
        assert.equal(url.searchParams.get("v"), hash, `${p.route}: stale ${m[1]}`);
      }
    }
  }
});

test("structured data describes actual pages without an invented author or reviews", () => {
  for (const p of pages) {
    const blocks = [...p.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(blocks.length, 1, p.route);
    const data = JSON.parse(blocks[0][1]);
    assert.equal(data["@context"], "https://schema.org");
    assert.ok(data["@graph"].some(item => item.url === new URL(p.route, base).href));
    assert.doesNotMatch(blocks[0][1], /"(?:Person|Review|AggregateRating|author)"/);
  }
});

test("plant guides and herb choices are useful in the static HTML", () => {
  const landing = pages.find(p => p.route === "").html;
  const discovery = landing.match(/<section class="herb-discovery"[\s\S]*?<\/section>/)[0];
  for (const id of ["bazilika", "petersilj", "drobnjak", "meta", "timijan", "rozmarin"])
    assert.ok(discovery.includes(`href="rastline/${id}/"`));
  const plantPages = pages.filter(p => /^rastline\/[^/]+\/$/.test(p.route));
  assert.equal(plantPages.length, 18);
  for (const p of plantPages) {
    const article = p.html.match(/<article class="guide-article">([\s\S]*?)<\/article>/)[1];
    const words = decode(article.replace(/<[^>]*>/g, " ")).split(/\s+/).filter(Boolean);
    assert.ok(words.length >= 250, `${p.route}: ${words.length} words`);
    assert.match(article, /Pogosta vprašanja/);
  }
});

test("namedays have valid fixed dates, source references and a static fallback", () => {
  const namedays = require("../content/namedays.json");
  const page = pages.find(p => p.route === "godovi/").html;
  assert.equal((page.match(/data-nameday-entry /g) || []).length, namedays.entries.length);
  assert.ok(namedays.entries.length >= 90);
  assert.equal(new Set(namedays.entries.map(e => e.month)).size, 12);
  for (const entry of namedays.entries) {
    const date = new Date(Date.UTC(2000, entry.month - 1, entry.day));
    assert.equal(date.getUTCMonth() + 1, entry.month);
    assert.equal(date.getUTCDate(), entry.day);
    assert.ok(entry.source.includes(namedays.source.commit));
    assert.match(entry.source, /#L\d+$/);
    assert.ok(entry.names.every(name => page.includes(name)));
  }
  assert.match(page, /Ni popoln uradni slovenski bogoslužni koledar/);
  assert.match(page, /data-nameday-controls hidden/);
  assert.doesNotMatch(page, /data-nameday-entry[^>]*\bhidden\b/);
  assert.ok(namedays.entries.some(e => e.month === 7 && e.day === 26 && e.names.includes("Anja")));
  assert.ok(namedays.entries.some(e => e.month === 5 && e.day === 14 && e.names.includes("Matija")));
  const sayings = pages.find(p => p.route === "ljudske-modrosti/").html;
  assert.match(sayings, /stari datum Matijevega, 24. februar/);
  assert.match(sayings, /Vremenski pregovori niso zanesljiva vremenska napoved/);
});

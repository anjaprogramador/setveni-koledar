(function () {
  "use strict";
  const fs = require("node:fs"),
    path = require("node:path"),
    vm = require("node:vm"),
    crypto = require("node:crypto");
  const root = path.resolve(__dirname, "..");
  const config = JSON.parse(
    fs.readFileSync(path.join(root, "site.config.json"), "utf8"),
  );
  const content = JSON.parse(
    fs.readFileSync(path.join(root, "content/plant-content.json"), "utf8"),
  );
  const monthContent = JSON.parse(
    fs.readFileSync(path.join(root, "content/month-content.json"), "utf8"),
  );
  const proverbs = JSON.parse(fs.readFileSync(path.join(root, "content/proverbs.json"), "utf8"));
  const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const plantMatch = source.match(/const plants\s*=\s*(\[[\s\S]*?\n\]);/);
  const guideMatch = source.match(/const guides\s*=\s*({[\s\S]*?\n});/);
  if (!plantMatch || !guideMatch) throw new Error("Calendar data not found.");
  const plants = JSON.parse(JSON.stringify(vm.runInNewContext(plantMatch[1])));
  const guides = JSON.parse(
    JSON.stringify(vm.runInNewContext("(" + guideMatch[1] + ")")),
  );
  const engine = require(path.join(root, "planner-engine.js"));
  const base = config.url.endsWith("/") ? config.url : config.url + "/";
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const json = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
  const hash = (filename) =>
    crypto
      .createHash("sha256")
      .update(fs.readFileSync(path.join(root, filename)))
      .digest("hex")
      .slice(0, 12);
  const url = (route) => new URL(route, base).href;
  const herbs = plants.filter((p) => p.kind === "herb");
  const vegetables = plants.filter((p) => p.kind !== "herb");
  const written = [];
  const monthNames = monthContent.map((m) => m.name);
  const joinMonths = (values) =>
    values.map((m) => monthNames[m - 1].toLocaleLowerCase("sl")).join(", ") ||
    "Ni predvideno";
  const facts = (values) =>
    `<dl>${values.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join("")}</dl>`;
  const methodNote =
    '<p class="guide-method-note">Informativni vodnik za osrednjo Slovenijo. Termine, velikost posode in razmike prilagodite sorti, vremenu in navodilom dobavitelja. Podatki niso napoved dejanskega datuma pobiranja.</p>';
  function metadata(
    route,
    title,
    description,
    type = "WebPage",
    breadcrumbs = [],
  ) {
    const canonical = url(route);
    const graph = [
      {
        "@type": "WebSite",
        "@id": base + "#website",
        url: base,
        name: config.name,
        inLanguage: "sl",
      },
      {
        "@type": type,
        "@id": canonical + "#page",
        url: canonical,
        name: title,
        description,
        inLanguage: "sl",
        isPartOf: { "@id": base + "#website" },
        ...(type === "Article"
          ? {
              headline: title,
              mainEntityOfPage: canonical,
              image: url("assets/social-card.png"),
              datePublished: config.published,
              dateModified: config.published,
            }
          : {}),
      },
    ];
    if (breadcrumbs.length)
      graph.push({
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map(([name, route], index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
          item: url(route),
        })),
      });
    return `<link rel="canonical" href="${canonical}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:locale" content="sl_SI"><meta property="og:site_name" content="${escape(config.name)}"><meta property="og:type" content="${type === "Article" ? "article" : "website"}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${url("assets/social-card.png")}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Setveni koledar za vrt in balkon — zelenjava, začimbe in osebni načrt"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${url("assets/social-card.png")}"><script type="application/ld+json">${json({ "@context": "https://schema.org", "@graph": graph })}</script>`;
  }
  function prefix(route) {
    return "../".repeat(route.split("/").filter(Boolean).length);
  }
  function header(pre) {
    return `<a class="skip-link" href="#vsebina">Preskoči na vsebino</a><header class="guide-header"><div class="container guide-navigation"><a href="${pre}" class="brand"><img class="brand-mark" src="${pre}assets/favicon.svg" width="44" height="44" alt=""><span>setvenikoledar<small>Svoj vrt. Svoj ritem.</small></span></a><nav class="guide-nav" aria-label="Glavna navigacija"><a href="${pre}#nacrt">Načrtovalnik</a><a href="${pre}meseci/">Koledar</a><a href="${pre}balkon/">Začimbe na balkonu</a><a href="${pre}rastline/">Rastlinski vodniki</a></nav></div></header>`;
  }
  function footer(pre) {
    return `<footer class="guide-footer"><div class="container"><p>© ${config.published.slice(0, 4)} Setveni koledar · Manj hitenja. Več zelenega.</p><nav aria-label="Spodnja navigacija"><a href="${pre}">Začetna stran</a><a href="${pre}balkon/">Začimbe</a><a href="${pre}godovi/">Godovi in imena</a><a href="${pre}ljudske-modrosti/">Ljudske modrosti</a><a href="${pre}o-projektu/">O projektu in virih</a><a href="${pre}sitemap.xml">Zemljevid strani</a></nav></div></footer>`;
  }
  function emit(
    route,
    { title, description, h1, intro, body, type = "WebPage", crumbs = [], scripts = [] },
  ) {
    const pre = prefix(route);
    const breadcrumbs = [["Domov", ""], ...crumbs];
    const html = `<!doctype html><html lang="sl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#093b32"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><link rel="icon" href="${pre}assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="${pre}assets/fonts/montserrat-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="${pre}style.css?v=${hash("style.css")}"><link rel="stylesheet" href="${pre}public.css?v=${hash("public.css")}">${metadata(route, title, description, type, breadcrumbs)}</head><body class="guide-page">${header(pre)}<section class="guide-hero"><div class="container"><nav class="breadcrumbs" aria-label="Pot do strani">${breadcrumbs.map(([name, r], i) => (i === breadcrumbs.length - 1 ? `<span aria-current="page">${escape(name)}</span>` : `<a href="${url(r)}">${escape(name)}</a><span aria-hidden="true">›</span>`)).join("")}</nav><span class="eyebrow">SETVENI KOLEDAR · VRT IN BALKON</span><h1>${escape(h1)}</h1><p class="guide-description">${escape(intro)}</p></div></section><main id="vsebina" class="container guide-content">${body}</main>${footer(pre)}</body></html>`;
    const destination = path.join(root, route, "index.html");
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const scriptsHtml = scripts.map(file => `<script defer src="${pre}${file}?v=${hash(file)}"></script>`).join("");
    fs.writeFileSync(destination, html.replace("</head>", scriptsHtml + "</head>") + "\n");
    written.push({ route, title, description });
  }
  function card(p, pre = "") {
    return `<a class="public-plant-card" href="${pre}rastline/${p.id}/"><img src="${pre}assets/plant-${p.id}.webp" width="640" height="480" alt="${escape(p.name)}" loading="lazy"><div><h3>${escape(p.name)}</h3><p>${escape(content[p.id].summary)}</p><span class="public-text-link">Gojenje in nega →</span></div></a>`;
  }
  for (const p of plants) {
    const c = content[p.id],
      g = guides[p.id],
      spec = engine.metadata[p.id];
    if (!c || !g || !spec) throw new Error("Missing guide " + p.id);
    const herb = p.kind === "herb";
    const h1 = herb
      ? `${p.name} v loncu: gojenje in nega`
      : `${p.name}: setev, sajenje in pobiranje`;
    const route = `rastline/${p.id}/`,
      pre = prefix(route);
    const dataFacts = [
      ["Lega", g.light],
      ["Razmik", g.spacing],
      [
        "Najmanjša posoda v načrtu",
        `${spec.minLiters} l · vsaj ${spec.minDepth} cm uporabne globine`,
      ],
      ["Setev na toplem", joinMonths(p.inside)],
      ["Setev ali sajenje na prosto", joinMonths(p.out)],
      ["Okvirno pobiranje", joinMonths(p.harvest)],
    ];
    const faq = c.faq
      .map(
        (f) =>
          `<details><summary>${escape(f.question)}</summary><p>${escape(f.answer)}</p></details>`,
      )
      .join("");
    const related = (herb ? herbs : vegetables)
      .filter((other) => other.id !== p.id)
      .slice(0, 4);
    const body = `<div class="guide-article-grid"><article class="guide-article"><figure class="guide-photo"><img src="${pre}assets/plant-${p.id}.webp" width="640" height="480" alt="${escape(p.name)} — ${escape(p.latin)}" fetchpriority="high"><figcaption>${escape(p.name)} · <em>${escape(p.latin)}</em></figcaption></figure><p>${escape(c.intro)}</p>${c.sections.map((section) => `<section><h2>${escape(section.title)}</h2>${section.paragraphs.map((par) => `<p>${escape(par)}</p>`).join("")}</section>`).join("")}${methodNote}<section class="guide-faq"><h2>Pogosta vprašanja</h2>${faq}</section><section class="guide-related"><h2>Raziščite še</h2><ul>${related.map((other) => `<li><a href="../${other.id}/">${escape(other.name)}: gojenje in nega</a></li>`).join("")}<li><a href="${pre}balkon/">Začimbe na balkonu</a></li><li><a href="${pre}meseci/">Setveni koledar po mesecih</a></li></ul></section></article><aside class="guide-aside"><h2>Na hitro: ${escape(p.name)}</h2>${facts(dataFacts)}<a class="button" href="${pre}${herb ? "?nacrt=zacimbe" : ""}#nacrt">${herb ? "Sestavi zeliščni balkon" : "Odpri osebni načrt"}</a><p>Minimalne posode so konservativen predlog za manjše oziroma kompaktne sorte, ne univerzalna mera za vsako rastlino. V večji posodi je nega pogosto lažja.</p><p><a class="public-text-link" href="${pre}o-projektu/">Kako uporabljati te podatke</a></p></aside></div>`;
    emit(route, {
      title: h1 + " | Setveni koledar",
      description: c.summary,
      h1,
      intro: c.intro,
      body,
      type: "Article",
      crumbs: [
        ["Rastlinski vodniki", "rastline/"],
        [p.name, route],
      ],
    });
  }
  emit("rastline/", {
    title: "Rastlinski vodniki: zelenjava in zelišča | Setveni koledar",
    description:
      "Vodniki za 12 vrst zelenjave in 6 zelišč: setev, primerni lonci, nega in okvirni čas pobiranja za vrt ali balkon.",
    h1: "Rastlinski vodniki za vrt in balkon",
    intro:
      "Od prve sadike do domačega pridelka. Izberite rastlino ter preverite osnovne pogoje, primeren čas in nego.",
    body: `<h2 class="public-directory-heading">Zelišča in začimbe za balkon</h2><div class="guide-card-grid">${herbs.map((p) => card(p, "../")).join("")}</div><h2 class="public-directory-heading">Zelenjava za domači vrt</h2><div class="guide-card-grid">${vegetables.map((p) => card(p, "../")).join("")}</div>`,
    type: "CollectionPage",
    crumbs: [["Rastlinski vodniki", "rastline/"]],
  });
  function monthLinks(pre = "") {
    return `<div class="public-month-links">${monthContent.map((m) => `<a href="${pre}meseci/${m.slug}/">${m.name}<span aria-hidden="true">→</span></a>`).join("")}</div>`;
  }
  for (const m of monthContent) {
    const route = `meseci/${m.slug}/`,
      pre = prefix(route);
    const taskGroups = [
      ["inside", "Setev na toplem"],
      ["out", "Setev ali sajenje na prosto"],
      ["harvest", "Okvirno pobiranje"],
    ];
    const sections = taskGroups
      .map(([field, label]) => {
        const relevant = plants.filter((p) => p[field].includes(m.month));
        return `<section><h2>${label} ${m.when}</h2>${relevant.length ? `<div class="guide-tasks">${relevant.map((p) => `<article class="guide-task"><img src="${pre}assets/plant-${p.id}.webp" width="65" height="65" alt="" loading="lazy"><div><h3><a href="${pre}rastline/${p.id}/">${p.name}</a></h3><p>${escape(field === "harvest" ? "Pobirajte dovolj razvite rastline. Čas je odvisen od sorte ter datuma setve ali sajenja." : guides[p.id].care)}</p></div></article>`).join("")}</div>` : "<p>V našem osnovnem izboru za ta mesec ni predvidenih opravil te vrste. To ne pomeni, da na vrtu ni drugih možnosti.</p>"}</section>`;
      })
      .join("");
    const sayings = proverbs.entries.filter(p => p.months.includes(m.month)).slice(0, 2);
    const tradition = `<section class="month-tradition"><h2>Ljudsko izročilo ${m.when}</h2>${sayings.map(p => `<blockquote><p>»${escape(p.text)}«</p></blockquote><p>${escape(p.practice)}</p>`).join("")}<p>Pregovori so kulturno izročilo, ne vremenska napoved. <a href="${pre}ljudske-modrosti/">Preberite razlage pregovorov</a> ali odprite <a href="${pre}godovi/?mesec=${m.month}">godove za ${escape(m.name.toLocaleLowerCase("sl"))}</a>.</p></section>`;
    const previous = monthContent[(m.month + 10) % 12],
      next = monthContent[m.month % 12];
    const body = `<div class="guide-article-grid"><article class="guide-article"><p>${escape(m.intro)}</p>${sections}<h2>Na kaj bodite pozorni ${m.when}</h2><ul>${m.tips.map((t) => `<li>${escape(t)}</li>`).join("")}</ul>${methodNote}${tradition}<nav class="guide-month-nav" aria-label="Sosednja meseca"><a href="../${previous.slug}/">← ${previous.name}</a><a href="../${next.slug}/">${next.name} →</a></nav></article><aside class="guide-aside"><h2>Koledar po vašem prostoru</h2><p>Vrt in balkon imata različne potrebe. Preverite sonce, globino posod in primerne rastline ter sestavite osebni načrt.</p><a class="button" href="${pre}?mesec=${m.month}#koledar">Odpri ${escape(m.name.toLocaleLowerCase("sl"))} v koledarju</a><p><a class="public-text-link" href="${pre}?nacrt=zacimbe#nacrt">Načrt za začimbe na balkonu</a></p><p>Koledar je splošen sezonski vodnik, ne dnevni lunin koledar ali vremenska napoved.</p></aside></div>`;
    emit(route, {
      title: `Setveni koledar za ${m.name.toLocaleLowerCase("sl")} | Vrt in balkon`,
      description: `Kaj sejati, saditi in pobirati ${m.when}? Mesečni pregled zelenjave in zelišč ter praktični nasveti za vrt in balkon v osrednji Sloveniji.`,
      h1: `Setveni koledar za ${m.name.toLocaleLowerCase("sl")}`,
      intro: `Kaj lahko sejete, sadite in pobirate ${m.when}? Izberite opravilo in preberite vodnik za posamezno rastlino.`,
      body,
      type: "Article",
      crumbs: [
        ["Koledar po mesecih", "meseci/"],
        [m.name, route],
      ],
    });
  }
  emit("meseci/", {
    title: "Setveni koledar po mesecih: kaj in kdaj sejati",
    description:
      "Pregleden setveni koledar za vseh 12 mesecev. Preverite setev, sajenje in pobiranje zelenjave ter zelišč na vrtu in balkonu.",
    h1: "Setveni koledar po mesecih",
    intro:
      "Vsak mesec ima svoj ritem. Začnite z okvirnim pregledom, nato termine prilagodite svoji legi, sorti in vremenu.",
    body: `<p class="public-guide-intro">Izberite mesec za pregled setve na toplem, setve in sajenja na prosto ter pobiranja. Koledar je namenjen predvsem osrednji Sloveniji; toplejše in višje lege zahtevajo prilagoditve.</p>${monthLinks("../")}${methodNote}<p><a class="button" href="../#nacrt">Sestavi osebni načrt</a></p>`,
    type: "CollectionPage",
    crumbs: [["Koledar po mesecih", "meseci/"]],
  });
  const balconyIntro =
    "Bazilika, peteršilj, drobnjak ali meta lahko uspevajo tudi brez vrta. Izberite primerne začimbe za sonce, ki ga dobite, in dovolj velike lončke.";
  emit("balkon/", {
    title: "Začimbe in zelišča na balkonu: izbor in nega",
    description:
      "Katere začimbe izbrati za balkon? Bazilika, peteršilj, drobnjak, meta, timijan in rožmarin: sonce, velikost loncev, zalivanje in osebni načrt.",
    h1: "Začimbe in zelišča na balkonu",
    intro: balconyIntro,
    body: `<h2>Katera zelišča izbrati za balkon</h2><p class="public-guide-intro">Za svoj prvi zeliščni balkon izberite nekaj rastlin, ki jih uporabljate pri kuhanju. Skupno jim je, da potrebujejo ustrezno posodo in odtekanje vode; potrebe po soncu in vlagi pa se razlikujejo.</p><div class="guide-card-grid">${herbs.map((p) => card(p, "../")).join("")}</div><div class="guide-article" style="max-width:850px"><h2>Kako načrtovati zeliščni balkon</h2><ol class="public-steps"><li><strong>Preštejte ure neposrednega sonca.</strong><p>Timijan in rožmarin postavite na sonce. Peteršilj, drobnjak in meta bolje prenašajo svetlo polsenco. Bazilika potrebuje toploto, pri polsenci pa preverite vsaj štiri ure neposrednega sonca.</p></li><li><strong>Preverite prostornino in globino loncev.</strong><p>Manjše sorte drobnjaka in timijana lahko začnete v približno 3-litrskem loncu. Za baziliko in peteršilj načrt uporabite s 5 l, za meto vsaj 8 l in za rožmarin večjo posodo. To so izhodiščne mere; večje rastline in sorte potrebujejo več prostora.</p></li><li><strong>Ne združujte vseh potreb v isti lonec.</strong><p>Meta naj ima svojo posodo. Zelišča, ki imajo rada bolj suho zemljo, naj ne delijo režima zalivanja z rastlinami, ki potrebujejo več vlage. Naš načrt za začetek nameni vsaki vrsti svojo posodo.</p></li><li><strong>Pobirajte sproti in opazujte rast.</strong><p>Liste in mlade vršičke pobirajte le z dovolj vzraslih rastlin. Pustite dovolj zelenja za nadaljnjo rast. Zalivanje prilagodite vročini, vetru, dežju in stanju zemlje.</p></li></ol><p><a class="button" href="../?nacrt=zacimbe#nacrt">Izberi začimbe za svoj balkon →</a></p>${methodNote}<h2>Želite tudi zelenjavo?</h2><p>Solata, redkvice ali kompaktne sorte paradižnika so dodatna možnost, kadar imate ustrezne posode in dovolj svetlobe. V <a href="../#nacrt">osebnem načrtovalniku</a> je zelenjava ločena izbira; zelišča imajo pri balkonskem predlogu prednost.</p></div>`,
    crumbs: [["Začimbe na balkonu", "balkon/"]],
  });
  emit("o-projektu/", {
    title: "O projektu, metodologiji in virih | Setveni koledar",
    description:
      "Kako uporabljati setveni koledar in osebni načrtovalnik. Okvirni termini za osrednjo Slovenijo, omejitve priporočil, lokalno shranjevanje in viri.",
    h1: "O projektu in uporabi koledarja",
    intro:
      "Setveni koledar pomaga izbrati primerne rastline in opravila za domači vrt ali balkon. Za dober načrt so pomembni tudi opazovanje, sorta in lokalne razmere.",
    body: `<article class="guide-article" style="max-width:850px"><h2>Kaj prikazujemo</h2><p>Javni vodniki pokrivajo 12 vrst zelenjave in 6 zelišč. Koledar prikazuje okvirne mesece setve, sajenja in pobiranja, osebni načrt pa preveri svetlobo, površino gredic ter število, prostornino in globino posod.</p><h2>Kako razumeti priporočila</h2><p>Izhodišče je domača pridelava v osrednji Sloveniji. Podnebje, nadmorska višina, mikrolega in sorta lahko termine znatno spremenijo. Upoštevajte navodila na semenski vrečki oziroma pri dobavitelju sadik ter dejansko temperaturo zemlje in nevarnost pozebe.</p><p>Minimalne velikosti loncev so orientacijske za manjše in kompaktne rastline. Shema ni izris v merilu. Osnovni opomnik za lansko skupino rastlin ne nadomesti večletnega kolobarja po botaničnih družinah. Opravila so sezonske možnosti, ne osebna napoved datuma pobiranja.</p><h2>Vsebina in pregled</h2><p>Besedila so izvirna pojasnila projekta, pripravljena iz prikazanega podatkovnega modela. Niso predstavljena kot strokovno recenzirani agronomski nasveti. Za zahtevnejša vprašanja ali težave z rastlinami se obrnite na ustreznega vrtnarskega strokovnjaka.</p><h2>Koristni zunanji viri</h2><ul class="guide-plain-list"><li><a href="https://www.semenarna.si/">Semenarna Ljubljana</a> — navodila za izbrane sorte in semena.</li><li><a href="https://www.klubgaia.com/">Klub Gaia</a> — vrtnarske vsebine za dodatno branje.</li><li><a href="https://meteo.arso.gov.si/">ARSO: vreme</a> — aktualne vremenske razmere in opozorila.</li></ul><p>Ti viri so priporočilo za dodatno preverjanje; ne pomenijo, da so njihovi avtorji pregledali ali potrdili naš načrt.</p><h2>Godovi in ljudsko izročilo</h2><p><a href="../godovi/">Koledar godov</a> vsebuje izbor stalnih datumov iz odprte zbirke romcal (MIT), s povezavo na vir pri vsakem zapisu. Slovenski nazivi in različice imen so uredniški izbor; zbirka ni popoln slovenski bogoslužni koledar.</p><p><a href="../ljudske-modrosti/">Ljudske modrosti</a> prinašajo razširjene slovenske pregovore. Poznajo krajevne različice in niso vremenska napoved. Njihove vrtnarske razlage so besedilo projekta.</p><h2>Shranjevanje vašega načrta</h2><p>Izbor rastlin, osebni načrt in oznake opravil se shranijo samo v trenutnem brskalniku. Zanje ni prijave ali oddaje osebnih podatkov. Ob brisanju podatkov brskalnika se lahko izbriše tudi načrt. Gostovanje strani zagotavlja GitHub Pages, ki lahko obdeluje običajne tehnične podatke spletnih zahtevkov.</p><h2>Popravki</h2><p>Projekt in predloge popravkov najdete v <a href="https://github.com/anjaprogramador/setveni-koledar">javnem repozitoriju Setveni koledar</a>. Pri prijavi napake ne objavljajte osebnih ali občutljivih podatkov.</p></article>`,
    crumbs: [["O projektu in virih", "o-projektu/"]],
  });
  let index = fs.readFileSync(path.join(root, "index.html"), "utf8");
  function block(label, value) {
    const start = `<!-- SEO:${label}:START -->`,
      end = `<!-- SEO:${label}:END -->`;
    const a = index.indexOf(start),
      b = index.indexOf(end);
    if (a < 0 || b < a) throw new Error("Missing index block " + label);
    index = index.slice(0, a) + start + "\n" + value + "\n" + index.slice(b);
  }
  block(
    "HEAD",
    metadata(
      "",
      "Setveni koledar za vrt in balkon | Zelišča in zelenjava",
      config.description,
      "CollectionPage",
    ) +
      `<link rel="preload" href="assets/fonts/montserrat-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="public.css?v=${hash("public.css")}">`,
  );
  block(
    "HERBS",
    `<section class="herb-discovery" id="zacimbe" aria-labelledby="herb-discovery-title"><div class="herb-discovery-heading"><h3 id="herb-discovery-title">Začimbe in zelišča za balkon</h3><p>Naj bo balkon najprej dišeč. Izberite zelišča za kuhinjo, čaj in vsakodnevno nabiranje.</p></div><div class="herb-discovery-grid">${herbs.map((p) => `<a href="rastline/${p.id}/"><img src="assets/plant-${p.id}.webp" width="160" height="110" alt="${p.name} — zelišče za balkon" loading="lazy"><strong>${p.name}</strong></a>`).join("")}</div><div class="herb-discovery-actions"><a class="button" href="?nacrt=zacimbe#nacrt">Izberi začimbe za balkon →</a><a class="public-text-link" href="balkon/">Vodnik: začimbe v loncih</a></div></section>`,
  );
  block(
    "MONTHS",
    `<section class="container month-overview" aria-labelledby="months-overview-title"><h2 id="months-overview-title">Setveni koledar po mesecih</h2><p>Kaj sejati, saditi in pobirati v posameznem mesecu? Odprite javni mesečni vodnik ali uporabite osebni načrt za svoje rastline. Termini so okvirni za osrednjo Slovenijo.</p>${monthLinks()}</section>`,
  );
  block(
    "PLANTS",
    plants
      .map(
        (p) =>
          `<a href="rastline/${p.id}/" data-detail="${p.id}">${p.name}<span aria-hidden="true">›</span></a>`,
      )
      .join(""),
  );
  require("./generate-tradition-pages.cjs")({emit, block, escape, root, monthContent});
  fs.writeFileSync(path.join(root, "index.html"), index);
  const entries = [
    {
      route: "",
      title: "Setveni koledar za vrt in balkon | Zelišča in zelenjava",
      description: config.description,
    },
    ...written,
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map((item) => `<url><loc>${escape(url(item.route))}</loc></url>`).join("")}</urlset>\n`;
  fs.writeFileSync(path.join(root, "sitemap.xml"), xml);
  fs.writeFileSync(
    path.join(root, "seo-manifest.json"),
    JSON.stringify(entries, null, 2) + "\n",
  );
  console.log(
    `Generated ${written.length} static guides and ${entries.length} sitemap URLs.`,
  );
})();

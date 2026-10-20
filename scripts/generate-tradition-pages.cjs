"use strict";

module.exports = function ({ emit, block, escape: e, root, monthContent }) {
  const fs = require("node:fs");
  const path = require("node:path");
  const sayings = JSON.parse(fs.readFileSync(path.join(root, "content/proverbs.json"), "utf8"));
  const calendar = JSON.parse(fs.readFileSync(path.join(root, "content/namedays.json"), "utf8"));
  const entries = calendar.entries.slice().sort((a, b) => a.month - b.month || a.day - b.day || a.saint.localeCompare(b.saint, "sl"));
  for (const entry of entries) {
    const date = new Date(Date.UTC(2000, entry.month - 1, entry.day));
    const source = new URL(entry.source);
    const trustedSource = source.protocol === "https:" &&
      (source.hostname === "revija.ognjisce.si" ||
       (source.hostname === "github.com" && source.pathname.startsWith("/romcal/romcal/blob/")));
    if (date.getUTCMonth() !== entry.month - 1 || date.getUTCDate() !== entry.day || !entry.names.length || !entry.saint || !trustedSource) throw new Error("Invalid nameday entry: " + JSON.stringify(entry));
  }
  const dates = new Set(entries.map(entry => `${entry.month}-${entry.day}`));
  for (let month = 1; month <= 12; month++) {
    const length = new Date(Date.UTC(2000, month, 0)).getUTCDate();
    for (let day = 1; day <= length; day++)
      if (!dates.has(`${month}-${day}`)) throw new Error(`Missing saint for ${day}.${month}.`);
  }
  const groups = monthContent.map(m => {
    const records = entries.filter(entry => entry.month === m.month);
    if (!records.length) return "";
    return `<section class="nameday-month" data-nameday-group data-month="${m.month}" id="${m.slug}"><h2>${e(m.name)}</h2><div class="nameday-grid">${records.map(entry => `<article class="nameday-card" data-nameday-entry data-month="${entry.month}" data-day="${entry.day}" data-search="${e(entry.names.join(" ") + " " + entry.saint)}"><div class="nameday-date"><strong>${entry.day}.</strong><span>${entry.month}.</span></div><div><h3>${e(entry.names.join(", "))}</h3><p>${e(entry.saint)}</p><a class="nameday-source" href="${e(entry.source)}">Podlaga za datum</a></div></article>`).join("")}</div></section>`;
  }).join("");
  const calendarIntro = "Svetniki za vsak dan v letu. Izberite mesec ali poiščite ime ter preverite datum godu. Vključen je tudi 29. februar za prestopna leta.";
  emit("godovi/", {
    title: "Godovi slovenskih imen: koledar svetnikov po mesecih",
    description: "Godovi slovenskih imen za vsak dan v letu: poiščite ime, izberite mesec in preverite svetnika ter datum godu. Vključeni so viri in 29. februar.",
    h1: "Godovi slovenskih imen",
    intro: calendarIntro,
    crumbs: [["Godovi in imena", "godovi/"]],
    scripts: ["tradition.js"],
    body: `<p class="calendar-scope">Za vsak dan je naveden vsaj en svetnik. Datumi so stalni; praznovanja se lahko v posameznem letu premaknejo. <a href="#podatki">Obseg in viri</a>.</p><section data-nameday-calendar aria-label="Koledar godov"><form class="nameday-controls" data-nameday-controls hidden><div><label for="nameday-month">Mesec</label><select id="nameday-month" data-nameday-month><option value="0">Vsi meseci</option>${monthContent.map(m => `<option value="${m.month}">${e(m.name)}</option>`).join("")}</select></div><div><label for="nameday-search">Poiščite ime ali svetnika</label><input id="nameday-search" data-nameday-search type="search" placeholder="Na primer: Ana, Jože, Frančišek" autocomplete="off"></div></form><p class="nameday-status" role="status" data-nameday-status></p>${groups}<p class="nameday-empty" data-nameday-empty hidden>Za to iskanje v našem izboru ni vnosa. Poskusite osnovno obliko imena ali izberite vse mesece. To ne pomeni, da ime nima godu.</p></section><div class="guide-article tradition-explanation"><h2>Kaj je god?</h2><p>God je dan, povezan s svetnikom oziroma svetniško zavetnico, po kateri ima človek ime. Rojstni dan je datum rojstva; god ima drug pomen in lahko pade na drug datum. Pri imenih, ki jih nosi več svetnikov, ni vedno enega samega datuma.</p><h2>Godovi in ljudsko izročilo</h2><p>Imena svetnikov so v tradicionalnem koledarju pogosto označevala čas za delo in opazovanje vremena. Datumi iz starih pregovorov se ne ujemajo vedno s sedanjim koledarjem: pregovor o Matiji na primer ohranja februarski datum, sodobni splošni rimski koledar pa ga ima maja.</p><p><a class="button" href="../ljudske-modrosti/">Raziščite ljudske pregovore →</a></p><h2 id="podatki">Podatki in preverjanje</h2><p>Koledar pokriva vseh 366 datumov: 365 dni navadnega leta in 29. februar za prestopna leta. Dnevne zapise dopolnjujemo iz slovenskih seznamov Revije Ognjišče; ohranjeni zapisi imajo datumsko podlago tudi v odprti zbirki romcal. Ni popoln uradni slovenski bogoslužni koledar. Krajevni zavetniki, redovni koledarji in premiki praznovanj v posameznem letu se lahko razlikujejo.</p><p>Pri imenu z več svetniškimi zavetniki je mogočih več godov. Na isti dan lahko goduje več svetnikov, zato prikazani izbor ni seznam vseh svetnikov tega dne. Različice imen so pomoč pri iskanju, izbira osebnega zavetnika pa je lahko drugačna.</p><p>Viri datumov in imen: <a href="https://revija.ognjisce.si/">Revija Ognjišče</a> ter <a href="https://github.com/romcal/romcal">romcal</a>. Povezava pri vsakem zapisu kaže uporabljeni vir. Iz Ognjišča uporabljamo datumska dejstva in imena, brez prepisovanja življenjepisov. Romcal je odprti projekt z licenco MIT; njegovi slovenski nazivi in izbor različic imen so naša obdelava. <a href="../content/romcal-LICENSE.txt">Licenca in navedba izvora</a>.</p><p>Za celoten koledar in praznovanje v posameznem letu preverite <a href="https://hozana.si/">Hozano</a> oziroma svoj župnijski koledar. Navedena zunanja vira nista pregledala ali potrdila naše strani.</p></div>`,
  });
  emit("ljudske-modrosti/", {
    title: "Ljudske modrosti in vremenski pregovori za vrt",
    description: "Slovenski ljudski pregovori o vremenu, letnih časih in delu na vrtu. Razlage izročila ter praktični opomniki za vrt in balkon skozi leto.",
    h1: "Ljudske modrosti za vrt in vsakdan",
    intro: "Od svečnice do martinovega. Pregovori ohranjajo opazovanja, humor in ritem nekdanjega življenja z naravo.",
    crumbs: [["Ljudske modrosti", "ljudske-modrosti/"]],
    body: `<div class="tradition-note"><strong>Ljudsko izročilo, praktičen premislek</strong><p>${e(sayings.note)}</p></div><div class="proverb-grid">${sayings.entries.map(p => `<article class="proverb-card" id="${e(p.id)}"><span class="eyebrow">${e(p.day ? p.day + ". " + p.months[0] + ". · LJUDSKI KOLEDAR" : "MODROST ZA VSAK LETNI ČAS")}</span><blockquote><p>»${e(p.text)}«</p></blockquote><h2>Kaj ohranja pregovor</h2><p>${e(p.context)}</p><h2>Za vaš vrt in balkon</h2><p>${e(p.practice)}</p></article>`).join("")}</div><div class="guide-article tradition-explanation"><h2>Kako uporabljati stare modrosti danes</h2><p>Pregovori so kulturni spomin. Nekateri opisujejo pogosto izkušnjo, drugi si celo nasprotujejo. Ne morejo nadomestiti vremenske napovedi, merjenja temperature zemlje ali navodil za sorto. Uporabite jih kot povabilo k opazovanju narave.</p><p>Izbor uporablja razširjene zapise slovenskega ustnega izročila. Ne predstavlja prepisa ene zgodovinske zbirke ali popolnega popisa krajevnih različic. Razlage in vrtnarski opomniki so samostojno besedilo projekta.</p><p><a class="button" href="../godovi/">Odpri koledar godov →</a></p><p><a class="public-text-link" href="../meseci/">Praktični setveni koledar po mesecih</a></p></div>`,
  });
  block("TRADITION", `<section class="container tradition-home" id="izrocilo" aria-labelledby="tradition-title"><div class="section-heading"><span class="eyebrow">V RITMU STARIH MODROSTI</span><h2 id="tradition-title">Iz roda v rod. Iz leta v leto.</h2><p>Dodajte načrtovanju še nekaj domačega izročila: pregovore o naravi in godove slovenskih imen.</p></div><div class="tradition-home-grid"><a class="tradition-feature" href="ljudske-modrosti/"><span class="tradition-symbol" aria-hidden="true">☀</span><div><h3>Ljudske modrosti in pregovori</h3><p>»Kar seješ, to žanješ.« Stari reki s pojasnili in današnjimi opomniki za vaš vrt.</p><span class="public-text-link">Raziščite pregovore →</span></div></a><a class="tradition-feature" href="godovi/"><span class="tradition-symbol" aria-hidden="true">✦</span><div><h3>Kdo praznuje god?</h3><p>Svetnik za vsak dan v letu. Poiščite svoje ime ali izberite mesec in preverite god.</p><span class="public-text-link">Odpri koledar godov →</span></div></a></div></section>`);
};

const months = [
  "Januar",
  "Februar",
  "Marec",
  "April",
  "Maj",
  "Junij",
  "Julij",
  "Avgust",
  "September",
  "Oktober",
  "November",
  "December",
];
const plants = [
  {
    id: "solata",
    name: "Solata",
    latin: "Lactuca sativa",
    icon: "🥬",
    color: "#eaf0df",
    out: [3, 4, 5, 6, 7, 8, 9],
    inside: [2, 3, 4],
    harvest: [5, 6, 7, 8, 9, 10],
    depth: "0,5–1 cm",
    days: "6–10 tednov",
  },
  {
    id: "korenje",
    name: "Korenje",
    latin: "Daucus carota",
    icon: "🥕",
    color: "#f5eadb",
    out: [3, 4, 5, 6, 7],
    inside: [],
    harvest: [6, 7, 8, 9, 10, 11],
    depth: "1–2 cm",
    days: "12–16 tednov",
  },
  {
    id: "redkvica",
    name: "Redkvica",
    latin: "Raphanus sativus",
    icon: "🌱",
    color: "#f0e6e1",
    out: [3, 4, 5, 8, 9, 10],
    inside: [],
    harvest: [4, 5, 6, 9, 10, 11],
    depth: "1–2 cm",
    days: "4–6 tednov",
  },
  {
    id: "spinaca",
    name: "Špinača",
    latin: "Spinacia oleracea",
    icon: "🥬",
    color: "#e4eada",
    out: [3, 4, 8, 9, 10],
    inside: [],
    harvest: [4, 5, 6, 9, 10, 11],
    depth: "2–3 cm",
    days: "6–8 tednov",
  },
  {
    id: "paradiznik",
    name: "Paradižnik",
    latin: "Solanum lycopersicum",
    icon: "🍅",
    color: "#f3e6df",
    out: [5, 6],
    inside: [2, 3, 4],
    harvest: [7, 8, 9],
    depth: "0,5–1 cm",
    days: "16–20 tednov",
  },
  {
    id: "paprika",
    name: "Paprika",
    latin: "Capsicum annuum",
    icon: "🫑",
    color: "#e9eddb",
    out: [5, 6],
    inside: [1, 2, 3],
    harvest: [7, 8, 9, 10],
    depth: "0,5–1 cm",
    days: "18–22 tednov",
  },
  {
    id: "grah",
    name: "Grah",
    latin: "Pisum sativum",
    icon: "🫛",
    color: "#e7ecda",
    out: [2, 3, 4],
    inside: [],
    harvest: [5, 6, 7],
    depth: "3–5 cm",
    days: "10–14 tednov",
  },
  {
    id: "cesen",
    name: "Česen",
    latin: "Allium sativum",
    icon: "🧄",
    color: "#efeadd",
    out: [2, 3, 10, 11],
    inside: [],
    harvest: [6, 7],
    depth: "5–7 cm",
    days: "8–9 mesecev",
  },
  {
    id: "motovilec",
    name: "Motovilec",
    latin: "Valerianella locusta",
    icon: "🌿",
    color: "#e6eddc",
    out: [8, 9, 10],
    inside: [],
    harvest: [1, 2, 3, 10, 11, 12],
    depth: "0,5–1 cm",
    days: "8–12 tednov",
  },
  {
    id: "fizol",
    name: "Fižol",
    latin: "Phaseolus vulgaris",
    icon: "🫘",
    color: "#efe5dc",
    out: [5, 6, 7],
    inside: [],
    harvest: [7, 8, 9],
    depth: "3–5 cm",
    days: "8–12 tednov",
  },
  {
    id: "bucka",
    name: "Bučka",
    latin: "Cucurbita pepo",
    icon: "🥒",
    color: "#e6ebdb",
    out: [5, 6],
    inside: [4],
    harvest: [6, 7, 8, 9],
    depth: "2–3 cm",
    days: "8–10 tednov",
  },
  {
    id: "por",
    name: "Por",
    latin: "Allium porrum",
    icon: "🌿",
    color: "#e8ecdf",
    out: [4, 5, 6],
    inside: [1, 2, 3],
    harvest: [9, 10, 11, 12],
    depth: "1 cm",
    days: "20–24 tednov",
  },
];

("use strict");
const guides = {
  solata: {
    light: "Sonce ali polsenca",
    spacing: "25–30 cm",
    care: "Sejte v manjših presledkih, da boste pridelek pobirali postopoma. V vročini izberite delno senco in skrbite za enakomerno vlažno zemljo.",
  },
  korenje: {
    light: "Sončna lega",
    spacing: "3–5 cm v vrsti",
    care: "Sejte neposredno v rahlo zemljo brez večjih kamnov. Do vznika ohranjajte površino vlažno, pregoste rastlinice pa previdno razredčite.",
  },
  redkvica: {
    light: "Sonce ali polsenca",
    spacing: "3–5 cm v vrsti",
    care: "Najlepše raste v hladnejšem delu leta. Sejte redko in redno zalivajte; korene pobirajte mlade, preden postanejo oleseneli.",
  },
  spinaca: {
    light: "Sonce ali polsenca",
    spacing: "10–15 cm v vrsti",
    care: "Ustreza ji hladnejše vreme in rodovitna, vlažna tla. Poleti hitro uide v cvet. Zunanje liste lahko pobirate postopoma.",
  },
  paradiznik: {
    light: "Sončna, zavetna lega",
    spacing: "50–70 cm",
    care: "Sadike presadite na prosto po nevarnosti pozebe. Visokim sortam pripravite oporo. Zalivajte pri tleh in omogočite zračenje med rastlinami.",
  },
  paprika: {
    light: "Topla in sončna lega",
    spacing: "40–50 cm",
    care: "Za kalitev potrebuje toploto, sadike pa veliko svetlobe. Na prosto jo prestavite šele ob dovolj toplih nočeh. Prst naj ostaja enakomerno vlažna.",
  },
  grah: {
    light: "Sončna lega",
    spacing: "5–8 cm v vrsti",
    care: "Sejte zgodaj, ko je zemlja primerna za obdelavo in ni razmočena. Višjim sortam postavite mrežo ali veje. Stroke pobirajte, ko so zrna še nežna.",
  },
  cesen: {
    light: "Sončna lega",
    spacing: "10–15 cm v vrsti",
    care: "Uporabite zdrave sadilne stroke, primerne za jesensko ali spomladansko sajenje. Sadite s konico navzgor v odcedno zemljo. Izogibajte se zastajanju vode.",
  },
  motovilec: {
    light: "Sonce ali polsenca",
    spacing: "5–10 cm v vrsti",
    care: "Sejte ga plitvo na očiščeno gredo pozno poleti ali jeseni. Do vznika skrbite za vlago. Rozete pobirajte v obdobjih, ko listi niso zamrznjeni.",
  },
  fizol: {
    light: "Topla in sončna lega",
    spacing: "Glede na sorto",
    care: "Sejte v dovolj ogreto zemljo po nevarnosti pozebe. Visoki fižol potrebuje oporo. Med cvetenjem in razvojem strokov pazite, da se zemlja ne izsuši.",
  },
  bucka: {
    light: "Sončna lega",
    spacing: "80–100 cm",
    care: "Posadite jo v rodovitno zemljo, ko mine nevarnost pozebe. Pustite dovolj prostora. Mlade plodove redno pobirajte in zalivajte neposredno ob koreninah.",
  },
  por: {
    light: "Sončna lega",
    spacing: "10–15 cm v vrsti",
    care: "Sadike prestavite na pripravljeno gredo in jih redno zalivajte. Sorte se razlikujejo po odpornosti na mraz in času pobiranja; preverite navodila izbrane sorte.",
  },
};
const advice = {
  soil: {
    title: "Najlepši vrt se začne z dobro zemljo.",
    label: "DOBRI TEMELJI",
    image: "garden-hero",
    paragraphs: [
      "Zemljo pred obdelavo primite v pest. Če se lepi in oblikuje težko, mokro kepo, počakajte na bolj suhe razmere. Obdelava razmočene zemlje poslabša njeno strukturo.",
      "Gredo zrahljajte in odstranite večje kamne ter trajne plevele. Zrel kompost dodajte glede na potrebe rastlin in stanje tal. Korenovkam posebej prija rahla, ne preveč zbita zemlja.",
      "Ne skrbite, če ne gre vse po načrtu. Opazujte, kaj na vašem vrtu dobro uspeva, in si izkušnje zapišite za naslednjo sezono.",
    ],
  },
  garlic: {
    title: "Česen: posadite ga jeseni, uživajte poleti.",
    label: "JESENSKO SAJENJE",
    image: "plant-cesen",
    paragraphs: [
      "Za jesensko sajenje izberite ustrezno sorto in zdrave sadilne stroke. Glavico razdelite tik pred sajenjem, strokov pa ne lupite.",
      "Sadite s konico navzgor v odcedno prst. Med stroki pustite približno 10–15 cm, med vrstami pa dovolj prostora za nego. Globino prilagodite zemlji in navodilom dobavitelja.",
      "Gredo ohranjajte brez plevela. Ko začne listje poleti rumeneti in se sušiti, preverite zrelost glavic. Po pobiranju jih sušite na zračnem, pred dežjem zaščitenem mestu.",
    ],
  },
  water: {
    title: "Manj pogosto, a temeljito. Tako zalivamo.",
    label: "NEGA VRTA",
    image: "plant-solata",
    paragraphs: [
      "Potrebo po vodi preverite tudi nekaj centimetrov pod površino. Suha skorjica še ne pomeni vedno, da so tla suha tudi pri koreninah.",
      "Zalivajte počasi, čim bliže tlom, najbolje zgodaj zjutraj. Pri mladih setvah ohranjajte zgornjo plast nežno vlažno; pri večjih rastlinah naj voda doseže globlje korenine.",
      "Zastirka lahko pomaga zmanjšati izhlapevanje. Pogostost zalivanja prilagodite dežju, vrsti tal, temperaturi in rastlinam. Izogibajte se stalno razmočeni zemlji.",
    ],
  },
  sowing: {
    title: "Majhna semena potrebujejo malo potrpljenja.",
    label: "PRVA SETEV",
    image: "plant-korenje",
    paragraphs: [
      "Pred setvijo preberite navodila na vrečki. Globina, razmik in potrebna temperatura se med rastlinami in sortami razlikujejo.",
      "Drobna semena posejte v fino pripravljeno površino in jih prekrijte le toliko, kot priporoča dobavitelj. Zalivajte nežno, da jih ne izperete iz vrste.",
      "Označite posevek z imenom in datumom setve. Nekatere rastline, na primer korenje, vznikajo počasneje. Do vznika je enakomerna vlaga posebej pomembna.",
    ],
  },
};
const $ = (selector) => document.querySelector(selector);
const icon = (name) =>
  '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
const currentMonth = Number(
  new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Ljubljana",
    month: "numeric",
  }).format(new Date()),
);
let month = currentMonth,
  filter = "all",
  query = "",
  saved = [],
  toastTimer,
  lastDialogTrigger;
try {
  const value = JSON.parse(localStorage.getItem("setveni-vrt") || "[]");
  if (Array.isArray(value))
    saved = [...new Set(value.filter((id) => plants.some((p) => p.id === id)))];
} catch {
  /* The calendar also works without browser storage. */
}
const imagePath = (p) => "assets/plant-" + p.id + ".webp";
function notify(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 2600);
}
function updateSavedButtons() {
  document.querySelectorAll("[data-save]").forEach((button) => {
    const p = plants.find((p) => p.id === button.dataset.save);
    if (!p) return;
    const isSaved = saved.includes(p.id);
    button.setAttribute("aria-pressed", String(isSaved));
    button.setAttribute(
      "aria-label",
      (isSaved ? "Odstrani iz vrta: " : "Dodaj v vrt: ") + p.name,
    );
    if (button.classList.contains("dialog-save"))
      button.innerHTML =
        icon(isSaved ? "check" : "heart") +
        (isSaved ? "Odstrani iz mojega vrta" : "Dodaj v moj vrt");
  });
}
function toggleSaved(id) {
  if (!plants.some((p) => p.id === id)) return;
  saved = saved.includes(id)
    ? saved.filter((item) => item !== id)
    : [...saved, id];
  let persisted = true;
  try {
    localStorage.setItem("setveni-vrt", JSON.stringify(saved));
  } catch {
    persisted = false;
  }
  updateSavedButtons();
  renderGarden();
  notify(
    (saved.includes(id)
      ? "Rastlina je dodana v vaš vrt."
      : "Rastlina je odstranjena iz vrta.") +
      (persisted ? "" : " Brskalnik ne dovoljuje trajnega shranjevanja."),
  );
}
function renderGarden() {
  $("#count").textContent = saved.length;
  if (!saved.length) {
    $("#saved").innerHTML =
      '<div class="garden-empty">' +
      icon("heart") +
      '<div><strong>Tu se začne vaš mali vrt.</strong><p>Poiščite rastlino in se dotaknite srčka na njeni kartici.</p></div><a class="button" href="#koledar">Izberite rastline ' +
      icon("chevron") +
      "</a></div>";
    return;
  }
  $("#saved").innerHTML =
    '<div class="saved-list">' +
    saved
      .map((id) => {
        const p = plants.find((p) => p.id === id);
        return (
          '<div class="saved-item"><img src="' +
          imagePath(p) +
          '" alt="" width="53" height="53" loading="lazy"><button data-detail="' +
          p.id +
          '">' +
          p.name +
          '</button><button class="remove-plant" data-remove="' +
          p.id +
          '" aria-label="Odstrani iz vrta: ' +
          p.name +
          '">' +
          icon("close") +
          "</button></div>"
        );
      })
      .join("") +
    "</div>";
}
function tags(p) {
  let result = "";
  if (p.out.includes(month))
    result +=
      '<span class="tag">' +
      (["cesen", "paradiznik", "paprika", "bucka", "por"].includes(p.id)
        ? "Sajenje na prosto"
        : "Setev na prosto") +
      "</span>";
  if (p.inside.includes(month))
    result += '<span class="tag">Setev na toplem</span>';
  if (p.harvest.includes(month))
    result += '<span class="tag harvest">Pobiranje</span>';
  return result;
}
function renderCalendar() {
  document.querySelectorAll("[data-month]").forEach((button) => {
    const selected = Number(button.dataset.month) === month;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  $("#month-title").textContent = months[month - 1] + " na vrtu";
  $("#month-description").textContent =
    month < 3 || month === 12
      ? "Čas za načrtovanje, pripravo in prve setve na toplem."
      : month < 6
        ? "Zemlja se prebuja. Čas je za nove začetke in prve pridelke."
        : month < 9
          ? "Vrt je poln življenja. Poskrbite za vodo in sproti pobirajte pridelek."
          : "Jesenske setve, polne košare in priprava vrta na počitek.";
  const season =
    month < 3 || month === 12
      ? "Zimski čas"
      : month < 6
        ? "Pomladni čas"
        : month < 9
          ? "Poletni čas"
          : "Jesenski čas";
  $("#season").innerHTML = icon("sun") + season;
  const list = plants.filter((p) => {
    const activity =
      filter === "all"
        ? [...p.out, ...p.inside, ...p.harvest]
        : p[filter === "in" ? "inside" : filter === "out" ? "out" : "harvest"];
    return (
      activity.includes(month) && p.name.toLocaleLowerCase("sl").includes(query)
    );
  });
  const countLabel =
    list.length === 1
      ? "rastlina"
      : list.length === 2
        ? "rastlini"
        : list.length === 3 || list.length === 4
          ? "rastline"
          : "rastlin";
  $("#results-count").textContent =
    list.length + " " + countLabel + " za izbrani mesec";
  $("#cards").innerHTML =
    list
      .map(
        (p) =>
          '<article class="card"><div class="card-image"><img src="' +
          imagePath(p) +
          '" alt="' +
          p.name +
          '" width="640" height="420" loading="lazy"><button class="save-plant" data-save="' +
          p.id +
          '">' +
          icon("heart") +
          '</button></div><div class="card-body"><h4>' +
          p.name +
          '</h4><span class="latin">' +
          p.latin +
          '</span><div class="tags">' +
          tags(p) +
          '</div><div class="card-facts"><span>Globina: ' +
          p.depth +
          "</span><span>Do pridelka: " +
          p.days +
          '</span></div><button class="card-details" data-detail="' +
          p.id +
          '">O rastlini<span class="sr-only"> ' +
          p.name +
          "</span>" +
          icon("arrow") +
          "</button></div></article>",
      )
      .join("") ||
    '<div class="empty-state">' +
      icon("sprout") +
      '<h4>Vrt ima tudi čas za počitek.</h4><p>Za ta izbor ni rastlin. Izberite drug mesec ali ponastavite filtre.</p><button id="reset-filters" class="button">Prikaži vse rastline tega meseca ' +
      icon("arrow") +
      "</button></div>";
  updateSavedButtons();
}
function selectMonth(value) {
  if (value < 1 || value > 12) return;
  month = value;
  renderCalendar();
}
function showDialog(content, trigger) {
  lastDialogTrigger = trigger;
  $("#dialog-content").innerHTML = content;
  $("#detail-dialog").showModal();
  $("#detail-dialog").scrollTop = 0;
}
function openPlant(id, trigger) {
  const p = plants.find((p) => p.id === id);
  if (!p) return;
  const g = guides[id];
  const monthList = (values) =>
    values.map((m) => months[m - 1].toLocaleLowerCase("sl")).join(", ") ||
    "Ni predvideno";
  showDialog(
    '<img class="dialog-image" src="' +
      imagePath(p) +
      '" alt="' +
      p.name +
      '" width="640" height="250"><div class="dialog-body"><span class="eyebrow">VODNIK PO RASTLINAH</span><h2 id="dialog-title">' +
      p.name +
      '</h2><span class="latin">' +
      p.latin +
      "</span><p>" +
      g.care +
      '</p><dl class="detail-grid"><div><dt>Lega</dt><dd>' +
      g.light +
      "</dd></div><div><dt>Razmik</dt><dd>" +
      g.spacing +
      "</dd></div><div><dt>Globina setve ali sajenja</dt><dd>" +
      p.depth +
      "</dd></div><div><dt>Okviren čas do pridelka</dt><dd>" +
      p.days +
      '</dd></div></dl><h3>Letni pregled</h3><dl class="detail-months"><dt>Setev na toplem</dt><dd>' +
      monthList(p.inside) +
      "</dd><dt>Setev ali sajenje na prosto</dt><dd>" +
      monthList(p.out) +
      "</dd><dt>Pobiranje</dt><dd>" +
      monthList(p.harvest) +
      '</dd></dl><button class="button dialog-save" data-save="' +
      id +
      '"></button><p class="disclaimer">Termini so okvirni za osrednjo Slovenijo. Podatke prilagodite izbrani sorti in lokalnim razmeram. Za natančno globino in razmike preverite navodila dobavitelja.</p></div>',
    trigger,
  );
  updateSavedButtons();
}
function openAdvice(id, trigger) {
  const a = advice[id];
  if (!a) return;
  showDialog(
    '<img class="dialog-image" src="assets/' +
      a.image +
      '.webp" alt="" width="640" height="250"><div class="dialog-body"><span class="eyebrow">' +
      a.label +
      '</span><h2 id="dialog-title">' +
      a.title +
      "</h2>" +
      a.paragraphs.map((p) => "<p>" + p + "</p>").join("") +
      '<p class="disclaimer">Splošne vrtnarske smernice. Upoštevajte razmere na svojem vrtu in navodila za izbrano rastlino.</p></div>',
    trigger,
  );
}
function initializeSeason() {
  const title = $("#seasonal-title"),
    description = $("#seasonal-description"),
    image = $("#seasonal-image");
  if (currentMonth < 3 || currentMonth === 12) {
    title.innerHTML = "VRT POČIVA.<br>IDEJE ŽE RASTEJO.";
    description.textContent =
      "Izkoristite mirnejše dni za načrtovanje gredic, pregled semen in prve setve na toplem. Nova sezona se začne z dobro idejo.";
    image.src = "assets/plant-por.webp";
    image.alt = "Por na zelenjavnem vrtu";
  } else if (currentMonth < 6) {
    title.innerHTML = "POMLAD JE TU.<br>NAJ SE ZAČNE RAST.";
    description.textContent =
      "Zemlja se prebuja in prvi pridelki niso več daleč. Preverite primeren čas za setev in pred sajenjem občutljivih rastlin počakajte na konec pozebe.";
    image.src = "assets/garden-hero.webp";
    image.alt = "Sajenje zelenjavne grede";
  } else if (currentMonth < 9) {
    title.innerHTML = "POLETJE NA VRTU.<br>POLNO DOBREGA.";
    description.textContent =
      "Zdaj je čas za sprotno pobiranje in skrbno zalivanje. Prazna mesta na gredah lahko izkoristite za naslednjo setev.";
    image.src = "assets/plant-paradiznik.webp";
    image.alt = "Poletni paradižniki";
  }
}
$("#months").innerHTML = months
  .map(
    (name, index) =>
      '<button data-month="' +
      (index + 1) +
      '" aria-label="' +
      name +
      '" aria-pressed="false">' +
      name.slice(0, 3) +
      "</button>",
  )
  .join("");
$("#plant-links").innerHTML = plants
  .map(
    (p) =>
      '<button data-detail="' +
      p.id +
      '">' +
      p.name +
      icon("chevron") +
      "</button>",
  )
  .join("");
$("#copyright-year").textContent = new Intl.DateTimeFormat("en", {
  timeZone: "Europe/Ljubljana",
  year: "numeric",
}).format(new Date());
$("#search").addEventListener("input", (event) => {
  query = event.target.value.trim().toLocaleLowerCase("sl");
  renderCalendar();
});
$("#this-month").addEventListener("click", () => selectMonth(currentMonth));
$("#menu-toggle").addEventListener("click", () => {
  const expanded = $("#menu-toggle").getAttribute("aria-expanded") === "true";
  $("#menu-toggle").setAttribute("aria-expanded", String(!expanded));
  $("#menu-toggle").setAttribute(
    "aria-label",
    expanded ? "Odpri meni" : "Zapri meni",
  );
  $("#main-nav").classList.toggle("open", !expanded);
});
document.addEventListener("click", (event) => {
  const button = event.target.closest("button,a");
  if (!button) return;
  if (button.dataset.month) selectMonth(Number(button.dataset.month));
  if (button.dataset.goMonth) selectMonth(Number(button.dataset.goMonth));
  if (button.dataset.filter) {
    filter = button.dataset.filter;
    renderCalendar();
  }
  if (button.dataset.save) toggleSaved(button.dataset.save);
  if (button.dataset.remove) {
    const index = saved.indexOf(button.dataset.remove);
    toggleSaved(button.dataset.remove);
    const next = document.querySelectorAll("[data-remove]");
    if (next.length)
      next[Math.min(index, next.length - 1)].focus({ preventScroll: true });
    else $("#garden-title").focus({ preventScroll: true });
  }
  if (button.dataset.detail) openPlant(button.dataset.detail, button);
  if (button.dataset.advice) openAdvice(button.dataset.advice, button);
  if (button.id === "reset-filters") {
    query = "";
    filter = "all";
    $("#search").value = "";
    renderCalendar();
    $("#search").focus({ preventScroll: true });
  }
  if (button.closest("#main-nav") && button.matches("a")) {
    $("#main-nav").classList.remove("open");
    $("#menu-toggle").setAttribute("aria-expanded", "false");
    $("#menu-toggle").setAttribute("aria-label", "Odpri meni");
  }
});
$("#garden-title").tabIndex = -1;
$("#dialog-close").addEventListener("click", () => $("#detail-dialog").close());
$("#detail-dialog").addEventListener("click", (event) => {
  if (event.target !== $("#detail-dialog")) return;
  const r = $("#detail-dialog").getBoundingClientRect();
  if (
    event.clientX < r.left ||
    event.clientX > r.right ||
    event.clientY < r.top ||
    event.clientY > r.bottom
  )
    $("#detail-dialog").close();
});
$("#detail-dialog").addEventListener("close", () => {
  const target =
    lastDialogTrigger && lastDialogTrigger.isConnected
      ? lastDialogTrigger
      : $("#garden-title");
  target.focus({ preventScroll: true });
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && $("#main-nav").classList.contains("open")) {
    $("#main-nav").classList.remove("open");
    $("#menu-toggle").setAttribute("aria-expanded", "false");
    $("#menu-toggle").setAttribute("aria-label", "Odpri meni");
    $("#menu-toggle").focus();
  }
});
initializeSeason();
renderCalendar();
renderGarden();

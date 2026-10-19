(function () {
  "use strict";
  const engine = window.GardenPlannerEngine;
  const app = window.CalendarApp;
  const root = document.querySelector("#planner-root");
  if (!engine || !app || !root) {
    if (root)
      root.textContent =
        "Načrtovalnik se ni naložil. Osvežite stran in poskusite znova.";
    return;
  }
  const KEY = "setveni-plan";
  const TASK_KEY = "setveni-plan-opravila";
  const ids = app.plants.map((p) => p.id);
  const $ = (selector) => root.querySelector(selector);
  const e = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const svg = (name) =>
    `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const num = (value) =>
    Number(value).toLocaleString("sl-SI", { maximumFractionDigits: 2 });
  const plural = (count, forms) => {
    const ending = count % 100;
    return forms[
      ending === 1 ? 0 : ending === 2 ? 1 : ending === 3 || ending === 4 ? 2 : 3
    ];
  };
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const hasGarden = (p) => p.space === "garden" || p.space === "both";
  const hasBalcony = (p) => p.space === "balcony" || p.space === "both";
  const spaceNames = {
    garden: "Vrt",
    balcony: "Balkon",
    both: "Vrt in balkon",
  };
  const sunNames = {
    sun: "6+ ur sonca",
    partial: "3–5 ur sonca",
    shade: "Manj kot 3 ure sonca",
  };
  const year = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Ljubljana",
    year: "numeric",
  }).format(new Date());
  let profile = null,
    result = null,
    step = 0,
    taskMonth = app.currentMonth,
    completed = new Set(),
    stored = true;
  try {
    profile = engine.normalizeProfile(
      JSON.parse(localStorage.getItem(KEY) || "null"),
      ids,
    );
    const savedTasks = JSON.parse(localStorage.getItem(TASK_KEY) || "[]");
    if (Array.isArray(savedTasks))
      completed = new Set(
        savedTasks
          .filter((key) => typeof key === "string" && key.length < 100)
          .slice(0, 600),
      );
  } catch {
    /* Keep the planner usable with unavailable or malformed storage. */
  }
  if (profile) result = engine.buildPlan(profile, app.plants);
  let draft = profile
    ? clone(profile)
    : {
        version: 1,
        space: null,
        garden: { area: 6, sun: null, previousGroup: "none" },
        balcony: { pots: 4, liters: 5, depth: 20, sun: null },
        selected: app.getSaved(),
      };
  const stepTitles = [
    "Vaš prostor",
    "Velikost in pogoji",
    "Sonce",
    "Vaše rastline",
  ];
  const stepDescriptions = [
    "Vsak kotiček lahko postane zelen.",
    "Dober načrt se začne s pravo mero.",
    "Sonce pomaga izbrati prave rastline.",
    "Kaj bi najraje pobirali doma?",
  ];
  function drawing(type) {
    const bed =
      '<rect x="9" y="44" width="84" height="30" rx="4" fill="#c79a69"/><path d="M10 53h82M10 64h82" stroke="#9e734d" stroke-width="2"/><path d="M25 51V30m25 21V26m25 25V32" stroke="#237747" stroke-width="3"/><ellipse cx="19" cy="32" rx="9" ry="5" fill="#5ea877" transform="rotate(30 19 32)"/><ellipse cx="31" cy="27" rx="9" ry="5" fill="#328c58" transform="rotate(-30 31 27)"/><ellipse cx="44" cy="28" rx="9" ry="5" fill="#5ea877" transform="rotate(30 44 28)"/><ellipse cx="56" cy="23" rx="9" ry="5" fill="#328c58" transform="rotate(-30 56 23)"/><ellipse cx="69" cy="34" rx="9" ry="5" fill="#5ea877" transform="rotate(30 69 34)"/><ellipse cx="81" cy="29" rx="9" ry="5" fill="#328c58" transform="rotate(-30 81 29)"/>';
    const balcony =
      '<path d="M6 45h90M12 45v32m17-32v32m18-32v32m18-32v32m19-32v32" stroke="#769c88" stroke-width="2"/><path d="m16 40 4 25h20l4-25Zm42 0 4 25h20l4-25Z" fill="#c99165"/><path d="M30 40V15m42 25V18" stroke="#287c4b" stroke-width="3"/><ellipse cx="23" cy="24" rx="10" ry="5" fill="#6cae7a" transform="rotate(30 23 24)"/><ellipse cx="37" cy="17" rx="10" ry="5" fill="#328c58" transform="rotate(-30 37 17)"/><ellipse cx="65" cy="27" rx="10" ry="5" fill="#6cae7a" transform="rotate(30 65 27)"/><ellipse cx="79" cy="20" rx="10" ry="5" fill="#328c58" transform="rotate(-30 79 20)"/>';
    return `<svg viewBox="0 0 104 84" class="space-drawing" aria-hidden="true">${type === "garden" ? bed : type === "balcony" ? balcony : `<g transform="translate(1 5) scale(.7)">${bed}</g><g transform="translate(40 13) scale(.6)">${balcony}</g>`}</svg>`;
  }
  function shell(content) {
    return `<div class="planner-shell"><aside class="planner-sidebar"><span class="planner-kicker">VAŠ MALI ZELENI SVET</span><h3>Naj raste<br>po vaše.</h3><p>Od prve izbire do načrta, ki se prilega vašemu prostoru.</p><ol class="planner-progress" aria-label="Koraki načrtovalnika">${stepTitles.map((title, index) => `<li class="${index === step ? "current" : index < step ? "done" : ""}" ${index === step ? 'aria-current="step"' : ""}><span>${index < step ? svg("check") : index + 1}</span><div>${title}</div></li>`).join("")}</ol><div class="planner-sidebar-note">${svg("heart")} Brez prijave. Vaš načrt ostane v tem brskalniku.</div></aside><div class="planner-workspace">${content}</div></div>`;
  }
  function field(name, label, value, attrs = "", help = "") {
    return `<label class="planner-field" for="${name}"><span>${label}</span><div class="planner-input-wrap"><input id="${name}" name="${name}" value="${e(value)}" ${attrs}/></div>${help ? `<small>${help}</small>` : ""}</label>`;
  }
  function selectField(name, label, value, options, help = "") {
    return `<label class="planner-field" for="${name}"><span>${label}</span><select id="${name}" name="${name}">${options.map(([v, text]) => `<option value="${v}" ${String(value) === String(v) ? "selected" : ""}>${text}</option>`).join("")}</select>${help ? `<small>${help}</small>` : ""}</label>`;
  }
  function spaceStep() {
    const choices = [
      [
        "garden",
        "Imam vrt",
        "Gredice, visoke grede ali manjši zelenjavni vrt.",
      ],
      [
        "balcony",
        "Imam balkon",
        "Zelišča, dišavnice in nekaj zelenjave v loncih.",
      ],
      [
        "both",
        "Imam oboje",
        "Vsaki rastlini poiščemo mesto na vrtu ali balkonu.",
      ],
    ];
    return `<fieldset class="planner-fieldset"><legend class="sr-only">Kje želite gojiti?</legend><div class="space-choices">${choices.map(([value, title, description]) => `<label class="space-choice"><input type="radio" name="space" value="${value}" ${draft.space === value ? "checked" : ""}/><span class="choice-check">${svg("check")}</span>${drawing(value)}<strong>${title}</strong><span>${description}</span></label>`).join("")}</div></fieldset><div class="planner-help">${svg("sprout")} Tudi nekaj loncev je dovolj za začetek. Načrt prilagodimo prostoru, ki ga imate.</div>`;
  }
  function sizeStep() {
    let content = "";
    if (hasGarden(draft))
      content += `<fieldset class="planner-zone"><legend>${svg("sprout")} Vaš vrt</legend><div class="planner-fields">${field("garden-area", "Površina gredic v m²", draft.garden.area, 'type="number" min="0.5" max="200" step="0.5" inputmode="decimal" required', "Vnesite površino za rastline, brez poti. Od 0,5 do 200 m².")}${selectField(
        "garden-previous",
        "Kaj je tu prevladovalo lani?",
        draft.garden.previousGroup,
        [
          ["none", "Ne vem / nova gredica"],
          ["fruit", "Paradižnik ali paprika"],
          ["root", "Korenje"],
          ["leaf", "Solata, špinača ali motovilec"],
          ["legume", "Grah ali fižol"],
          ["allium", "Česen ali por"],
        ],
        "Izbirno. Osnoven opomnik za kolobar na tej gredici.",
      )}</div></fieldset>`;
    if (hasBalcony(draft))
      content += `<fieldset class="planner-zone"><legend>${svg("calendar")} Vaš balkon</legend><div class="planner-fields">${field("balcony-pots", "Koliko posod imate?", draft.balcony.pots, 'type="number" min="1" max="30" step="1" inputmode="numeric" required', "Načrtujemo do 30 enako velikih posod.")}${selectField(
        "balcony-liters",
        "Prostornina posamezne posode",
        draft.balcony.liters,
        [
          [3, "3 l · majhen zeliščni lonec"],
          [5, "5 l · zeliščni lonec"],
          [8, "8 l · manjši lonec"],
          [15, "15 l · srednji lonec"],
          [30, "30 l · večji lonec"],
          [50, "50 l · zelo velik lonec"],
        ],
      )}${selectField(
        "balcony-depth",
        "Uporabna globina zemlje",
        draft.balcony.depth,
        [
          [15, "15 cm"],
          [20, "20 cm"],
          [30, "30 cm"],
          [40, "40 cm"],
        ],
        "Ne zunanja višina lonca. Korenine potrebujejo prostor.",
      )}</div><p class="planner-field-note">Imate različne lonce? Za začetek načrtujte skupino enako velikih posod. Prostornina in globina sta pomembni vsaka zase.</p></fieldset>`;
    return content;
  }
  function sunStep() {
    return (
      [
        ["garden", "Koliko sonca dobi vrt?"],
        ["balcony", "Koliko sonca dobi balkon?"],
      ]
        .filter(([space]) =>
          space === "garden" ? hasGarden(draft) : hasBalcony(draft),
        )
        .map(
          ([space, title]) =>
            `<fieldset class="planner-zone"><legend>${title}</legend><div class="sun-choices">${[
              ["sun", "Sončno", "6 ali več ur", "sun"],
              ["partial", "Polsenca", "3–5 ur", "sprout"],
              ["shade", "Pretežno senca", "Manj kot 3 ure", "leaves"],
            ]
              .map(
                ([value, label, description, ico]) =>
                  `<label class="sun-choice"><input type="radio" name="${space}-sun" value="${value}" ${draft[space].sun === value ? "checked" : ""}/>${svg(ico)}<strong>${label}</strong><span>${description}</span></label>`,
              )
              .join("")}</div></fieldset>`,
        )
        .join("") +
      `<div class="planner-help">${svg("sun")} Štejte ure neposrednega sonca v rastni sezoni. Svetloba za oknom ali svetla senca ne štejeta enako.</div>`
    );
  }
  function previewPlan(selection = draft.selected) {
    return engine.buildPlan({ ...draft, selected: selection }, app.plants);
  }
  function plantsStep() {
    const herbFirst = hasBalcony(draft);
    const herbs = app.plants.filter((p) => p.kind === "herb");
    const vegetables = app.plants.filter((p) => p.kind !== "herb");
    function choices(list, title, description) {
      return `<fieldset class="planner-fieldset planner-plant-group"><legend class="planner-group-title">${title} <span>${list.length}</span></legend><p class="planner-group-description">${description}</p><div class="planner-plant-choices">${list
        .map((p) => {
          const fit = previewPlan([p.id]).placements.length > 0;
          return `<label class="planner-plant-choice"><input type="checkbox" name="selected" value="${p.id}" ${draft.selected.includes(p.id) ? "checked" : ""}/><span class="choice-check">${svg("check")}</span><img src="assets/plant-${p.id}.webp" alt="" width="140" height="90" loading="lazy"/><strong>${p.name}</strong><span class="${fit ? "plant-fit" : "plant-not-fit"}">${fit ? "Ustreza pogojem" : "Preverite pogoje"}</span></label>`;
        })
        .join("")}</div></fieldset>`;
    }
    const herbGroup = choices(
      herbs,
      "Zelišča in dišavnice",
      "Za kuhinjo, čaj in dišeč balkon. Vsakemu zelišču namenimo svojo posodo.",
    );
    let vegetableGroup = choices(
      vegetables,
      draft.space === "balcony" ? "Po želji še zelenjava" : "Zelenjava",
      "Tudi zelenjava lahko uspeva v posodah, če ima dovolj prostora in sonca.",
    );
    if (draft.space === "balcony") {
      const selectedVegetables = vegetables.some((p) =>
        draft.selected.includes(p.id),
      );
      vegetableGroup = `<details class="planner-optional-plants" ${selectedVegetables ? "open" : ""}><summary>Želim dodati tudi zelenjavo <span>${vegetables.length} možnosti</span></summary><div>${vegetableGroup}</div></details>`;
    }
    return `<div class="planner-selection-header"><p>${herbFirst ? "Na balkonu začnite z zelišči. Zelenjavo dodajte po želji, če pogoji to dopuščajo." : "Izberite zelenjavo in zelišča za svoj vrt. Preverimo, kaj se prilega vašim pogojem."}</p><button type="button" class="text-button" id="suggest-selection">${svg("sprout")} Predlagaj mi izbor</button></div>${herbFirst ? herbGroup + vegetableGroup : vegetableGroup + herbGroup}<p id="selection-summary" class="selection-summary" aria-live="polite"></p>`;
  }
  function renderWizard(focus = false) {
    root.innerHTML = shell(
      `<form id="planner-form" novalidate><div class="planner-step-intro"><span class="planner-kicker">KORAK ${step + 1} OD 4</span><h3 id="planner-step-title" tabindex="-1">${stepTitles[step]}</h3><p>${stepDescriptions[step]}</p></div>${[spaceStep, sizeStep, sunStep, plantsStep][step]()}<p id="planner-error" class="planner-error" role="alert"></p><div class="planner-actions"><div>${step > 0 ? '<button type="button" class="planner-back" id="planner-back">← Nazaj</button>' : profile ? '<button type="button" class="planner-back" id="cancel-edit">Nazaj k načrtu</button>' : '<span class="planner-step-hint">Štirje koraki do vašega načrta.</span>'}</div><button class="button" type="submit">${step === 3 ? "Ustvari moj načrt" : "Nadaljuj"} ${svg("arrow")}</button></div>${profile && step > 0 ? '<button type="button" class="cancel-edit text-button" id="cancel-edit">Prekliči spremembe</button>' : ""}</form>`,
    );
    if (step === 3) updateSelectionSummary();
    if (focus) {
      $("#planner-step-title").focus({ preventScroll: true });
      root.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }
  function readStep() {
    const data = new FormData($("#planner-form"));
    if (step === 0) draft.space = data.get("space");
    if (step === 1) {
      if (hasGarden(draft)) {
        draft.garden.area =
          data.get("garden-area") === ""
            ? NaN
            : Number(data.get("garden-area"));
        draft.garden.previousGroup = data.get("garden-previous");
      }
      if (hasBalcony(draft)) {
        draft.balcony.pots =
          data.get("balcony-pots") === ""
            ? NaN
            : Number(data.get("balcony-pots"));
        draft.balcony.liters = Number(data.get("balcony-liters"));
        draft.balcony.depth = Number(data.get("balcony-depth"));
      }
    }
    if (step === 2) {
      if (hasGarden(draft)) draft.garden.sun = data.get("garden-sun");
      if (hasBalcony(draft)) draft.balcony.sun = data.get("balcony-sun");
    }
    if (step === 3)
      draft.selected = data.getAll("selected").filter((id) => ids.includes(id));
  }
  function validateStep() {
    if (step === 0 && !["garden", "balcony", "both"].includes(draft.space))
      return ["Izberite vrt, balkon ali oboje.", '[name="space"]'];
    if (step === 1) {
      if (
        hasGarden(draft) &&
        (!Number.isFinite(draft.garden.area) ||
          draft.garden.area < 0.5 ||
          draft.garden.area > 200)
      )
        return ["Vnesite površino gredic od 0,5 do 200 m².", "#garden-area"];
      if (
        hasBalcony(draft) &&
        (!Number.isInteger(draft.balcony.pots) ||
          draft.balcony.pots < 1 ||
          draft.balcony.pots > 30)
      )
        return ["Vnesite celo število posod od 1 do 30.", "#balcony-pots"];
    }
    if (step === 2) {
      if (
        hasGarden(draft) &&
        !["sun", "partial", "shade"].includes(draft.garden.sun)
      )
        return ["Izberite osončenost vrta.", '[name="garden-sun"]'];
      if (
        hasBalcony(draft) &&
        !["sun", "partial", "shade"].includes(draft.balcony.sun)
      )
        return ["Izberite osončenost balkona.", '[name="balcony-sun"]'];
    }
    if (step === 3 && !draft.selected.length)
      return [
        "Izberite vsaj eno rastlino ali uporabite predlagani izbor.",
        '[name="selected"]',
      ];
    return null;
  }
  function updateSelectionSummary() {
    const plan = previewPlan();
    $("#selection-summary").textContent =
      `Izbrano: ${draft.selected.length} · V razpored se uvrsti: ${plan.placements.length}. ${plan.excluded.length ? "Za preostale rastline bomo pojasnili omejitve." : "Vsaka rastlina dobi svoj prostor."}`;
  }
  function savePlan() {
    const normalized = engine.normalizeProfile(draft, ids);
    if (!normalized) {
      $("#planner-error").textContent =
        "Preverite vnesene pogoje. Načrta ni bilo mogoče sestaviti.";
      return;
    }
    profile = normalized;
    result = engine.buildPlan(profile, app.plants);
    completed = new Set();
    stored = true;
    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
      localStorage.setItem(TASK_KEY, "[]");
    } catch {
      stored = false;
    }
    const favouritesStored = app.addSaved(result.placements.map((p) => p.id));
    stored = stored && favouritesStored;
    renderResult(true);
  }
  function plantById(id) {
    return app.plants.find((p) => p.id === id);
  }
  function placementCard(p) {
    const plant = plantById(p.id);
    return `<article class="placement-card"><div class="placement-photo"><img src="assets/plant-${p.id}.webp" alt="" width="200" height="130" loading="lazy"/><span>${p.space === "garden" ? `${num(p.areaUsed)} m²` : `Posoda ${p.pot}`}</span></div><div class="placement-copy"><button class="placement-name" data-detail="${p.id}">${e(plant.name)} ${svg("chevron")}</button><span>${e(p.quantity)}</span><p>${e(p.tip)}</p><div class="placement-care"><span><strong>Razmik</strong> ${e(p.spacing)}</span><span><strong>Zalivanje</strong> ${e(p.water)}</span></div></div></article>`;
  }
  function layoutSection(space) {
    const placements = result.placements
      .filter((p) => p.space === space)
      .sort((a, b) => (space === "balcony" ? a.pot - b.pot : 0));
    const used =
      space === "garden"
        ? placements.reduce((sum, p) => sum + p.areaUsed, 0)
        : placements.length;
    const capacity =
      space === "garden" ? profile.garden.area : profile.balcony.pots;
    const free = Math.max(0, Math.round((capacity - used) * 100) / 100);
    return `<section class="plan-layout-section"><div class="plan-subheading"><div><span class="eyebrow">${space === "garden" ? "VAŠE GREDICE" : "VAŠE POSODE"}</span><h4>${space === "garden" ? "Predlog za vrt" : "Predlog za balkon"}</h4></div><span class="plan-capacity">${space === "garden" ? `${num(used)} / ${num(capacity)} m²` : `${used} / ${capacity} posod`}</span></div><p class="layout-caption">${space === "garden" ? "Shema razdelitve površine, brez poti; prikaz ni v merilu." : "Vsaka dodeljena rastlinska skupina ima svojo posodo."}</p><div class="plan-map ${space === "garden" ? "bed-map" : "pot-map"}">${placements
      .map((p) => {
        const plant = plantById(p.id);
        return `<button class="map-plant" data-detail="${p.id}" style="--plant-color:${plant.color}">${space === "balcony" ? `<span class="pot-number">${p.pot}</span>` : ""}<img src="assets/plant-${p.id}.webp" alt="" width="52" height="52" loading="lazy"/><strong>${e(plant.name)}</strong><span>${space === "garden" ? `${num(p.areaUsed)} m²` : e(profile.balcony.liters) + " l"}</span></button>`;
      })
      .join(
        "",
      )}${free > 0 ? `<div class="map-free">${svg("sprout")}<strong>${space === "garden" ? num(free) + " m²" : free + " " + plural(free, ["posoda", "posodi", "posode", "posod"])}</strong><span>še na voljo</span></div>` : ""}${!placements.length && !free ? "<p>Za ta prostor ni primernih dodelitev.</p>" : ""}</div>${space === "garden" ? '<p class="layout-note">Višje rastline in opore postavite ob severni rob, da manj senčijo nižje posevke.</p>' : `<p class="layout-note">Vsaka posoda: ${profile.balcony.liters} l in ${profile.balcony.depth} cm uporabne globine. Izberite sorte za posode in zagotovite odtekanje vode.</p>`}<div class="placement-list">${placements.map(placementCard).join("")}</div></section>`;
  }
  function taskKey(task) {
    return `${year}:${taskMonth}:${task.id}:${task.space}:${task.type}`;
  }
  function renderTasks() {
    const tasks = engine.getTasks(result, app.plants, taskMonth);
    const count = tasks.filter((t) => completed.has(taskKey(t))).length;
    let content = "";
    if (tasks.length)
      content = `<p class="task-progress"><span id="task-progress-count">${count} / ${tasks.length} opravil označenih</span><span>Odkljukajte, ko opravite.</span></p><div class="plan-task-list">${tasks.map((task, index) => `<label class="plan-task"><input type="checkbox" data-task="${e(taskKey(task))}" ${completed.has(taskKey(task)) ? "checked" : ""}/><span class="task-checkbox">${svg("check")}</span><span><strong>${e(task.title)}</strong><span class="task-place">${task.space === "garden" ? "Vrt" : "Balkon"} · ${e(plantById(task.id).name)}</span><span class="task-description">${e(task.description)}</span></span></label>`).join("")}</div>`;
    else {
      let next = null;
      for (let offset = 1; offset < 12; offset++) {
        const m = ((taskMonth - 1 + offset) % 12) + 1;
        if (engine.getTasks(result, app.plants, m).length) {
          next = m;
          break;
        }
      }
      content = `<div class="plan-quiet">${svg("sun")}<strong>Ta mesec brez načrtovanih setev ali pobiranja.</strong><p>${result.placements.length ? "Preverite vlago, odstranjujte plevel in opazujte rastline." : "Za izbrane pogoje še ni primernih rastlin. Uredite pogoje ali izberite druge rastline."}</p>${next ? `<button class="text-button" data-task-month="${next}">Naslednje opravilo: ${app.months[next - 1].toLocaleLowerCase("sl")} ${svg("arrow")}</button>` : ""}</div>`;
    }
    $("#plan-tasks").innerHTML = content;
  }
  function renderResult(focus = false) {
    const accepted = result.placements.length,
      excluded = result.excluded;
    app.setPlan(result.placements.map((p) => p.id));
    root.innerHTML = `<div class="plan-result"><div class="plan-result-header"><div><span class="eyebrow">${svg("check")} VAŠ OSEBNI NAČRT</span><h3 id="plan-result-title" tabindex="-1">${accepted === 0 ? "Najprej poiščimo prave pogoje." : profile.space === "garden" ? "Vaš vrt ima načrt." : profile.space === "balcony" ? "Vaš balkon ima načrt." : "Vrt in balkon. En dober načrt."}</h3><p>Prilagojeno prostoru, svetlobi in rastlinam, ki jih želite gojiti.</p></div><div class="plan-result-actions"><button class="button button-small" id="edit-plan">Uredi moj načrt ${svg("chevron")}</button><button class="print-plan" id="print-plan">${svg("book")} Natisni</button></div></div><div class="plan-profile-strip"><span>${svg("sprout")}<strong>${spaceNames[profile.space]}</strong></span>${hasGarden(profile) ? `<span>Gredice: <strong>${num(profile.garden.area)} m²</strong> · ${sunNames[profile.garden.sun]}</span>` : ""}${hasBalcony(profile) ? `<span>Posode: <strong>${profile.balcony.pots} × ${profile.balcony.liters} l</strong> · ${sunNames[profile.balcony.sun]}</span>` : ""}<span><strong>${accepted}</strong> ${plural(accepted, ["rastlinska skupina", "rastlinski skupini", "rastlinske skupine", "rastlinskih skupin"])}</span></div><div class="plan-storage ${stored ? "" : "not-stored"}" role="status">${svg(stored ? "check" : "pin")}${stored ? "Načrt je shranjen v tem brskalniku. Dodeljene rastline so tudi v Mojem vrtu." : "Načrt deluje, vendar ga brskalnik ne more trajno shraniti. Pred zapiranjem ga lahko natisnete."}</div><div class="plan-result-grid"><div class="plan-layouts">${hasGarden(profile) ? layoutSection("garden") : ""}${hasBalcony(profile) ? layoutSection("balcony") : ""}</div><aside class="plan-tasks-panel"><div class="plan-subheading"><div><span class="eyebrow">KORAK ZA KORAKOM</span><h4>Moja opravila</h4></div>${svg("calendar")}</div><label class="plan-month-label" for="plan-month">Prikaži opravila za<select id="plan-month">${app.months.map((name, index) => `<option value="${index + 1}" ${taskMonth === index + 1 ? "selected" : ""}>${name}</option>`).join("")}</select></label><div id="plan-tasks"></div><p class="tasks-note">To so sezonska okna, ne datumi, izračunani iz vaše dejanske setve. Pobiranje je odvisno od sorte, setve in vremena.</p></aside></div>${excluded.length ? `<section class="plan-excluded"><div class="plan-subheading"><div><span class="eyebrow">ŽELJE IN MOŽNOSTI</span><h4>Za te rastline še poiščimo rešitev.</h4></div><span>${excluded.length}</span></div><p>Teh rastlin nismo vključili v razpored. Pogoje ali izbor lahko spremenite z gumbom »Uredi moj načrt«.</p><div>${excluded.map((item) => `<article><img src="assets/plant-${item.id}.webp" alt="" width="48" height="48" loading="lazy"/><div><strong>${e(plantById(item.id).name)}</strong><ul>${item.reasons.map((reason) => `<li>${e(reason)}</li>`).join("")}</ul></div></article>`).join("")}</div></section>` : ""}${result.notes.length ? `<details class="plan-notes"><summary>Dobro je vedeti o vašem načrtu</summary><ul>${result.notes.map((note) => `<li>${e(note)}</li>`).join("")}</ul></details>` : ""}<div class="plan-result-footer"><p>Osnovni predlog za osrednjo Slovenijo. Razmike, sorte in termine prilagodite razmeram. Shema ne nadomesti večletnega kolobarja.</p><button type="button" class="text-button" id="reset-plan">Odstrani načrt</button></div><div id="reset-confirm" hidden class="plan-reset-confirm"><p>Odstranim osebni načrt? Rastline v »Mojem vrtu« ostanejo shranjene.</p><button class="button button-small" id="confirm-reset">Odstrani načrt</button><button class="text-button" id="cancel-reset">Obdrži načrt</button></div></div>`;
    renderTasks();
    if (focus) {
      $("#plan-result-title").focus({ preventScroll: true });
      root.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }
  root.addEventListener("submit", (event) => {
    if (event.target.id !== "planner-form") return;
    event.preventDefault();
    readStep();
    const error = validateStep();
    if (error) {
      $("#planner-error").textContent = error[0];
      $(error[1])?.focus({ preventScroll: true });
      return;
    }
    if (step < 3) {
      step++;
      renderWizard(true);
    } else savePlan();
  });
  root.addEventListener("change", (event) => {
    if (event.target.name === "selected") {
      readStep();
      updateSelectionSummary();
    }
    if (event.target.id === "plan-month") {
      taskMonth = Number(event.target.value);
      renderTasks();
    }
    if (event.target.dataset.task) {
      const key = event.target.dataset.task;
      if (event.target.checked) completed.add(key);
      else completed.delete(key);
      try {
        localStorage.setItem(TASK_KEY, JSON.stringify([...completed]));
      } catch {
        /* Checkbox remains usable for this session. */
      }
      const tasks = engine.getTasks(result, app.plants, taskMonth);
      const done = tasks.filter((task) => completed.has(taskKey(task))).length;
      $("#task-progress-count").textContent =
        `${done} / ${tasks.length} opravil označenih`;
    }
  });
  root.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.id === "planner-back") {
      readStep();
      step--;
      renderWizard(true);
    }
    if (button.id === "cancel-edit") renderResult(true);
    if (button.id === "suggest-selection") {
      readStep();
      const suggestion = previewPlan(ids);
      draft.selected = suggestion.placements.map((p) => p.id);
      renderWizard();
      $("#suggest-selection").focus({ preventScroll: true });
      if (!draft.selected.length)
        $("#planner-error").textContent =
          "Za te pogoje med našimi rastlinami ni primernega izbora. Poskusite več sonca ali primernejše posode.";
    }
    if (button.id === "edit-plan") {
      draft = clone(profile);
      step = 0;
      renderWizard(true);
    }
    if (button.id === "print-plan") window.print();
    if (button.dataset.taskMonth) {
      taskMonth = Number(button.dataset.taskMonth);
      $("#plan-month").value = String(taskMonth);
      renderTasks();
      $("#plan-month").focus({ preventScroll: true });
    }
    if (button.id === "reset-plan") {
      $("#reset-confirm").hidden = false;
      $("#confirm-reset").focus({ preventScroll: true });
    }
    if (button.id === "cancel-reset") {
      $("#reset-confirm").hidden = true;
      $("#reset-plan").focus({ preventScroll: true });
    }
    if (button.id === "confirm-reset") {
      try {
        localStorage.removeItem(KEY);
        localStorage.removeItem(TASK_KEY);
      } catch {
        /* Still reset the current session. */
      }
      profile = null;
      result = null;
      completed = new Set();
      step = 0;
      app.clearPlan();
      draft = {
        version: 1,
        space: null,
        garden: { area: 6, sun: null, previousGroup: "none" },
        balcony: { pots: 4, liters: 5, depth: 20, sun: null },
        selected: [],
      };
      renderWizard(true);
    }
  });
  if (profile) renderResult();
  else renderWizard();
})();

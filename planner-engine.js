/* Deterministic growing-space recommendations. No network calls or stored state. */
(function (root, factory) {
  "use strict";
  const engine = factory();
  if (typeof module === "object" && module.exports) module.exports = engine;
  if (root) root.GardenPlannerEngine = engine;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  const GROUPS = ["none", "fruit", "root", "leaf", "legume", "allium"];
  const SUN = ["sun", "partial", "shade"];
  const defaults = {
    garden: { area: 6, sun: "sun", previousGroup: "none" },
    balcony: { pots: 3, liters: 15, depth: 30, sun: "sun" },
  };
  // Each garden allocation reserves one small patch for the whole growing season.
  // Container recommendations assume compact/dwarf varieties where indicated.
  const metadata = {
    solata: {
      group: "leaf",
      area: 0.3,
      minLiters: 8,
      minDepth: 20,
      needsSun: false,
      spacing: "25–30 cm med sadikami",
      gardenQuantity: "2–3 sadike",
      potQuantity: "1 sadika v posodi",
      tip: "Sejte postopoma; v poletni vročini solati ustreza polsenca.",
      potTip:
        "Izberite manjšo ali rezivko; pri rezivki pobirajte zunanje liste.",
      water: "Prst ohranjajte enakomerno vlažno; zalivajte pri tleh.",
    },
    korenje: {
      group: "root",
      area: 0.3,
      minLiters: 15,
      minDepth: 30,
      needsSun: false,
      spacing: "3–5 cm v vrsti, 25–30 cm med vrstami",
      gardenQuantity: "Kratka vrsta; po vzniku razredčite",
      potQuantity: "Kratka vrsta ali redek posevek",
      tip: "Sejte neposredno v rahlo zemljo brez kamenja; korenja praviloma ne presajamo.",
      potTip: "Izberite kratkokorenske sorte in vsaj 30 cm globoko posodo.",
      water: "Do vznika ohranjajte površino vlažno, nato zalivajte enakomerno.",
    },
    redkvica: {
      group: "root",
      area: 0.25,
      minLiters: 8,
      minDepth: 20,
      needsSun: false,
      spacing: "3–5 cm v vrsti, približno 15 cm med vrstami",
      gardenQuantity: "Kratek posevek; po vzniku razredčite",
      potQuantity: "Manjši posevek; po vzniku razredčite",
      tip: "Uspeva v hladnejših mesecih. Sejte redko in pobirajte mlade korene.",
      potTip: "Pustite razmik 3–5 cm; po pobiranju lahko posevek ponovite.",
      water: "Zalivajte redno, da se zemlja ne izsuši in koreni ne olesenijo.",
    },
    spinaca: {
      group: "leaf",
      area: 0.3,
      minLiters: 8,
      minDepth: 20,
      needsSun: false,
      spacing: "10–15 cm v vrsti, 20–25 cm med vrstami",
      gardenQuantity: "Manjši posevek",
      potQuantity: "Manjši posevek za pobiranje listov",
      tip: "Sejte v hladnejšem delu leta; v vročini špinača hitro uide v cvet.",
      potTip: "Po vzniku razredčite in zunanje liste pobirajte postopoma.",
      water: "Zemlja naj ostaja vlažna; v posodi vlago preverjajte pogosteje.",
    },
    paradiznik: {
      group: "fruit",
      area: 0.6,
      minLiters: 30,
      minDepth: 40,
      needsSun: true,
      spacing: "50–70 cm med rastlinami",
      gardenQuantity: "1 rastlina z oporo",
      potQuantity: "1 kompaktna rastlina z oporo",
      tip: "Sadite po nevarnosti pozebe. Visokim sortam postavite oporo in omogočite zračenje.",
      potTip:
        "Izberite kompaktno balkonsko sorto in posodo stabilno zavarujte pred vetrom.",
      water:
        "Zalivajte pri koreninah enakomerno in obilno; v vročini posodo preverite vsak dan.",
    },
    paprika: {
      group: "fruit",
      area: 0.5,
      minLiters: 15,
      minDepth: 30,
      needsSun: true,
      spacing: "40–50 cm med rastlinami",
      gardenQuantity: "1–2 sadiki",
      potQuantity: "1 sadika v posodi",
      tip: "Potrebuje toplo, zavetno lego. Na prosto jo prestavite po nevarnosti pozebe.",
      potTip:
        "Za posodo izberite kompaktno sorto; v izpostavljeni legi dodajte oporo.",
      water: "Zalivajte enakomerno; prst naj se med cvetenjem ne izsuši.",
    },
    grah: {
      group: "legume",
      area: 0.4,
      minLiters: 15,
      minDepth: 30,
      needsSun: false,
      spacing: "5–8 cm v vrsti, približno 30 cm med vrstami",
      gardenQuantity: "Kratka vrsta z oporo",
      potQuantity: "Manjši posevek nizke sorte z oporo",
      tip: "Sejte zgodaj v odcedno zemljo; pripravite oporo in upoštevajte višino sorte.",
      potTip:
        "Izberite nizko sorto in postavite majhno mrežo ali vejice za oporo.",
      water: "Posebej pazite na vlago med cvetenjem in razvojem strokov.",
    },
    cesen: {
      group: "allium",
      area: 0.25,
      minLiters: 15,
      minDepth: 20,
      needsSun: false,
      spacing: "10–15 cm v vrsti, približno 25 cm med vrstami",
      gardenQuantity: "Manjša skupina strokov",
      potQuantity: "Nekaj strokov, narazen 10–15 cm",
      tip: "Sadite zdrave stroke v odcedno zemljo; izberite jesensko ali spomladansko sorto.",
      potTip: "Posoda naj dobro odvaja vodo. Česen zasede prostor več mesecev.",
      water:
        "Zalivajte zmerno in preprečite zastajanje vode; pred zorenjem zalivanje zmanjšajte.",
    },
    motovilec: {
      group: "leaf",
      area: 0.25,
      minLiters: 8,
      minDepth: 20,
      needsSun: false,
      spacing: "5–10 cm med rozetami",
      gardenQuantity: "Manjši jesenski posevek",
      potQuantity: "Manjši posevek rozet",
      tip: "Sejte plitvo pozno poleti ali jeseni; pobirajte, ko listi niso zamrznjeni.",
      potTip:
        "Posodo v mrzlih obdobjih zaščitite; majhna količina zemlje hitro premrzne.",
      water: "Do vznika vzdržujte vlago; v hladnem vremenu zalivajte zmerno.",
    },
    fizol: {
      group: "legume",
      area: 0.5,
      minLiters: 15,
      minDepth: 30,
      needsSun: true,
      spacing: "Nizki fižol: 8–10 cm v vrsti, 40–50 cm med vrstami",
      gardenQuantity: "Kratka vrsta nizkega fižola",
      potQuantity: "2–3 rastline nizkega fižola",
      tip: "Za ta manjši prostor izberite nizek fižol. Sejte v ogreta tla po nevarnosti pozebe.",
      potTip:
        "Izberite nizek grmičast fižol; visoki fižol potrebuje več prostora in močno oporo.",
      water: "Med cvetenjem in tvorbo strokov skrbite za enakomerno vlago.",
    },
    bucka: {
      group: "fruit",
      area: 1,
      minLiters: 50,
      minDepth: 40,
      needsSun: true,
      spacing: "80–100 cm med rastlinami",
      gardenQuantity: "1 grmičasta rastlina",
      potQuantity: "1 kompaktna grmičasta rastlina",
      tip: "Potrebuje rodovitno zemljo in vsaj približno 1 m² prostora za liste.",
      potTip:
        "Uporabite vsaj 50 l posodo; listi segajo preko roba in potrebujejo približno 1 m² prostora.",
      water:
        "Zalivajte obilno pri koreninah; v vročini vsak dan preverite vlago.",
    },
    por: {
      group: "allium",
      area: 0.35,
      minLiters: 15,
      minDepth: 30,
      needsSun: false,
      spacing: "10–15 cm v vrsti, 25–30 cm med vrstami",
      gardenQuantity: "Kratka vrsta sadik",
      potQuantity: "3–4 sadike v globoki posodi",
      tip: "Sadike presadite na pripravljeno gredo; izberite sorto za želeni čas pobiranja.",
      potTip:
        "Uporabite globoko posodo z rahlo zemljo; med rastlinami pustite 10–15 cm.",
      water: "Zalivajte redno, posebej po presajanju in v sušnem obdobju.",
    },
  };

  function numeric(value) {
    if (
      typeof value !== "number" &&
      (typeof value !== "string" || !value.trim())
    )
      return NaN;
    return Number(value);
  }

  function normalizeProfile(raw, plantIds) {
    if (!raw || typeof raw !== "object" || raw.version !== 1) return null;
    if (!["garden", "balcony", "both"].includes(raw.space)) return null;
    const known = new Set(
      Array.isArray(plantIds)
        ? plantIds.filter((id) => typeof id === "string")
        : Object.keys(metadata),
    );
    if (!Array.isArray(raw.selected)) return null;
    const selected = [
      ...new Set(
        raw.selected.filter(
          (id) =>
            typeof id === "string" &&
            known.has(id) &&
            Object.prototype.hasOwnProperty.call(metadata, id),
        ),
      ),
    ];
    if (!selected.length) return null;
    const profile = {
      version: 1,
      space: raw.space,
      garden: { ...defaults.garden },
      balcony: { ...defaults.balcony },
      selected,
    };
    if (raw.space === "garden" || raw.space === "both") {
      const input = raw.garden;
      if (!input || typeof input !== "object") return null;
      const area = numeric(input.area);
      if (
        !Number.isFinite(area) ||
        area < 0.5 ||
        area > 200 ||
        !SUN.includes(input.sun) ||
        !GROUPS.includes(input.previousGroup)
      )
        return null;
      profile.garden = {
        area,
        sun: input.sun,
        previousGroup: input.previousGroup,
      };
    }
    if (raw.space === "balcony" || raw.space === "both") {
      const input = raw.balcony;
      if (!input || typeof input !== "object") return null;
      const pots = numeric(input.pots);
      const liters = numeric(input.liters);
      const depth = numeric(input.depth);
      if (
        !Number.isInteger(pots) ||
        pots < 1 ||
        pots > 30 ||
        ![8, 15, 30, 50].includes(liters) ||
        ![20, 30, 40].includes(depth) ||
        !SUN.includes(input.sun)
      )
        return null;
      profile.balcony = { pots, liters, depth, sun: input.sun };
    }
    return profile;
  }

  function emptyPlan(note) {
    return {
      placements: [],
      excluded: [],
      notes: [note],
      gardenAreaUsed: 0,
      gardenAreaTotal: 0,
      potsUsed: 0,
      potsTotal: 0,
    };
  }

  function formatArea(value) {
    return String(Math.round(value * 100) / 100).replace(".", ",");
  }

  function lightReasons(spec, light) {
    if (light === "shade")
      return [
        "Manj kot 3 ure neposrednega sonca je za zanesljivo pridelavo te zelenjadnice premalo. Izberite svetlejše mesto.",
      ];
    if (spec.needsSun && light !== "sun")
      return [
        "Potrebuje sončno lego z vsaj 6 urami neposrednega sonca na dan.",
      ];
    return [];
  }

  function buildPlan(rawProfile, plants) {
    if (!Array.isArray(plants))
      return emptyPlan("Podatki o rastlinah niso na voljo.");
    const byId = new Map(
      plants
        .filter((plant) => plant && typeof plant.id === "string")
        .map((plant) => [plant.id, plant]),
    );
    const profile = normalizeProfile(rawProfile, [...byId.keys()]);
    if (!profile)
      return emptyPlan(
        "Dopolnite prostor in izberite vsaj eno rastlino za svoj načrt.",
      );
    const gardenActive = profile.space !== "balcony";
    const balconyActive = profile.space !== "garden";
    const plan = {
      placements: [],
      excluded: [],
      notes: [
        "Načrt je okviren za domačo pridelavo v Sloveniji. Termine prilagodite kraju, sorti, temperaturi tal in nevarnosti pozebe.",
        "Vsaka dodelitev rezervira svoj košček grede ali eno posodo. Zaporednih posevkov v isti prostor ta načrt ne razporeja samodejno.",
      ],
      gardenAreaUsed: 0,
      gardenAreaTotal: gardenActive ? profile.garden.area : 0,
      potsUsed: 0,
      potsTotal: balconyActive ? profile.balcony.pots : 0,
    };
    if (gardenActive)
      plan.notes.push(
        "Vnesite samo uporabno površino gred brez poti. Prikazana površina je okviren prostor za manjšo skupino posamezne zelenjadnice.",
      );
    if (balconyActive) {
      plan.notes.push(
        "Število, prostornina in globina veljajo za enake posode. Globina pomeni uporabno globino zemlje. Posode potrebujejo odtočne luknje in odceden substrat.",
      );
      plan.notes.push(
        "Pred namestitvijo večjih posod preverite nosilnost balkona; mokra zemlja je težka. Rastline in opore zaščitite pred vetrom.",
      );
    }
    if (gardenActive && profile.garden.previousGroup !== "none")
      plan.notes.push(
        "Kolobar velja za celotno vneseno gredo. Izbrano lansko skupino letos izpustimo. To je poenostavitev: na posameznih gredah preverite tudi botanične družine in pretekla leta.",
      );
    const activeLights = [
      gardenActive && profile.garden.sun,
      balconyActive && profile.balcony.sun,
    ];
    if (activeLights.includes("partial"))
      plan.notes.push(
        "Polsenca pomeni približno 3–5 ur neposrednega sonca. Listnata zelenjava jo dobro prenese; za korenovke, čebulnice in grah preverite vsaj 4 ure. Pri manj svetlobe je rast počasnejša.",
      );
    if (activeLights.includes("shade"))
      plan.notes.push(
        "Globoka senca z manj kot 3 urami neposrednega sonca je za teh 12 zelenjadnic neprimerna za zanesljivo pridelavo. Svetla razpršena svetloba ni enaka neposrednemu soncu.",
      );
    // Larger and less container-friendly vegetables get first use of garden space.
    // Only the combined-space mode reorders preferences for this allocation.
    const order = [...profile.selected];
    if (profile.space === "both")
      order.sort((a, b) => {
        const leafDifference =
          Number(metadata[a].group === "leaf") -
          Number(metadata[b].group === "leaf");
        return (
          leafDifference ||
          metadata[b].area - metadata[a].area ||
          profile.selected.indexOf(a) - profile.selected.indexOf(b)
        );
      });
    for (const id of order) {
      const spec = metadata[id];
      const spaces =
        profile.space === "both"
          ? spec.group === "leaf"
            ? ["balcony", "garden"]
            : ["garden", "balcony"]
          : [profile.space];
      const failures = [];
      let placed = false;
      for (const space of spaces) {
        const setting = profile[space];
        const reasons = lightReasons(spec, setting.sun);
        if (space === "garden") {
          if (setting.previousGroup === spec.group)
            reasons.push(
              "Na tej gredi je lani rasla ista skupina; zaradi osnovnega kolobarja izberite drugo gredo.",
            );
          const remaining = Math.max(
            0,
            Math.round((setting.area - plan.gardenAreaUsed) * 100) / 100,
          );
          if (remaining + 0.00001 < spec.area)
            reasons.push(
              `Potrebuje približno ${formatArea(spec.area)} m²; preostalo je ${formatArea(remaining)} m² uporabne grede.`,
            );
        } else {
          if (setting.liters < spec.minLiters)
            reasons.push(
              `Premajhna posoda: potrebuje vsaj ${spec.minLiters} l, vaše imajo ${setting.liters} l.`,
            );
          if (setting.depth < spec.minDepth)
            reasons.push(
              `Premalo globine zemlje: potrebuje vsaj ${spec.minDepth} cm, na voljo je ${setting.depth} cm.`,
            );
          if (plan.potsUsed >= setting.pots)
            reasons.push(
              "Vse prijavljene posode so že dodeljene; za to rastlino potrebujete dodatno posodo.",
            );
        }
        if (reasons.length) {
          failures.push(
            ...reasons.map(
              (reason) => `${space === "garden" ? "Vrt" : "Balkon"}: ${reason}`,
            ),
          );
          continue;
        }
        let tip = space === "balcony" ? `${spec.tip} ${spec.potTip}` : spec.tip;
        if (setting.sun === "partial" && spec.group !== "leaf")
          tip +=
            " V polsenci preverite vsaj 4 ure neposrednega sonca; rast in pridelek sta lahko skromnejša.";
        plan.placements.push({
          id,
          space,
          areaUsed: space === "garden" ? spec.area : null,
          pot: space === "balcony" ? plan.potsUsed + 1 : null,
          quantity: space === "garden" ? spec.gardenQuantity : spec.potQuantity,
          spacing: spec.spacing,
          tip,
          water: spec.water,
          group: spec.group,
        });
        if (space === "garden")
          plan.gardenAreaUsed =
            Math.round((plan.gardenAreaUsed + spec.area) * 100) / 100;
        else plan.potsUsed += 1;
        placed = true;
        break;
      }
      if (!placed) plan.excluded.push({ id, reasons: [...new Set(failures)] });
    }
    // Keep the user's selection order in the output, independent of placement priority.
    plan.placements.sort(
      (a, b) => profile.selected.indexOf(a.id) - profile.selected.indexOf(b.id),
    );
    plan.excluded.sort(
      (a, b) => profile.selected.indexOf(a.id) - profile.selected.indexOf(b.id),
    );
    if (plan.excluded.length)
      plan.notes.push(
        "Nedodeljene rastline ostanejo med vašimi željami. Spremenite prostor, lego ali izbor in ponovno sestavite načrt; drugih rastlin ne dodajamo samodejno.",
      );
    return plan;
  }

  function getTasks(plan, plants, month) {
    if (
      !plan ||
      !Array.isArray(plan.placements) ||
      !Array.isArray(plants) ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    )
      return [];
    const byId = new Map(
      plants
        .filter((plant) => plant && typeof plant.id === "string")
        .map((plant) => [plant.id, plant]),
    );
    const tasks = [];
    const seen = new Set();
    const includesMonth = (list) => Array.isArray(list) && list.includes(month);
    for (const placement of plan.placements) {
      if (
        !placement ||
        !["garden", "balcony"].includes(placement.space) ||
        !Object.prototype.hasOwnProperty.call(metadata, placement.id)
      )
        continue;
      const plant = byId.get(placement.id);
      if (!plant || seen.has(placement.id)) continue;
      seen.add(placement.id);
      const id = plant.id;
      const space = placement.space;
      const name = typeof plant.name === "string" ? plant.name : id;
      const destination =
        space === "garden"
          ? "na dodeljeno gredo"
          : `v posodo ${placement.pot || "na balkonu"}`;
      const push = (type, title, description) =>
        tasks.push({
          id,
          space,
          type,
          title: `${name}: ${title}`,
          description,
        });
      if (includesMonth(plant.inside)) {
        push(
          "sowInside",
          "vzgoja sadik",
          `Sejte v manjše setvene posodice v svetlem prostoru. Upoštevajte temperaturo kalitve izbrane sorte; sadike boste pozneje prestavili ${destination}.`,
        );
      }
      if (includesMonth(plant.out)) {
        if (["paradiznik", "paprika", "por"].includes(id)) {
          const frost =
            id === "por"
              ? "Sadike pred presajanjem postopoma utrdite."
              : "Sadike postopoma utrdite in presadite šele po nevarnosti pozebe, ko so tla in noči dovolj topli.";
          push(
            "plantOutside",
            space === "garden" ? "presajanje na gredo" : "presajanje v posodo",
            `Presadite ${destination}. ${frost} ${placement.spacing || metadata[id].spacing}.`,
          );
        } else if (id === "cesen") {
          push(
            "plantOutside",
            "sajenje strokov",
            `Sadite zdrave stroke s konico navzgor ${destination}. Izberite sorto za spomladansko oziroma jesensko sajenje; ne gre za setev semena.`,
          );
        } else {
          let condition =
            "Termin prilagodite vremenu, sorti in temperaturi zemlje.";
          if (id === "fizol" || id === "bucka")
            condition =
              "Počakajte na dovolj ogreto zemljo in konec nevarnosti pozebe.";
          push(
            "sowOutside",
            space === "garden" ? "setev na gredo" : "setev v posodo",
            `Sejte neposredno ${destination}. ${condition} ${placement.spacing || metadata[id].spacing}.`,
          );
        }
      }
      if (includesMonth(plant.harvest)) {
        push(
          "harvest",
          "sezonsko okno pobiranja",
          "To je okvirno sezonsko okno, ne obljuba že zrelega pridelka. Dejanski čas je odvisen od datuma setve ali sajenja, sorte, kraja in vremena. Pobirajte le dovolj razvite rastline oziroma plodove.",
        );
      }
    }
    return tasks;
  }

  return { normalizeProfile, buildPlan, getTasks, metadata };
});

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
  normalizeProfile,
  buildPlan,
  getTasks,
} = require("../planner-engine.js");

// Keep the real calendar data as the source of truth, without loading the DOM app.
const appSource = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
const plantLiteral = appSource.match(/const plants\s*=\s*(\[[\s\S]*?\n\]);/);
assert.ok(plantLiteral, "The calendar must expose its plants array.");
const plants = JSON.parse(JSON.stringify(vm.runInNewContext(plantLiteral[1])));
const ids = plants.map((plant) => plant.id);
const byId = new Map(plants.map((plant) => [plant.id, plant]));
const fruitIds = ["paradiznik", "paprika", "bucka"];

function rawProfile(overrides = {}) {
  return {
    version: 1,
    space: "garden",
    garden: { area: 4, sun: "sun", previousGroup: "none" },
    balcony: { pots: 3, liters: 30, depth: 40, sun: "sun" },
    selected: [...ids],
    ...overrides,
  };
}

function normalized(overrides = {}) {
  const profile = normalizeProfile(rawProfile(overrides), ids);
  assert.ok(profile, "A complete, valid profile must be accepted.");
  return profile;
}

function checkPlan(plan, profile) {
  assert.ok(Array.isArray(plan.placements));
  assert.ok(Array.isArray(plan.excluded));
  assert.ok(Array.isArray(plan.notes));

  const placedIds = plan.placements.map((placement) => placement.id);
  const excludedIds = plan.excluded.map((exclusion) => exclusion.id);
  assert.equal(
    new Set(placedIds).size,
    placedIds.length,
    "A plant must not occupy both spaces or repeat.",
  );
  assert.equal(
    new Set(excludedIds).size,
    excludedIds.length,
    "Exclusions must not repeat.",
  );
  assert.deepEqual(
    [...placedIds, ...excludedIds].sort(),
    [...profile.selected].sort(),
    "Every selected plant must be assigned or explained exactly once.",
  );

  let areaUsed = 0;
  const pots = new Set();
  for (const placement of plan.placements) {
    assert.ok(byId.has(placement.id));
    assert.ok(["garden", "balcony"].includes(placement.space));
    assert.ok(profile.space === "both" || placement.space === profile.space);
    assert.ok(
      typeof placement.quantity === "string" &&
        placement.quantity.trim().length > 0,
    );
    assert.ok(
      typeof placement.spacing === "string" &&
        placement.spacing.trim().length > 0,
    );
    assert.ok(
      typeof placement.tip === "string" && placement.tip.trim().length > 0,
    );
    assert.ok(
      typeof placement.water === "string" && placement.water.trim().length > 0,
    );
    if (placement.space === "garden") {
      assert.ok(Number.isFinite(placement.areaUsed) && placement.areaUsed > 0);
      areaUsed += placement.areaUsed;
    } else {
      assert.ok(Number.isInteger(placement.pot) && placement.pot >= 1);
      assert.ok(placement.pot <= profile.balcony.pots);
      assert.ok(
        !pots.has(placement.pot),
        "A pot must not be promised to two different crops.",
      );
      pots.add(placement.pot);
    }
  }
  assert.ok(
    areaUsed <= profile.garden.area + 1e-8,
    `Assigned ${areaUsed} m² exceeds the available bed.`,
  );
  assert.ok(pots.size <= profile.balcony.pots);

  for (const exclusion of plan.excluded) {
    assert.ok(Array.isArray(exclusion.reasons) && exclusion.reasons.length > 0);
    for (const reason of exclusion.reasons) {
      assert.ok(
        typeof reason === "string" && reason.trim().length >= 10,
        "Exclusions need a useful explanation.",
      );
      assert.ok(!/^\[object |^(undefined|null|false)$/.test(reason));
    }
  }
}

test("saved-profile validation rejects malformed data without throwing", () => {
  const invalid = [
    null,
    undefined,
    "not a profile",
    [],
    3,
    {},
    rawProfile({ version: 2 }),
    rawProfile({ space: "roof" }),
    rawProfile({ selected: [] }),
    rawProfile({ selected: ["unknown-plant"] }),
    rawProfile({ selected: "solata" }),
    rawProfile({ garden: { area: 0, sun: "sun", previousGroup: "none" } }),
    rawProfile({ garden: { area: 201, sun: "sun", previousGroup: "none" } }),
    rawProfile({ garden: { area: NaN, sun: "sun", previousGroup: "none" } }),
    rawProfile({
      garden: { area: Infinity, sun: "sun", previousGroup: "none" },
    }),
    rawProfile({ garden: { area: 4, sun: "moon", previousGroup: "none" } }),
    rawProfile({ garden: { area: 4, sun: "sun", previousGroup: "unknown" } }),
    rawProfile({
      space: "balcony",
      balcony: { pots: 0, liters: 8, depth: 20, sun: "sun" },
    }),
    rawProfile({
      space: "balcony",
      balcony: { pots: 31, liters: 8, depth: 20, sun: "sun" },
    }),
    rawProfile({
      space: "balcony",
      balcony: { pots: 1.5, liters: 8, depth: 20, sun: "sun" },
    }),
    rawProfile({
      space: "balcony",
      balcony: { pots: 2, liters: 9, depth: 20, sun: "sun" },
    }),
    rawProfile({
      space: "balcony",
      balcony: { pots: 2, liters: 8, depth: 10, sun: "sun" },
    }),
  ];
  for (const raw of invalid) {
    let result;
    assert.doesNotThrow(() => {
      result = normalizeProfile(raw, ids);
    });
    assert.equal(
      result,
      null,
      `Malformed profile was accepted: ${JSON.stringify(raw)}`,
    );
  }
});

test("normalization removes unknown and duplicate plant IDs without mutating storage data", () => {
  const raw = rawProfile({
    selected: ["solata", "unknown", "solata", "paradiznik"],
  });
  const before = JSON.stringify(raw);
  const result = normalizeProfile(raw, ids);
  assert.ok(result);
  assert.deepEqual(result.selected, ["solata", "paradiznik"]);
  assert.equal(JSON.stringify(raw), before);
  checkPlan(buildPlan(result, plants), result);
});

test("object prototype names never become selectable plant IDs", () => {
  const unsafeNames = ["__proto__", "constructor", "toString"];
  assert.equal(
    normalizeProfile(rawProfile({ selected: unsafeNames }), [
      ...ids,
      ...unsafeNames,
    ]),
    null,
  );
  const profile = normalizeProfile(
    rawProfile({ selected: [...unsafeNames, "solata"] }),
    [...ids, ...unsafeNames],
  );
  assert.ok(profile);
  assert.deepEqual(profile.selected, ["solata"]);
  checkPlan(buildPlan(profile, plants), profile);
});

test("inactive space settings do not prevent a valid garden or balcony plan", () => {
  assert.ok(normalizeProfile(rawProfile({ balcony: null }), ids));
  assert.ok(
    normalizeProfile(rawProfile({ space: "balcony", garden: null }), ids),
  );
  assert.equal(
    normalizeProfile(rawProfile({ space: "both", garden: null }), ids),
    null,
  );
  assert.equal(
    normalizeProfile(rawProfile({ space: "both", balcony: null }), ids),
    null,
  );
});

test("two sunny 8 L pots accept lettuce and reject tomato and courgette", () => {
  const profile = normalized({
    space: "balcony",
    balcony: { pots: 2, liters: 8, depth: 20, sun: "sun" },
    selected: ["solata", "paradiznik", "bucka"],
  });
  const plan = buildPlan(profile, plants);
  checkPlan(plan, profile);
  assert.ok(plan.placements.some((placement) => placement.id === "solata"));
  for (const id of ["paradiznik", "bucka"]) {
    assert.ok(!plan.placements.some((placement) => placement.id === id));
    const exclusion = plan.excluded.find((item) => item.id === id);
    assert.ok(exclusion);
    assert.match(
      exclusion.reasons.join(" "),
      /litr|prostorn|posod|lonec|lonc|globin/i,
    );
  }
});

test("all plant selections respect bed area and pot limits across practical boundary values", () => {
  for (const area of [0.5, 1, 4, 200]) {
    for (const sun of ["sun", "partial", "shade"]) {
      const profile = normalized({
        garden: { area, sun, previousGroup: "none" },
      });
      checkPlan(buildPlan(profile, plants), profile);
    }
  }
  for (const pots of [1, 2, 30]) {
    for (const liters of [8, 15, 30, 50]) {
      const profile = normalized({
        space: "balcony",
        balcony: { pots, liters, depth: 40, sun: "sun" },
      });
      checkPlan(buildPlan(profile, plants), profile);
    }
  }
  for (const sun of ["sun", "partial", "shade"]) {
    const profile = normalized({
      space: "both",
      garden: { area: 0.5, sun, previousGroup: "none" },
      balcony: { pots: 2, liters: 30, depth: 40, sun: "sun" },
    });
    checkPlan(buildPlan(profile, plants), profile);
  }
});

test("shade does not promise sun-loving fruit crops in either growing space", () => {
  for (const space of ["garden", "balcony", "both"]) {
    const profile = normalized({
      space,
      garden: { area: 20, sun: "shade", previousGroup: "none" },
      balcony: { pots: 10, liters: 50, depth: 40, sun: "shade" },
      selected: [...fruitIds],
    });
    const plan = buildPlan(profile, plants);
    checkPlan(plan, profile);
    assert.equal(plan.placements.length, 0);
    for (const exclusion of plan.excluded) {
      assert.match(exclusion.reasons.join(" "), /sonc|svetlob|sen[cč]/i);
    }
  }
});

test("both spaces distribute crops according to their different light conditions", () => {
  const profile = normalized({
    space: "both",
    garden: { area: 4, sun: "partial", previousGroup: "none" },
    balcony: { pots: 1, liters: 30, depth: 40, sun: "sun" },
    selected: ["solata", "paradiznik"],
  });
  const plan = buildPlan(profile, plants);
  checkPlan(plan, profile);
  assert.equal(
    plan.placements.find((placement) => placement.id === "solata")?.space,
    "garden",
  );
  assert.equal(
    plan.placements.find((placement) => placement.id === "paradiznik")?.space,
    "balcony",
  );
});

test("monthly tasks only cover assigned crops and the calendar's current season", () => {
  const profile = normalized({
    space: "both",
    garden: { area: 8, sun: "partial", previousGroup: "none" },
    balcony: { pots: 3, liters: 50, depth: 40, sun: "sun" },
  });
  const plan = buildPlan(profile, plants);
  checkPlan(plan, profile);
  assert.ok(plan.placements.length > 0);
  for (let month = 1; month <= 12; month += 1) {
    const tasks = getTasks(plan, plants, month);
    assert.ok(Array.isArray(tasks));
    const keys = new Set();
    for (const task of tasks) {
      const placement = plan.placements.find(
        (item) => item.id === task.id && item.space === task.space,
      );
      assert.ok(
        placement,
        "Unassigned plants must not receive personalized tasks.",
      );
      assert.ok(
        ["sowInside", "sowOutside", "plantOutside", "harvest"].includes(
          task.type,
        ),
      );
      const calendar = byId.get(task.id);
      const season =
        task.type === "sowInside"
          ? calendar.inside
          : task.type === "harvest"
            ? calendar.harvest
            : calendar.out;
      assert.ok(
        season.includes(month),
        `${task.id}: ${task.type} is outside month ${month}.`,
      );
      assert.ok(typeof task.title === "string" && task.title.trim().length > 0);
      assert.ok(
        typeof task.description === "string" &&
          task.description.trim().length > 0,
      );
      const key = `${task.id}:${task.space}:${task.type}`;
      assert.ok(!keys.has(key), "A monthly task must not be duplicated.");
      keys.add(key);
    }
    for (const placement of plan.placements) {
      const calendar = byId.get(placement.id);
      const cropTasks = tasks.filter(
        (task) => task.id === placement.id && task.space === placement.space,
      );
      if (calendar.inside.includes(month))
        assert.ok(cropTasks.some((task) => task.type === "sowInside"));
      if (calendar.out.includes(month))
        assert.ok(
          cropTasks.some(
            (task) =>
              task.type === "sowOutside" || task.type === "plantOutside",
          ),
        );
      if (calendar.harvest.includes(month))
        assert.ok(cropTasks.some((task) => task.type === "harvest"));
    }
  }
});

test("invalid months and empty plans return no dated tasks", () => {
  const profile = normalized();
  const plan = buildPlan(profile, plants);
  for (const month of [0, 13, NaN, null, undefined, "March"]) {
    assert.deepEqual(getTasks(plan, plants, month), []);
  }
  assert.deepEqual(
    getTasks({ placements: [], excluded: [], notes: [] }, plants, 5),
    [],
  );
});

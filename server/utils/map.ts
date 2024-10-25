import { ValueNoise } from "value-noise-js";
import { GRID_SIZE, REGION_SIZE, SMOOTH_REPEATS } from "~~/shared/consts";
import type {
  Cell,
  GenerationPattern,
  GenerationRule,
  WriteCell,
} from "~~/shared/types";

function distance(a: { x: number; y: number }, b: { x: number; y?: number }) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - (b.y ?? b.x), 2));
}

function is(a: { x: number; y: number }, b: { x: number; y?: number }) {
  return a.x == b.x && a.y == (b.y ?? b.x);
}

function random(x: number) {
  return Math.random() < x;
}

export function getRules(): GenerationPattern {
  const noise = new ValueNoise(undefined, undefined, "perlin");

  return {
    pre: [
      {
        if: (cell) => true,
        action: (cell) =>
          (cell.height = noise.evalXY(
            (cell.x / GRID_SIZE) * REGION_SIZE,
            (cell.y / GRID_SIZE) * REGION_SIZE
          )),
      },
      {
        if: (cell) => is(cell, { x: 0 }),
        then: {
          building: "castle",
          owner: 0,
        },
      },
      {
        if: (cell) => is(cell, { x: GRID_SIZE - 1 }),
        then: {
          building: "castle",
          owner: 1,
        },
      },
      {
        if: (cell) =>
          is(cell, { x: GRID_SIZE / 2 - 1 }) || is(cell, { x: GRID_SIZE / 2 }),
        then: {
          building: "mine",
        },
      },
    ],
    step: [
      {
        if: (cell) =>
          distance(cell, { x: 0 }) <= 4 ||
          distance(cell, { x: GRID_SIZE - 1 }) <= 4,
        then: {
          biome: "plains",
          heightLimits: [0.2, 0.2],
        },
      },
      {
        if: (cell) => distance(cell, { x: (GRID_SIZE - 1) / 2 }) <= 2,
        then: {
          biome: "rocks",
          heightLimits: [0.8, 0.8],
        },
      },
    ],
    post: [
      {
        if: (cell) => cell.height < 0.4,
        then: {
          biome: "plains",
        },
      },
      {
        if: (cell) => 0.4 <= cell.height && cell.height < 0.7,
        then: {
          biome: "forest",
        },
      },
      {
        if: (cell) => 0.7 <= cell.height,
        then: {
          biome: "rocks",
        },
      },
      {
        if: (cell, opp) =>
          cell.building == null &&
          cell.biome == "plains" &&
          opp.building == null &&
          opp.biome == "plains" &&
          random(0.1),
        then: {
          building: "wheat",
        },
      },
      {
        if: (cell, opp) => opp.building == "wheat",
        then: {
          building: "wheat",
        },
      },
      {
        if: (cell, opp) =>
          cell.building == null &&
          cell.biome == "rocks" &&
          opp.building == null &&
          opp.biome == "rocks" &&
          random(0.1),
        then: {
          building: "pasture",
        },
      },
      {
        if: (cell, opp) => opp.building == "pasture",
        then: {
          building: "pasture",
        },
      },
      {
        if: (cell) =>
          cell.building == null &&
          cell.biome == "plains" &&
          distance(cell, { x: 0 }) > 2 &&
          distance(cell, { x: GRID_SIZE - 1 }) > 2 &&
          random(0.1),
        then: {
          building: "lake",
        },
      },
      {
        if: (cell) =>
          cell.building == null && cell.biome == "rocks" && random(0.2),
        then: {
          building: "mountain",
        },
      },
    ],
  };
}

function opp(cell: Cell, map: Cell[][]) {
  return map[GRID_SIZE - cell.x - 1]![GRID_SIZE - cell.y - 1]!;
}

function applyRule(rule: GenerationRule, cell: Cell, opp: Cell) {
  if (rule.if(cell, opp)) {
    if (rule.then) {
      for (const [key, value] of Object.entries(rule.then)) {
        // @ts-expect-error key not typed
        cell[key] = value;
      }
    }
    if (rule.action) rule.action(cell);
  }
}

function pickClampedLerped(t: Cell[][], x: number, y: number, v: Cell): number {
  const target =
    t[Math.min(Math.max(x, 0), t.length - 1)]![
      Math.min(Math.max(y, 0), (t[0]?.length ?? 1) - 1)
    ]!;

  return v.height + Math.random() * (target.height - v.height);
}

export function generateMap(): Cell[] {
  const rules = getRules();

  const map: WriteCell[][] = Array.from({ length: GRID_SIZE }, (_, x) =>
    Array.from({ length: GRID_SIZE }, (_, y) => ({
      x,
      y,
      biome: "plains",
      building: null,
      height: 0.5,
      heightLimits: [0, 1],
      owner: null,
    }))
  );

  for (const rule of rules.pre) {
    for (const row of map) {
      for (const cell of row) {
        applyRule(rule, cell, opp(cell, map));
      }
    }
  }

  for (let index = -1; index < SMOOTH_REPEATS; index++) {
    if (index != -1) {
      for (const [x, row] of map.entries()) {
        for (const [y, cell] of row.entries()) {
          cell.height = Math.min(
            Math.max(pickClampedLerped(map, x, y, cell), cell.heightLimits[0]),
            cell.heightLimits[1]
          );
        }
      }
    }

    for (const rule of rules.step) {
      for (const row of map) {
        for (const cell of row) {
          applyRule(rule, cell, opp(cell, map));
        }
      }
    }
  }
  for (const rule of rules.post) {
    for (const row of map) {
      for (const cell of row) {
        applyRule(rule, cell, opp(cell, map));
      }
    }
  }
  return map.flat();
}

import { GRID_SIZE, SMOOTH_REPEATS } from "~~/shared/consts";
import { mapsRules } from "./mapRules";

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

export function generateMap(mapName: string): Cell[] {
  const rules = (mapsRules as { [mapName: string]: GenerationRule[] })[mapName];

  if (!rules)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Invalid mapName "${mapName}"; not found`,
    });

  const stages = {
    pre: [getNoiseRule()] as GenerationRule[],
    step: [] as GenerationRule[],
    post: [] as GenerationRule[],
  };

  for (const rule of rules) {
    stages[rule.when].push(rule);
  }

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

  for (const rule of stages.pre) {
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

    for (const rule of stages.step) {
      for (const row of map) {
        for (const cell of row) {
          applyRule(rule, cell, opp(cell, map));
        }
      }
    }
  }
  for (const rule of stages.post) {
    for (const row of map) {
      for (const cell of row) {
        applyRule(rule, cell, opp(cell, map));
      }
    }
  }
  return map.flat();
}

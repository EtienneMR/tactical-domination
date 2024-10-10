import { GRID_SIZE, REGION_SIZE, SMOOTH_REPEATS } from "~~/shared/consts";
import type { Game } from "~~/shared/types";

const BIOMES = ["plains", "forest", "rocks"] as const;

function getBiome(level: number) {
  if (level < 0.5) return BIOMES[0];
  if (level < 0.8) return BIOMES[1];
  return BIOMES[2];
}

function pickClampedLerped(
  t: number[][],
  x: number,
  y: number,
  v: number
): number {
  const target =
    t[Math.min(Math.max(x, 0), t.length - 1)]![
      Math.min(Math.max(y, 0), (t[0]?.length ?? 1) - 1)
    ]!;

  return v + Math.random() * (target - v);
}

function generateMap() {
  const regionMap: number[][] = [];
  const lockedRegions: boolean[][] = [];
  const regionWidth = GRID_SIZE / REGION_SIZE;

  for (let x = 0; x < regionWidth; x++) {
    const row: number[] = (regionMap[x] = []);
    const lrow: boolean[] = (lockedRegions[x] = []);
    for (let y = 0; y < regionWidth; y++) {
      row[y] = Math.random();
      lrow[y] = false;
    }
  }

  regionMap[0]![0] = regionMap[regionWidth - 1]![regionWidth - 1] = 0;
  regionMap[(regionWidth - 1) / 2]![(regionWidth - 1) / 2] = 1;

  lockedRegions[0]![0] =
    lockedRegions[regionWidth - 1]![regionWidth - 1] =
    lockedRegions[(regionWidth - 1) / 2]![(regionWidth - 1) / 2] =
      true;

  let biomeMap: number[][] = [];

  for (let x = 0; x < GRID_SIZE; x++) {
    const row: number[] = (biomeMap[x] = []);
    for (let y = 0; y < GRID_SIZE; y++) {
      row[y] =
        regionMap[Math.floor(x / REGION_SIZE)]![Math.floor(y / REGION_SIZE)]!;
    }
  }

  for (let index = 0; index < SMOOTH_REPEATS; index++) {
    const newMap: number[][] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      const row: number[] = (newMap[x] = []);
      for (let y = 0; y < GRID_SIZE; y++) {
        if (
          lockedRegions[Math.floor(x / REGION_SIZE)]![
            Math.floor(y / REGION_SIZE)
          ]
        ) {
          row[y] = biomeMap[x]![y]!;
        } else {
          row[y] = pickClampedLerped(
            biomeMap,
            x + Math.round(Math.random() * 2 - 1),
            y + Math.round(Math.random() * 2 - 1),
            biomeMap[x]![y]!
          );
        }
      }
    }
    biomeMap = newMap;
  }

  const data = [];

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      data.push({
        biome: getBiome(biomeMap[x]![y]!),
        building: null as string | null,
        owner: null as number | null,
      });
    }
  }

  data[0]!.building = "castle";
  data[0]!.owner = 0;

  data[data.length - 1]!.building = "castle";
  data[data.length - 1]!.owner = 1;

  return data;
}

export function createGame(initiator: string): Game {
  return {
    id: `g${Math.floor(Math.random() * 1000000)}`,

    state: "initing",

    players: [
      {
        pid: initiator,
        replay: false,

        gold: 1,
        wheat: 5,
      },
      {
        pid: null,
        replay: false,

        gold: 1,
        wheat: 5,
      },
    ],

    entities: [],
    map: generateMap(),
  };
}

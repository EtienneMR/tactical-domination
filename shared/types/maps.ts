export type MapId = (typeof MAP_IDS)[number];
export type MapData = (typeof MAPS)[number];
export type BuildingType = (typeof BUILDINGS_TYPES)[number];

export type BiomeType = "plains" | "forest" | "rocks";

export interface Position {
  x: number;
  y: number;
}

export interface WriteCell extends Position {
  biome: BiomeType;
  building: BuildingType | null;
  height: number;
  heightLimits: [number, number];
  owner: number | null;
}

export interface Cell extends WriteCell {
  readonly biome: BiomeType;
  readonly height: number;
  readonly heightLimits: [number, number];
}

export interface GenerationRule {
  readonly if: (cell: WriteCell, opp: WriteCell) => boolean;
  readonly then?: Partial<WriteCell>;
  readonly action?: (cell: WriteCell) => void;
  readonly when: "pre" | "step" | "post";
}

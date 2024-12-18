import type { ACTIONS_DATA, ACTIONS_TYPES, ENTITIES_TYPES } from "../consts";

export type EntityType = (typeof ENTITIES_TYPES)[number];
export type ActionType = (typeof ACTIONS_TYPES)[number];
export type ActionData = (typeof ACTIONS_DATA)[number];

export interface Entity {
  readonly eid: string;
  type: EntityType;
  owner: number | null;
  x: number;
  y: number;
  budget: number;
}

export interface Action {
  readonly type: ActionType;
  readonly range: number;
  readonly budget: number;
}

export interface EntityClass {
  readonly type: EntityType;
  readonly immune: null | ActionType;
  readonly resource: "gold" | "food";
  readonly actions: readonly Action[];
}

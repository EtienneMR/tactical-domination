import { ActionType, EntityType } from "./game";

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
  readonly target: null | "enemy";
  readonly range: number;
  readonly budget: number;
}

export interface EntityClass {
  readonly type: EntityType;
  readonly immune: null | ActionType;
  readonly ressource: "gold" | "food";
  readonly actions: readonly Action[];
}

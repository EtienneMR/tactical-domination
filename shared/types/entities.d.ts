import { ActionType, EntityType } from "./game";

export interface Entity {
  readonly eid: string;
  type: EntityType;
  readonly owner: number;
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
  readonly actions: readonly Action[];
}

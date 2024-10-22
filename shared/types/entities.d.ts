import { ActionType, EntityType } from "./game";

export interface Entity {
  readonly eid: string;
  readonly type: EntityType;
  readonly owner: number;
  x: number;
  y: number;
  used: boolean;
}

export interface Action {
  readonly type: ActionType;
  readonly target: null | "enemy";
  readonly range: number;
}

export interface EntityClass {
  readonly type: EntityType;
  readonly immune: null | ActionType;
  readonly actions: readonly Action[];
}

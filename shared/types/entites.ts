export type EntityType = (typeof ENTITIES_TYPES)[number]
export type ActionType = (typeof ACTIONS_TYPES)[number]

export interface Entity {
  readonly entityId: string
  readonly className: EntityType
  owner: number | null
  x: number
  y: number
  budget: number
}

export interface EntityClass {
  readonly name: EntityType
  readonly immune: null | ActionType
  readonly resource: "gold" | "food"
  readonly actions: readonly Action[]
}

export interface Action {
  readonly type: ActionType
  readonly range: number
  readonly budget: number
}

export interface ActionData {
  readonly type: ActionType
  readonly target: "enemy" | null
  readonly walk: boolean
}

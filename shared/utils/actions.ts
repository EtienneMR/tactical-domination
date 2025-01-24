export const ACTIONS_DATA = [
  { type: "move", target: null, walk: true },
  { type: "melee", target: "enemy", walk: true },
  { type: "ranged", target: "enemy", walk: false },
  { type: "build", target: null, walk: false }
] as const

ACTIONS_DATA satisfies readonly ActionData[]

export const ACTIONS_TYPES = ACTIONS_DATA.map(a => a.type)

export const getActionDataFromType = createIdentifierGetter(
  ACTIONS_DATA,
  "type"
)

export function getActionFromEntityClass(
  entityClass: EntityClass,
  actionType: ActionType | string
): Action {
  return findWithIdentifer(entityClass.actions, "type", actionType)
}

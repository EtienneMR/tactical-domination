export const ACTIONS_DATA = [
  { type: "ActionMove", target: null, walk: true },
  { type: "ActionMelee", target: "enemy", walk: true },
  { type: "ActionRanged", target: "enemy", walk: false },
  { type: "ActionBuild", target: null, walk: false },
] as const;

ACTIONS_DATA satisfies readonly ActionData[];

export const ACTIONS_TYPES = ACTIONS_DATA.map((a) => a.type);

export const getActionDataFromType = createIdentifierGetter(
  ACTIONS_DATA,
  "type"
);

export function getActionFromEntityClass(
  entityClass: EntityClass,
  actionType: ActionType | string
): Action {
  return findWithIdentifer(entityClass.actions, "type", actionType);
}

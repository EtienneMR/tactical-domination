export const ENTITIES_CLASSES = [
  {
    name: "melee",
    immune: "ActionRanged",
    resource: "gold",
    actions: [
      { type: "ActionMove", range: 1, budget: 100 },
      { type: "ActionMelee", range: 1, budget: 50 },
    ],
  },
  {
    name: "archer",
    immune: null,
    resource: "gold",
    actions: [
      { type: "ActionMove", range: 1, budget: 100 },
      { type: "ActionRanged", range: 2, budget: 100 },
    ],
  },
  {
    name: "horseman",
    immune: null,
    resource: "gold",
    actions: [
      { type: "ActionMove", range: 1, budget: 50 },
      { type: "ActionMelee", range: 1, budget: 100 },
    ],
  },
  {
    name: "builder",
    immune: null,
    resource: "gold",
    actions: [
      { type: "ActionMove", range: 1, budget: 100 },
      { type: "ActionBuild", range: 2, budget: 1 },
    ],
  },
  {
    name: "farmer",
    immune: null,
    resource: "food",
    actions: [
      { type: "ActionMove", range: 1, budget: 100 },
      { type: "ActionMelee", range: 1, budget: 100 },
    ],
  },
] as const;

ENTITIES_CLASSES satisfies readonly EntityClass[];

export const ENTITIES_TYPES = ENTITIES_CLASSES.map((e) => e.name);

export const getEntityClassFromName = createIdentifierGetter(
  ENTITIES_CLASSES,
  "name"
);

export function getEntityFromId(
  gameState: GameState,
  entityId: string
): Entity {
  return findWithIdentifer(gameState.entities, "entityId", entityId);
}

export function getEntityFromPosition(
  gameState: GameState,
  position: Position
): Entity | null {
  return (
    gameState.entities.find((e) => e.x == position.x && e.y == position.y) ??
    null
  );
}

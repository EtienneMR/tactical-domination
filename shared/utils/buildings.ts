import { createIdentifierGetter } from "./utils";

export const BUILDINGS_CLASSES = [
  {
    type: "castle",
    walkable: true,
    ownable: true,
    effects: [{ type: "food", value: 3 }],
  },
  {
    type: "mine",
    walkable: true,
    ownable: false,
    effects: [{ type: "gold", value: 2 }],
  },
  {
    type: "wheat",
    walkable: true,
    ownable: false,
    effects: [{ type: "food", value: 3 }],
  },
  {
    type: "pasture",
    walkable: true,
    ownable: false,
    effects: [{ type: "food", value: 3 }],
  },
  {
    type: "wall",
    walkable: false,
    ownable: true,
    effects: [],
  },
  {
    type: "lake",
    walkable: false,
    ownable: false,
    effects: [],
  },
  {
    type: "mountain",
    walkable: false,
    ownable: false,
    effects: [],
  },
  {
    type: "ruins",
    walkable: true,
    ownable: false,
    effects: [],
  },
] as const;

export const BUILDINGS_TYPES = BUILDINGS_CLASSES.map((b) => b.type);

export const getBuildingClassFromType = createIdentifierGetter(
  BUILDINGS_CLASSES,
  "type"
);

export function getCellFromPosition(
  gameState: GameState,
  position: Position
): Cell {
  const row = gameState.map[position.x];
  const cell = row ? row[position.y] : undefined;
  return ensureNotUndefined(cell);
}

export function leaveCell(cell: Cell, buildingClass: BuildingClass | null) {
  if (!buildingClass || !buildingClass.ownable) cell.owner = null;
}

export function performMove(
  gameState: GameState,
  entity: Entity,
  cell: Cell,
  buildingClass: BuildingClass | null
) {
  const currentCell = getCellFromPosition(gameState, entity);
  const currentBuildingClass = currentCell.building
    ? getBuildingClassFromType(currentCell.building)
    : null;

  leaveCell(currentCell, currentBuildingClass);

  gameState.events.push(`move_${cell.biome}`);

  if (buildingClass) {
    if (!buildingClass.walkable) {
      cell.building = "ruins";
      cell.owner = null;
      gameState.events.push(`build`);
    } else if (buildingClass.effects.length) {
      gameState.events.push(`collect_${cell.building}`);
    }
  }

  cell.owner = gameState.currentPlayer;
  entity.x = cell.x;
  entity.y = cell.y;
}

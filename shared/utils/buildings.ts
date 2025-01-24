import { createIdentifierGetter } from "./utils"

export const BUILDINGS_CLASSES = [
  {
    type: "castle",
    walkable: true,
    ownable: true,
    effects: [{ type: "food", value: 3 }]
  },
  {
    type: "mine",
    walkable: true,
    ownable: false,
    effects: [{ type: "gold", value: 2 }]
  },
  {
    type: "wheat",
    walkable: true,
    ownable: false,
    effects: [{ type: "food", value: 3 }]
  },
  {
    type: "pasture",
    walkable: true,
    ownable: false,
    effects: [{ type: "food", value: 3 }]
  },
  {
    type: "wall",
    walkable: false,
    ownable: true,
    effects: []
  },
  {
    type: "lake",
    walkable: false,
    ownable: false,
    effects: []
  },
  {
    type: "mountain",
    walkable: false,
    ownable: false,
    effects: []
  },
  {
    type: "ruins",
    walkable: true,
    ownable: false,
    effects: []
  }
] as const

export const BUILDINGS_TYPES = BUILDINGS_CLASSES.map(b => b.type)

export const getBuildingClassFromType = createIdentifierGetter(
  BUILDINGS_CLASSES,
  "type"
)

export function getCellFromPosition(
  gameState: GameState,
  position: Position
): Cell {
  const row = gameState.map[position.x]
  const cell = row ? row[position.y] : undefined
  return ensureNotUndefined(cell)
}

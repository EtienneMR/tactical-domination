import { GRID_SIZE } from "~~/shared/consts";

export function assertValidGame(
  game: Game | null,
  gid: string
): asserts game is Game {
  if (game == null)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Game "${gid}" not found`,
    });
}

export function assertGameInState(game: Game, state: GameState, gid: string) {
  if (game.state != state)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Game "${gid}" not ${state}`,
    });
}

export function assertValidEntity(
  entity: Entity | null,
  eid: string
): asserts entity is Entity {
  if (!entity)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Entity "${eid}" not found`,
    });
}

export function assertValidPlayer(
  player: Player | null,
  pid: string
): asserts player is Player {
  if (!player)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Player "${pid}" not found`,
    });
}

export function assertValidPosition(pos: {
  x: number;
  y: number;
}): asserts pos is Position {
  if (
    isNaN(pos.x) ||
    isNaN(pos.y) ||
    pos.x < 0 ||
    pos.y < 0 ||
    pos.x >= GRID_SIZE ||
    pos.y >= GRID_SIZE
  )
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Invalid position (${pos.x}, ${pos.y})`,
    });
}

export function assertValidString(
  str: unknown,
  query: string
): asserts str is string {
  if (typeof str != "string")
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Invalid ${query} query: not a valid string`,
    });
}

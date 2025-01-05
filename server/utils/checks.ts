import type { H3Event } from "h3";

export function assertValidGame(
  game: Game | null,
  gameId: string
): asserts game is Game {
  if (game == null)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `GameState "${gameId}" not found`,
    });
}

export function assertGameInStatus(
  gameState: GameState,
  gameStatus: GameStatus,
  gameId: string
) {
  if (gameState.status != gameStatus)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `GameState "${gameId}" not ${gameStatus}`,
    });
}

export function assertValidEntity(
  entity: Entity | null,
  entityId: string
): asserts entity is Entity {
  if (!entity)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Entity "${entityId}" not found`,
    });
}

export function assertValidPlayer(
  player: Player | null,
  userId: string
): asserts player is Player {
  if (!player)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Player "${userId}" not found`,
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
    pos.x >= MAP_SIZE ||
    pos.y >= MAP_SIZE
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

export function assertMatchingVersions(
  event: H3Event,
  game: Game,
  clientVersion: string
) {
  const runtimeConfig = useRuntimeConfig(event);

  const buildVersion = runtimeConfig.public.gitVersion;
  const gameVersion = game.version;

  if (
    runtimeConfig.public.gitVersion != game.version ||
    game.version != clientVersion
  )
    throw createError({
      message: `Version mismatch buildVersion = "${buildVersion}"; gameVersion = "${gameVersion}"; clientVersion = "${clientVersion}"`,
      statusCode: 409,
    });
}

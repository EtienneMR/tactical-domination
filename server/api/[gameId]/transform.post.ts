import { createValueError } from "~~/shared/utils/transformations/errors";

export default defineEventHandler(async (event) => {
  const gameId = getRouterParam(event, "gameId");
  const payload = await readBody(event);

  assertValidString(gameId, "params", "gameId");

  const kv = await useKv();
  const transformation = createTransformation(payload);

  await updateGame(kv, gameId, (game) => {
    if (!game)
      throw createValueError({
        object: "params",
        field: "gameId",
        expected: "gameId",
      });

    const gameState = structuredClone(game.state);
    transformation.apply(gameState);

    game.previousState = game.state;
    game.state = gameState;

    return game;
  });
});

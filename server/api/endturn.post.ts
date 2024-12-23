import { useKv } from "~~/server/utils/useKv";
import { getEntityClass } from "~~/shared/utils/entities";
import {
  assertCanPlay,
  getBuildingClass,
  getPlayer,
} from "~~/shared/utils/game";
import {
  assertGameInStatus,
  assertValidGame,
  assertValidPlayer,
  assertValidString,
} from "../utils/checks";

export default defineEventHandler(async (event) => {
  const { gid, uid } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(uid, "uid");

  const kv = await useKv();

  await updateGame(kv, gid, (game) => {
    assertValidGame(game, gid);

    const { state: gameState } = game;

    assertGameInStatus(gameState, "started", gid);

    const player = getPlayer(game, uid);
    assertValidPlayer(player, uid);
    assertCanPlay(gameState, player);

    for (const entity of gameState.entities) {
      if (entity.owner == gameState.turn) {
        entity.budget = 100;

        const entityClass = getEntityClass(entity.type);
        if (entityClass.resource == "gold") player.food -= 1;
      }
    }

    for (const cell of gameState.map) {
      if (cell.owner == gameState.turn && cell.building) {
        for (const effect of getBuildingClass(cell.building).effects) {
          player[effect.type] += effect.value;
        }
      }
    }

    for (let _ = 0; _ < -player.food; _++) {
      const entity = gameState.entities.find((e) => e.owner == player.index);
      if (entity) {
        entity.owner = null;

        const cell = getCellAt(gameState, entity);
        cell.owner = null;
      }
    }

    player.food = Math.max(player.food, 1);

    for (const player of gameState.players) {
      player.alive =
        gameState.map.some(
          (c) => c.building == "castle" && c.owner == player.index
        ) || gameState.entities.some((e) => e.owner == player.index);
    }

    const currentTurn = gameState.turn;

    while (true) {
      const turn = (gameState.turn =
        (gameState.turn + 1) % gameState.players.length);

      if (turn == currentTurn) {
        gameState.status = "ended";
        break;
      } else if (gameState.players[turn]!.alive) break;
    }

    gameState.events.push("end_turn");

    game.previousState = structuredClone(gameState);

    return game;
  });
});

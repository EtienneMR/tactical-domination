import { useKv } from "~~/server/utils/useKv";
import {
  assertCanPlay,
  getBuildingClass,
  getPlayer,
} from "~~/shared/utils/game";
import {
  assertGameInState,
  assertValidGame,
  assertValidString,
} from "../utils/checks";

export default defineEventHandler(async (event) => {
  const { gid, pid } = getQuery(event);

  assertValidString(gid, "gid");
  assertValidString(pid, "pid");

  const kv = await useKv();

  await updateGame(kv, gid, (game) => {
    assertValidGame(game, gid);
    assertGameInState(game, "started", gid);

    const player = getPlayer(game, pid);
    assertValidPlayer(player, pid);
    assertCanPlay(game, player);

    for (const entity of game.entities) {
      if (entity.owner == game.turn) {
        entity.used = false;
        player.food -= 1;
      }
    }

    for (const cell of game.map) {
      if (cell.owner == game.turn && cell.building) {
        for (const effect of getBuildingClass(cell.building).effects) {
          player[effect.type] += effect.value;
        }
      }
    }

    for (let _ = 0; _ < -player.food; _++) {
      game.entities.splice(
        game.entities.findIndex((e) => e.owner == player.index),
        1
      );
    }

    player.food = Math.max(player.food, 1);

    game.turn = (game.turn + 1) % game.players.length;
    return game;
  });
});

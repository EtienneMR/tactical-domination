import { useKv } from "~~/server/utils/useKv";
import { getEntityClass } from "~~/shared/utils/entities";
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
        entity.budget = 100;

        const entityClass = getEntityClass(entity.type);
        if (entityClass.ressource == "gold") player.food -= 1;
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
      const entity = game.entities.find((e) => e.owner == player.index);
      if (entity) {
        entity.owner = null;

        const cell = getCellAt(game, entity);
        cell.owner = null;
      }
    }

    player.food = Math.max(player.food, 1);

    for (const player of game.players) {
      player.alive =
        game.map.some(
          (c) => c.building == "castle" && c.owner == player.index
        ) || game.entities.some((e) => e.owner == player.index);
    }

    const currentTurn = game.turn;

    while (true) {
      const turn = (game.turn = (game.turn + 1) % game.players.length);

      if (turn == currentTurn) {
        game.state = "ended";
        break;
      } else if (game.players[turn]!.alive) break;
    }

    game.events.push("end_turn");

    return game;
  });
});

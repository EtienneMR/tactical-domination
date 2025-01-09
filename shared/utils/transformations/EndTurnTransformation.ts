import PlayerTransformation from "./PlayerTransformation";

export default class EndTurnTransformation
  extends PlayerTransformation
  implements Transformation
{
  static readonly type = "EnduTurn";

  apply(gameState: GameState) {
    const validateData = this.validate(gameState);
    const { player } = validateData;

    const playerEntties = gameState.entities.filter(
      (e) => e.owner == player.index
    );

    for (const entity of playerEntties) {
      entity.budget = 100;

      const entityClass = getEntityClassFromName(entity.className);
      if (entityClass.resource == "gold") player.ressources.food -= 1;
    }

    for (const cell of gameState.map.flat()) {
      if (cell.owner == player.index && cell.building) {
        for (const effect of getBuildingClassFromType(cell.building).effects) {
          player.ressources[effect.type] += effect.value;
        }
      }
    }

    for (let i = 0; i < -player.ressources.food; i++) {
      const entity = playerEntties[i];
      if (entity) {
        entity.owner = null;

        const cell = getCellFromPosition(gameState, entity);
        const buildingClass = cell.building
          ? getBuildingClassFromType(cell.building)
          : null;

        leaveCell(cell, buildingClass);
      }
    }

    player.ressources.food = Math.max(player.ressources.food, 1);

    for (const player of gameState.players) {
      player.alive =
        gameState.map
          .flat()
          .some((c) => c.building == "castle" && c.owner == player.index) ||
        gameState.entities.some((e) => e.owner == player.index);
    }

    const currentPlayer = gameState.currentPlayer;

    while (true) {
      const turn = (gameState.currentPlayer =
        (gameState.currentPlayer + 1) % gameState.players.length);

      if (turn == currentPlayer) {
        gameState.status = "ended";
        break;
      } else if (gameState.players[turn]!.alive) break;
    }

    gameState.events.push("end_turn");
  }

  toPayload() {
    return {
      type: EndTurnTransformation.type,
      playerIndex: this.playerIndex,
    };
  }

  static fromPayload(payload: EndTurnTransformation) {
    assertValidNumber(payload.playerIndex, "payload", "playerIndex");

    return new EndTurnTransformation(payload.playerIndex);
  }
}

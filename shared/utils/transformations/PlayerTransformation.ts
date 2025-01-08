import { createTransformationError } from "./errors";

export default abstract class PlayerTransformation {
  constructor(protected playerIndex: number) {}

  validate(gameState: GameState) {
    const player = getPlayerFromIndex(gameState, this.playerIndex);
    if (player.index != gameState.currentPlayer)
      throw createTransformationError({
        message: `Not currently player #${this.playerIndex}'s turn`,
      });

    return { player };
  }
}

import ActionTransformation from "./ActionTransformation";
import { createTransformationError } from "./errors";

export default class BuildActionTransformation
  extends ActionTransformation
  implements Transformation
{
  static readonly type = "RangedAction";

  override validate(gameState: GameState) {
    const validateData = super.validate(gameState);
    const { targetEntity, cell, player } = validateData;

    if (cell.building == "castle" && cell.owner == validateData.player.index)
      throw createTransformationError({
        message: `Can't destroy your own castle at (${cell.x}, ${cell.y})`,
      });

    return validateData;
  }

  override apply(gameState: GameState) {
    const validateData = this.validate(gameState);
    const { cell, player } = validateData;

    super.apply(gameState, validateData);

    gameState.events.push("build");

    const isEmpty = cell.building == null || cell.building == "ruins";

    if (!isEmpty) {
      cell.building = "ruins";
      cell.owner = null;
    } else {
      cell.building = gameState.map
        .flat()
        .some((c) => c.building == "castle" && c.owner == player.index)
        ? "wall"
        : "castle";
      cell.owner = player.index;
    }
  }

  toPayload() {
    return {
      type: BuildActionTransformation.type,
      playerIndex: this.playerIndex,
      entityId: this.entityId,
      actionType: this.actionType,
      position: this.position,
    };
  }

  static fromPayload(payload: TransformationPayload) {
    assertValidNumber(payload.playerIndex, "payload", "playerIndex");
    assertValidString(payload.entityId, "payload", "entityId");
    assertValidString(payload.actionType, "payload", "actionType");
    assertValidPosition(payload.position, "payload", "position");

    return new BuildActionTransformation(
      payload.playerIndex,
      payload.entityId,
      payload.actionType,
      payload.position
    );
  }
}

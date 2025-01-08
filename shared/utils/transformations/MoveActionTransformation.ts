import ActionTransformation from "./ActionTransformation";

export default class MoveActionTransformation
  extends ActionTransformation
  implements Transformation
{
  static readonly type = "MoveAction";

  override apply(gameState: GameState) {
    const validateData = this.validate(gameState);
    const { entity, cell, buildingClass } = validateData;

    super.apply(gameState, validateData);

    performMove(gameState, entity, cell, buildingClass);
  }

  toPayload() {
    return {
      type: MoveActionTransformation.type,
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

    return new MoveActionTransformation(
      payload.playerIndex,
      payload.entityId,
      payload.actionType,
      payload.position
    );
  }
}

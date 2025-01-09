import ActionTransformation from "./ActionTransformation";

export default class MoveActionTransformation
  extends ActionTransformation
  implements Transformation
{
  static override readonly type = "MoveAction";
  static override readonly actionTarget = null;
  static override readonly intentWalk = true;

  override apply(gameState: GameState) {
    const validateData = this.validate(gameState);

    super.apply(gameState, validateData);
  }

  toPayload() {
    return {
      type: MoveActionTransformation.type,
      playerIndex: this.playerIndex,
      entityId: this.entityId,
      position: this.position,
    };
  }

  static fromPayload(payload: TransformationPayload) {
    assertValidNumber(payload.playerIndex, "payload", "playerIndex");
    assertValidString(payload.entityId, "payload", "entityId");
    assertValidPosition(payload.position, "payload", "position");

    return new MoveActionTransformation(
      payload.playerIndex,
      payload.entityId,
      payload.position
    );
  }
}

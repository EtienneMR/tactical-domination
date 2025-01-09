import ActionTransformation from "./ActionTransformation";

export default class RangedActionTransformation
  extends ActionTransformation
  implements Transformation
{
  static override readonly type = "RangedAction";
  static override readonly actionTarget = "enemy";
  static override readonly intentWalk = false;

  override apply(gameState: GameState) {
    const validateData = this.validate(gameState);
    const { entity, cell, buildingClass, targetEntity } = validateData;

    super.apply(gameState, validateData);

    leaveCell(cell, buildingClass);
    gameState.entities = gameState.entities.filter(
      (e) => e.entityId != targetEntity!.entityId
    );
    gameState.events.push(`atk_${entity.className}`);
  }

  toPayload() {
    return {
      type: RangedActionTransformation.type,
      playerIndex: this.playerIndex,
      entityId: this.entityId,
      position: this.position,
    };
  }

  static fromPayload(payload: TransformationPayload) {
    assertValidNumber(payload.playerIndex, "payload", "playerIndex");
    assertValidString(payload.entityId, "payload", "entityId");
    assertValidPosition(payload.position, "payload", "position");

    return new RangedActionTransformation(
      payload.playerIndex,
      payload.entityId,
      payload.position
    );
  }
}

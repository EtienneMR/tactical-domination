import ActionTransformation from "./ActionTransformation";

export default class MeleeActionTransformation
  extends ActionTransformation
  implements Transformation
{
  static readonly type = "MeleeAction";

  override apply(gameState: GameState) {
    const validateData = this.validate(gameState);
    const { entity, cell, buildingClass, targetEntity } = validateData;

    super.apply(gameState, validateData);

    gameState.entities = gameState.entities.filter(
      (e) => e.entityId != targetEntity!.entityId
    );
    gameState.events.push(`atk_${entity.className}`);

    performMove(gameState, entity, cell, buildingClass);
  }

  toPayload() {
    return {
      type: MeleeActionTransformation.type,
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

    return new MeleeActionTransformation(
      payload.playerIndex,
      payload.entityId,
      payload.actionType,
      payload.position
    );
  }
}

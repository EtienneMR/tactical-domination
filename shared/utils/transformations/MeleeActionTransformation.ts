import ActionTransformation from "./ActionTransformation";

export default class MeleeActionTransformation
  extends ActionTransformation
  implements Transformation
{
  static override readonly type = "MeleeAction";
  static override readonly actionTarget = "enemy";
  static override readonly intentWalk = true;

  override apply(gameState: GameState) {
    const validateData = this.validate(gameState);
    const { entity, targetEntity } = validateData;

    super.apply(gameState, validateData);

    gameState.entities = gameState.entities.filter(
      (e) => e.entityId != targetEntity!.entityId
    );
    gameState.events.push(`atk_${entity.className}`);
  }

  toPayload() {
    return {
      type: MeleeActionTransformation.type,
      playerIndex: this.playerIndex,
      entityId: this.entityId,
      position: this.position,
    };
  }

  static fromPayload(payload: TransformationPayload) {
    assertValidNumber(payload.playerIndex, "payload", "playerIndex");
    assertValidString(payload.entityId, "payload", "entityId");
    assertValidPosition(payload.position, "payload", "position");

    return new MeleeActionTransformation(
      payload.playerIndex,
      payload.entityId,
      payload.position
    );
  }
}

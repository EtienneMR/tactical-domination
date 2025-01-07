export class MoveEntityTransformation implements Transformation {
  static readonly type = "MoveEntity";
  entityId: string;
  targetPosition: Position;

  constructor(entityId: string, targetPosition: Position) {
    this.entityId = entityId;
    this.targetPosition = targetPosition;
  }

  validate(gameState: GameState) {
    getEntityFromId(gameState, this.entityId);
  }

  apply(gameState: GameState) {
    const entity = getEntityFromId(gameState, this.entityId);
    entity.x = this.targetPosition.x;
    entity.y = this.targetPosition.y;
  }

  toPayload(): TransformationPayload {
    return {
      type: MoveEntityTransformation.type,
      entityId: this.entityId,
      targetPosition: this.targetPosition,
    };
  }

  static fromPayload(payload: TransformationPayload) {
    assertValidPayloadString(payload.entityId, "entityId");
    assertValidPayloadPosition(payload.targetPosition, "targetPosition");

    return new MoveEntityTransformation(
      payload.entityId,
      payload.targetPosition
    );
  }
}

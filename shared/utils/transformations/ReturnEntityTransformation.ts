import { createTransformationError } from "./errors";
import PlayerTransformation from "./PlayerTransformation";

export default class ReturnEntityTransformation
  extends PlayerTransformation
  implements Transformation
{
  static readonly type = "ReturnEntity";

  constructor(playerIndex: number, protected entityId: string) {
    super(playerIndex);
  }

  override validate(gameState: GameState) {
    const validateData = super.validate(gameState);

    const entity = getEntityFromId(gameState, this.entityId);
    const entityClass = getEntityClassFromName(entity.className);
    const cell = getCellFromPosition(gameState, entity);

    if (entity.budget < 100)
      throw createTransformationError({
        message: `Can not return entity "${entity.entityId}" with a budget < 100`,
      });

    if (cell.building != "castle")
      throw createTransformationError({
        message: `Can not return entity "${entity.entityId}" outside of a castle`,
      });

    if (cell.owner != validateData.player.index)
      throw createTransformationError({
        message: `Can not return entity "${entity.entityId}" on an enemy castle`,
      });

    return { ...validateData, entity, entityClass, cell };
  }

  apply(gameState: GameState) {
    const validateData = this.validate(gameState);
    const { player, entity, entityClass } = validateData;

    const spawnCost = getSpawnCost(gameState, player);

    player.ressources[entityClass.resource] += spawnCost[entity.className] - 1;

    gameState.entities.splice(
      gameState.entities.findIndex((e) => e.entityId == entity.entityId),
      1
    );

    gameState.events.push("unit_removed");
  }

  toPayload() {
    return {
      type: ReturnEntityTransformation.type,
      playerIndex: this.playerIndex,
      entityId: this.entityId,
    };
  }

  static fromPayload(payload: TransformationPayload) {
    assertValidNumber(payload.playerIndex, "payload", "playerIndex");
    assertValidString(payload.entityId, "payload", "entityId");

    return new ReturnEntityTransformation(
      payload.playerIndex,
      payload.entityId
    );
  }
}

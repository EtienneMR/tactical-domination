import { createTransformationError } from "./errors";
import PlayerTransformation from "./PlayerTransformation";

export default class CreateEntityTransformation
  extends PlayerTransformation
  implements Transformation
{
  static readonly type = "CreateEntity";

  constructor(
    playerIndex: number,
    protected position: Position,
    protected entityType: EntityType
  ) {
    super(playerIndex);
  }

  override validate(gameState: GameState) {
    const validateData = super.validate(gameState);
    const { player } = validateData;

    const cell = getCellFromPosition(gameState, this.position);
    const entityClass = getEntityClassFromName(this.entityType);
    const oldEntity = getEntityFromPosition(gameState, cell);
    const spawnCost = getSpawnCost(gameState, player);

    if (cell.building != "castle")
      throw createTransformationError({
        message: `Can not create an entity outside of a castle (${cell.x}, ${cell.y})`,
      });

    if (cell.owner != player.index)
      throw createTransformationError({
        message: `Can not create entity on an enemy castle (${cell.x}, ${cell.y})`,
      });

    if (oldEntity)
      throw createTransformationError({
        message: `Can not create an entity on an occupied castle (${cell.x}, ${cell.y})`,
      });

    if (player.ressources[entityClass.resource] < spawnCost[entityClass.name])
      throw createTransformationError({
        message: `Player "${player.index}" hasn't enough resources`,
      });

    return { ...validateData, entityClass, cell, spawnCost };
  }

  apply(gameState: GameState) {
    const validateData = this.validate(gameState);
    const { player, cell, entityClass, spawnCost } = validateData;

    player.ressources[entityClass.resource] -= spawnCost[entityClass.name];

    const entityId = gameState.uniqueIdCounter;
    gameState.uniqueIdCounter += 1;

    gameState.entities.push({
      entityId: `e${String(entityId).padStart(6, "0")}`,
      className: entityClass.name,
      owner: player.index,
      x: cell.x,
      y: cell.y,
      budget: 100,
    });

    gameState.events.push("unit_created");
  }

  toPayload() {
    return {
      type: CreateEntityTransformation.type,
      playerIndex: this.playerIndex,
      position: this.position,
      entityType: this.entityType,
    };
  }

  static fromPayload(payload: TransformationPayload) {
    assertValidNumber(payload.playerIndex, "payload", "playerIndex");
    assertValidPosition(payload.position, "payload", "position");
    assertValidString(payload.entityType, "payload", "entityType");

    const entityClass = getEntityClassFromName(payload.entityType);

    return new CreateEntityTransformation(
      payload.playerIndex,
      payload.position,
      entityClass.name
    );
  }
}

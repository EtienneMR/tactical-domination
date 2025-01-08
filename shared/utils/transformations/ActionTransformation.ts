import { createTransformationError } from "./errors";
import PlayerTransformation from "./PlayerTransformation";

export default abstract class ActionTransformation extends PlayerTransformation {
  constructor(
    playerIndex: number,
    protected entityId: string,
    protected actionType: string,
    protected position: Position
  ) {
    super(playerIndex);
  }

  override validate(gameState: GameState) {
    const { player } = super.validate(gameState);

    const entity = getEntityFromId(gameState, this.entityId);
    const entityClass = getEntityClassFromName(entity.className);
    const action = getActionFromEntityClass(entityClass, this.actionType);
    const actionData = getActionDataFromType(action.type);
    const cell = getCellFromPosition(gameState, this.position);
    const buildingClass = cell.building
      ? getBuildingClassFromType(cell.building)
      : null;
    const targetEntity = getEntityFromPosition(gameState, this.position);
    const targetEntityClass = targetEntity
      ? getEntityClassFromName(targetEntity.className)
      : null;

    if (entity.owner != player.index)
      throw createTransformationError({
        message: `Entity "${entity.entityId}" isn't owned by player #${player.index}`,
      });
    if (entity.budget <= 0)
      throw createTransformationError({
        message: `Entity "${entity.entityId}" has no budget left`,
      });
    if (player.ressources.food <= 0)
      throw createTransformationError({
        message: `Player #${player.index} has not enough food`,
      });
    if (
      actionData.walk &&
      cell.owner != player.index &&
      buildingClass &&
      !buildingClass.walkable
    )
      throw createTransformationError({
        message: `Building at (${cell.x}, ${cell.y}) isn't walkable`,
      });

    const targetDistance = Math.max(
      Math.abs(entity.x - cell.x),
      Math.abs(entity.y - cell.y)
    );

    if (targetDistance == 0 || targetDistance > action.range)
      throw createTransformationError({
        message: `Position (${cell.x}, ${cell.y}) isn't in range for action "${action.type}" with enity "${entity.entityId}"`,
      });

    if (
      (actionData.target != null || targetEntity != null) &&
      (actionData.target != "enemy" ||
        !targetEntity ||
        targetEntity.owner == gameState.currentPlayer ||
        !targetEntityClass ||
        targetEntityClass.immune == actionData.type)
    )
      throw createTransformationError({
        message: `Invalid target entity "${
          targetEntity?.entityId ?? null
        }" for action "${actionData.type}"`,
      });

    return {
      player,
      entity,
      entityClass,
      action,
      actionData,
      cell,
      buildingClass,
      targetEntity,
    };
  }

  apply(gameState: GameState, { player }: ReturnType<typeof this.validate>) {
    player.ressources.food -= 1;
  }
}

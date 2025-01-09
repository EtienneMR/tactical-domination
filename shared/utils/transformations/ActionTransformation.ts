import { createTransformationError } from "./errors";
import PlayerTransformation from "./PlayerTransformation";

export default abstract class ActionTransformation extends PlayerTransformation {
  static type: string;
  static actionTarget: "enemy" | null;
  static intentWalk: boolean;

  constructor(
    playerIndex: number,
    protected entityId: string,
    protected position: Position
  ) {
    super(playerIndex);
  }

  override validate(gameState: GameState) {
    const { player } = super.validate(gameState);

    const actionData = this.constructor as typeof ActionTransformation;

    const entity = getEntityFromId(gameState, this.entityId);
    const entityClass = getEntityClassFromName(entity.className);
    const action = getActionFromEntityClass(entityClass, actionData.type);
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
      actionData.intentWalk &&
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
      (actionData.actionTarget != null || targetEntity != null) &&
      (actionData.actionTarget != "enemy" ||
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

  apply(
    gameState: GameState,
    {
      player,
      entity,
      action,
      cell,
      buildingClass,
    }: ReturnType<typeof this.validate>
  ) {
    const actionData = this.constructor as typeof ActionTransformation;

    player.ressources.food -= 1;
    entity.budget -= action.budget;

    if (actionData.intentWalk)
      performMove(gameState, entity, cell, buildingClass);
  }
}

/*
{
  "type": "MoveAction",
  "playerIndex": 0,
  "entityId": "e000001",
  "position": {
    "x": 0,
    "y": 0
  }
}
{
  "type": "CreateEntity",
  "playerIndex": 0,
  "position": {
    "x": 0,
    "y": 0
  },
  "entityType": "melee"
}
*/

import { ENTITIES_CLASSES } from "~~/shared/consts";
import type { Entity, EntityClass } from "~~/shared/types";

export function getEntityClass(type: string) {
  const entityClass = ENTITIES_CLASSES.find((e) => e.type == type);

  if (!entityClass)
    throw createError({
      statusCode: 500,
      statusMessage: "Internal error",
      message: `Unknown entity type "${type}"`,
    });

  return entityClass;
}

export function getActionFromEntityClass(
  entityClass: EntityClass,
  actionName: string
) {
  const action = entityClass.actions.find((a) => a.type == actionName);

  if (!action)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Action "${actionName}" isn't defined for entity "${entityClass.type}"`,
    });

  return action;
}

export function hasEntityBudget(entity: Entity) {
  return entity.budget > 0;
}

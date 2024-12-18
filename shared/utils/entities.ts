import { ACTIONS_DATA, ENTITIES_CLASSES } from "~~/shared/consts";

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
  actionType: string
) {
  const action = entityClass.actions.find((a) => a.type == actionType);

  if (!action)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Action "${actionType}" isn't defined for entity "${entityClass.type}"`,
    });

  return action;
}

export function getActionDataFromType(actionType: string) {
  const actionData = ACTIONS_DATA.find((a) => a.type == actionType);

  if (!actionData)
    throw createError({
      statusCode: 500,
      statusMessage: "Internal error",
      message: `Unknown action type "${actionType}"`,
    });

  return actionData;
}

export function hasEntityBudget(entity: Entity) {
  return entity.budget > 0;
}

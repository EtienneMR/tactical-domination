import BuildActionTransformation from "./BuildActionTransformation";
import CreateEntityTransformation from "./CreateEntityTransformation";
import EndTurnTransformation from "./EndTurnTransformation";
import MeleeActionTransformation from "./MeleeActionTransformation";
import MoveActionTransformation from "./MoveActionTransformation";
import RangedActionTransformation from "./RangedActionTransformation";
import ReturnEntityTransformation from "./ReturnEntityTransformation";

const transformations = [
  MoveActionTransformation,
  MeleeActionTransformation,
  RangedActionTransformation,
  BuildActionTransformation,
  EndTurnTransformation,
  CreateEntityTransformation,
  ReturnEntityTransformation,
] satisfies TransformationClass[];

export function getTransformationClass(type: string): TransformationClass {
  const transformation = transformations.find((t) => t.type === type);

  if (!transformation) {
    throw new Error(`Invalid transformation requested: ${type} not found`);
  }

  return transformation;
}

export function createTransformation(payload: unknown): Transformation {
  assertValidPayload(payload);

  const transformationClass = getTransformationClass(payload.type);
  return transformationClass.fromPayload(payload);
}

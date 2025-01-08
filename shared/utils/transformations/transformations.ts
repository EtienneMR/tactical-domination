import BuildActionTransformation from "./BuildActionTransformation";
import MeleeActionTransformation from "./MeleeActionTransformation";
import MoveActionTransformation from "./MoveActionTransformation";
import RangedActionTransformation from "./RangedActionTransformation";

const transformations = [
  MoveActionTransformation,
  MeleeActionTransformation,
  RangedActionTransformation,
  BuildActionTransformation,
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

import { createValueError } from "./errors";

export function assertValidString(
  value: unknown,
  object: string,
  field: string
): asserts value is string {
  if (typeof value !== "string")
    throw createValueError({ object, field, expected: "string" });
}
export function assertValidOptionalString(
  value: unknown,
  object: string,
  field: string
): asserts value is string | undefined {
  if (value !== undefined && typeof value !== "string")
    throw createValueError({
      object,
      field,
      expected: "string or undefined",
    });
}

export function assertValidNumber(
  value: unknown,
  object: string,
  field: string
): asserts value is number {
  if (typeof value !== "number")
    throw createValueError({ object, field, expected: "number" });
}

export function assertValidObject(
  value: unknown,
  object: string,
  field?: string
): asserts value is { [key: string]: unknown } {
  if (typeof value !== "object" || value == null)
    throw createValueError({ object, field, expected: "object" });
}

export function assertValidPosition(
  value: unknown,
  object: string,
  field?: string
): asserts value is Position {
  try {
    assertValidObject(value, object, field);
    assertValidNumber(value.x, object, `${field}.x`);
    assertValidNumber(value.y, object, `${field}.y`);
  } catch (error) {
    throw createValueError({
      object,
      field,
      expected: "Position",
      cause: error,
    });
  }
}

export function assertValidPayload(
  value: unknown
): asserts value is TransformationPayload {
  try {
    assertValidObject(value, "payload");
    assertValidString(value.type, "payload", "type");
  } catch (error) {
    throw createValueError({
      object: "payload",
      expected: "Transformation",
      cause: error,
    });
  }
}

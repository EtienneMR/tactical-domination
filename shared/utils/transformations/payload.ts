import { createValueError } from "./errors";

export function assertValidPayloadString(
  value: unknown,
  field: string
): asserts value is string {
  if (typeof value !== "string")
    throw createError({
      statusCode: 404,
      statusMessage: `Invalid payload: ${field} is not a string`,
    });
}
export function assertValidPayloadOptionalString(
  value: unknown,
  field: string
): asserts value is string | undefined {
  if (value !== undefined && typeof value !== "string")
    throw createValueError({
      object: "payload",
      field,
      expected: "string or undefined",
    });
}

export function assertValidPayloadNumber(
  value: unknown,
  field: string
): asserts value is number {
  if (typeof value !== "number")
    throw createValueError({ object: "payload", field, expected: "number" });
}

export function assertValidPayloadObject(
  value: unknown,
  field: string
): asserts value is { [key: string]: unknown } {
  if (typeof value !== "object" || value == null)
    throw createValueError({ object: "payload", field, expected: "object" });
}

export function assertValidPayloadPosition(
  value: unknown,
  field: string
): asserts value is Position {
  try {
    assertValidPayloadObject(value, field);
    assertValidPayloadNumber(value.x, `${field}.x`);
    assertValidPayloadNumber(value.y, `${field}.y`);
  } catch (error) {
    throw createValueError({
      object: "payload",
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
    assertValidPayloadObject(value, "@root");
    assertValidPayloadString(value.type, "type");
  } catch (error) {
    throw createValueError({
      object: "payload",
      field: "@root",
      expected: "TransformationPayload",
      cause: error,
    });
  }
}

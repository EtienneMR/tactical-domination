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
    throw createError({
      statusCode: 404,
      statusMessage: `Invalid payload: ${field} is not an optional string`,
    });
}

export function assertValidPayloadNumber(
  value: unknown,
  field: string
): asserts value is number {
  if (typeof value !== "number")
    throw createError({
      statusCode: 404,
      statusMessage: `Invalid payload: ${field} is not a number`,
    });
}

export function assertValidPayloadObject(
  value: unknown,
  field: string
): asserts value is { [key: string]: unknown } {
  if (typeof value !== "object" || value == null)
    throw createError({
      statusCode: 404,
      statusMessage: `Invalid payload: ${field} is not an object`,
    });
}

export function assertValidPayloadPosition(
  value: unknown,
  field: string
): asserts value is Position {
  assertValidPayloadObject(value, field);
  assertValidPayloadNumber(value.x, `${field}.x`);
  assertValidPayloadNumber(value.y, `${field}.y`);
}

export function assertValidPayload(
  value: unknown
): asserts value is TransformationPayload {
  assertValidPayloadObject(value, "@root");
  assertValidPayloadString(value.type, "type");
}

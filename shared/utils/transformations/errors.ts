interface BaseErrorDetails {
  cause?: unknown;
}

interface ValueErrorDetails extends BaseErrorDetails {
  object: string;
  field: string;
  expected: string;
}

export const createValueError = ({
  object,
  field,
  expected,
  cause,
}: ValueErrorDetails) =>
  createError({
    statusCode: 400,
    statusMessage: `Invalid ${object}: ${field} is not of ${expected} type`,
    cause,
  });

interface TransformationErrorDetails extends BaseErrorDetails {
  message: string;
}

export const createTransformationError = ({
  message,
  cause,
}: TransformationErrorDetails) =>
  createError({
    statusCode: 409,
    statusMessage: `Attempted to apply conflicting transformation: ${message}`,
    cause,
  });

interface NotFoundErrorDetails extends BaseErrorDetails {
  resource: string;
  key: string;
  value: string;
}

export const createNotFoundError = ({
  resource,
  key,
  value,
  cause,
}: NotFoundErrorDetails) =>
  createError({
    statusCode: 404,
    statusMessage: `${resource} not found with "${key}" of "${value}"`,
    cause,
  });

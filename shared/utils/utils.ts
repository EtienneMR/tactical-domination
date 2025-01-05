export function ensureNotUndefined<T>(value: T | undefined): T {
  if (value === undefined) throw TypeError("Value is undefined");
  return value;
}

export function findWithIdentifer<E, K extends keyof E>(
  list: readonly E[],
  key: K,
  identifier: E[K] | string
): E {
  return ensureNotUndefined(
    list.find((element) => element[key] === identifier)
  );
}

export function createIdentifierGetter<E, K extends keyof E>(
  list: readonly E[],
  key: K
) {
  return function identifierGetter(identifier: E[K] | string): E {
    return findWithIdentifer(list, key, identifier);
  };
}

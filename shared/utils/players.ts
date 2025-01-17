export function getPlayerFromIndex(
  gameState: GameState,
  index: number
): Player {
  return ensureNotUndefined(gameState.players[index]);
}

export function getUserFromId(users: User[], userId: string): User {
  return ensureNotUndefined(users.find((user) => user.userId === userId));
}

export function getPlayerFromUserId(
  gameState: GameState,
  users: User[],
  userId: string
): Player | null {
  const index = getUserFromId(users, userId).index;
  return index != null ? getPlayerFromIndex(gameState, index) : null;
}

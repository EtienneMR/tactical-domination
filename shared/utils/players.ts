export function getPlayerFromIndex(
  gameState: GameState,
  index: number
): Player {
  return ensureNotUndefined(gameState.players[index])
}

export function getUserFromId(game: Game, userId: string): User {
  return ensureNotUndefined(game.users.find(user => user.userId === userId))
}

export function getPlayerFromUserId(game: Game, userId: string): Player | null {
  const index = getUserFromId(game, userId).index
  return index != null ? getPlayerFromIndex(game.state, index) : null
}

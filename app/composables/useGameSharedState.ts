export default function useGameSharedState() {
  const settings = useSettings();

  const users = reactive<User[]>([]);

  const gameState = reactive<GameState>({
    status: "unknown",
    players: [],
    entities: [],
    events: [],
    currentPlayer: 0,
    map: [],
    uniqueIdCounter: 0,
  });

  const me = computed(() =>
    getPlayerFromUserId(gameState, users, settings.userId)
  );

  return { settings, gameState, users, me };
}

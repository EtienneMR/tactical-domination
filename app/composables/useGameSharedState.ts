export default function useGameSharedState() {
  const settings = useSettings();
  const game = ref(null);

  return { settings, game };
}

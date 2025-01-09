export default async function applyTransformation(
  transformation: Transformation,
  gameState: GameState,
  gameId: string
) {
  const payload = transformation.toPayload();

  transformation.apply(gameState);

  await $fetch(`/api/${gameId}/transform`, {
    method: "POST",
    body: payload,
  });
}

const ITEM_NAME = "playerId";

export default function usePlayerId(): string {
  let id = localStorage.getItem(ITEM_NAME);
  if (!id) {
    id = `u${Math.floor(Math.random() * 1000000)}`;
    localStorage.setItem(ITEM_NAME, id);
  }
  return id;
}

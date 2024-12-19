const ITEM_KEY = "userId";

export default function useUserId(): string {
  let id = localStorage.getItem(ITEM_KEY);
  if (!id) {
    id = `u${Math.floor(Math.random() * 1000000)}`;
    localStorage.setItem(ITEM_KEY, id);
  }
  return id;
}

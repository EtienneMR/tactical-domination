export class Room {
  constructor(public roomid: string) {}
}

export const rooms: Room[] = [];

export function getRoom(roomId: string): Room {
  const found = rooms.find((r) => r.roomid == roomId);
  if (found) return found;

  const created = new Room(roomId);
  rooms.push(created);
  return created;
}

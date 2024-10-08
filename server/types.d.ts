import type { Peer } from "crossws";
import { Room } from "~~/server/game/Room";

interface PeerRoom extends Peer {
  room: Room;
}

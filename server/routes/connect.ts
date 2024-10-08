import { getRoom } from "~~/server/game/Room";
import { PeerRoom } from "~~/server/types";

export default defineWebSocketHandler({
  open(_peer) {
    const peer = _peer as PeerRoom;

    const url = peer.request?.url;
    const roomid = url ? new URL(url).searchParams.get("room") : null;

    if (!roomid) return peer.close(1, "Invalid room");
    peer.room = getRoom(roomid);

    peer.send({ user: "server", message: `Welcome ${peer}!` });
    peer.publish(
      roomid,
      JSON.stringify({ user: "server", message: `${peer} joined!` })
    );
    peer.subscribe(roomid);
  },
  message(_peer, message) {
    const peer = _peer as PeerRoom;

    if (message.text().includes("ping")) {
      peer.send({ user: "server", message: "pong" });
    } else {
      const msg = {
        user: peer.toString(),
        message: message.toString(),
      };
      peer.send(msg); // echo
      peer.publish(peer.room.roomid, JSON.stringify(msg));
    }
  },
  close(_peer) {
    const peer = _peer as PeerRoom;

    peer.publish(
      peer.room.roomid,
      JSON.stringify({ user: "server", message: `${peer} left!` })
    );
  },
});

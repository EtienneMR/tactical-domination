export default defineWebSocketHandler({
  open(peer) {
    peer.send({ user: "server", message: `Welcome ${peer}!` });
    peer.publish(
      "chat",
      JSON.stringify({ user: "server", message: `${peer} joined!` })
    );
    peer.subscribe("chat");
  },
  message(peer, message) {
    if (message.text().includes("ping")) {
      peer.send({ user: "server", message: "pong" });
    } else {
      const msg = {
        user: peer.toString(),
        message: message.toString(),
      };
      peer.send(msg); // echo
      peer.publish("chat", JSON.stringify(msg));
    }
  },
  close(peer) {
    peer.publish(
      "chat",
      JSON.stringify({ user: "server", message: `${peer} left!` })
    );
  },
});

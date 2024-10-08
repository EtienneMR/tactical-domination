const STATES = [
  "CLOSED",
  "CLOSING",
  "CONNECTING",
  "OPEN",
] satisfies (keyof WebSocket)[];
const DEFAULT_STATE = "Unknown";

export default function useWebSocket(
  path: string,
  onmessage: (data: string, evt: MessageEvent) => void
) {
  const url = new URL(
    path,
    `${location.protocol.replace("http", "ws")}//${location.host}`
  );
  const websocket = new WebSocket(url.href);

  const state: Ref<(typeof STATES)[number] | typeof DEFAULT_STATE> =
    ref(DEFAULT_STATE);

  const update = () => {
    state.value =
      STATES.find((state) => websocket.readyState == websocket[state]) ??
      DEFAULT_STATE;
  };

  const processMessage = async (evt: MessageEvent) => {
    const { data } = evt;
    onmessage(typeof data == "string" ? data : await data.text(), evt);
  };

  const events: [string, (evt: any) => void][] = [
    ["open", update],
    ["close", update],
    ["message", processMessage],
  ];

  for (const event of events) {
    websocket.addEventListener(event[0], event[1]);
  }

  onUnmounted(() => {
    websocket.close();
    for (const event of events) {
      websocket.removeEventListener(event[0], event[1]);
    }
  });

  update();

  return {
    state,
    websocket,
  };
}

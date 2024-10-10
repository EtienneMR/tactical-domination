import usePlayerId from "./usePlayerId";

const STATES = ["CLOSED", "CONNECTING", "OPEN"] satisfies (keyof EventSource)[];
const DEFAULT_STATE = "Unknown";

export default function useEventSource<T>(
  gid: string,
  onmessage: (data: T, evt: MessageEvent) => void
) {
  const playerId = usePlayerId();

  const eventsource = new EventSource(
    `/api/game?gid=${encodeURIComponent(gid)}&pid=${playerId}`,
    {}
  );

  const state: Ref<(typeof STATES)[number] | typeof DEFAULT_STATE> =
    ref(DEFAULT_STATE);

  const update = () => {
    state.value =
      STATES.find((state) => eventsource.readyState == eventsource[state]) ??
      DEFAULT_STATE;
  };

  const processMessage = async (evt: MessageEvent) => {
    const { data } = evt;
    onmessage(
      JSON.parse(typeof data == "string" ? data : await data.text()),
      evt
    );
  };

  const events: [string, (evt: any) => void][] = [
    ["open", update],
    ["close", update],
    ["message", processMessage],
  ];

  for (const event of events) {
    eventsource.addEventListener(event[0], event[1]);
  }

  onUnmounted(() => {
    eventsource.close();
    for (const event of events) {
      eventsource.removeEventListener(event[0], event[1]);
    }
  });

  update();

  return {
    state,
    eventsource,
    update,
  };
}

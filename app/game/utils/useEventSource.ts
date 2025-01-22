import displayError from "./displayError"

const STATES = ["CLOSED", "CONNECTING", "OPEN"] satisfies (keyof EventSource)[]
const DEFAULT_STATE = "Unknown"

export default function useEventSource<T>(
  url: string,
  onmessage: (data: T, evt: MessageEvent) => void,
  state: Ref<(typeof STATES)[number] | typeof DEFAULT_STATE>
) {
  const eventsource = new EventSource(url, {})

  const update = () => {
    state.value =
      STATES.find(state => eventsource.readyState == eventsource[state]) ??
      DEFAULT_STATE
  }

  const processMessage = async (evt: MessageEvent) => {
    const { data } = evt
    if (data)
      onmessage(
        JSON.parse(typeof data == "string" ? data : await data.text()),
        evt
      )
  }

  const events: [string, (evt: any) => void][] = [
    ["open", update],
    ["close", update],
    [
      "error",
      async ({ data }) => {
        if (data) {
          eventsource.close()
          update()
          const error = createError({
            name: "EventSourceError",
            message: typeof data == "string" ? data : await data.text()
          })
          displayError("Erreur de connexion", error.message, error)
        }
      }
    ],
    ["message", processMessage]
  ]

  for (const event of events) {
    eventsource.addEventListener(event[0], event[1])
  }

  const destroy = () => {
    eventsource.close()
    for (const event of events) {
      eventsource.removeEventListener(event[0], event[1])
    }
  }

  update()

  return {
    state,
    eventsource,
    update,
    destroy
  }
}

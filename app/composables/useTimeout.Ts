import { ref } from "vue";

export default function useTimeout<T>(value: T, activated: T, timeout: number) {
  const r = ref(value);

  let timeoutId;

  const reset = () => (r.value = value);

  const activate = () => {
    clearTimeout(timeoutId);
    r.value = activated;
    timeoutId = setTimeout(reset, timeout);
  };

  return {
    ref: r,
    activate,
  };
}

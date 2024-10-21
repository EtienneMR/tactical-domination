const toast = useToast();

// @ts-expect-error
window.toast = toast;

export default function displayError(
  title: string,
  message: string,
  error: any,
  fatal: boolean
) {
  console.error(new Error(`${title}: ${message}`, { cause: error }));
  onNuxtReady(() => {
    toast.add({
      title,
      description: `${message}\n${error instanceof Error ? error.name : error}`,
      color: "red",
      icon: "i-heroicons-exclamation-triangle-16-solid",
      timeout: fatal ? Infinity : 15 * 1000,
      actions: [{ label: "Actualiser", click: () => location.reload() }],
    });
  });
}

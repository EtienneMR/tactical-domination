export default function displayError(
  title: string,
  message: string,
  error: any,
  action?: () => void
) {
  const toast = useToast()

  console.error(new Error(`${title}: ${message}`, { cause: error }))
  toast.add({
    title,
    description: `${message}\n${error instanceof Error ? error.name : error}`,
    color: "red",
    icon: "i-heroicons-exclamation-triangle-16-solid",
    timeout: action ? 0 : 15 * 1000,
    actions: action ? [{ label: "Réessayer", click: action }] : undefined
  })
}

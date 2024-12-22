const DEFAULT_LENGTH = 6;

export default function generateId(
  prefix: string,
  length: number = DEFAULT_LENGTH
) {
  return (
    prefix +
    String(Math.floor(Math.random() * Math.pow(10, length))).padStart(
      length,
      "0"
    )
  );
}

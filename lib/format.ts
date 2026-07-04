export function formatDateTime(value: string) {
  const directDate = new Date(value);
  const date = Number.isNaN(directDate.getTime())
    ? new Date(value.replace(" ", "T"))
    : directDate;

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

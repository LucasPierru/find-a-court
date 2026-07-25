const eventDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatEventDateTime(iso: string): string {
  return eventDateTimeFormatter.format(new Date(iso));
}

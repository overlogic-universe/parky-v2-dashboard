export function TodayDate() {
  return (
    <h1 className="mb-3 text-gray-800 dark:text-gray-400 font-semibold text-xl">
      {new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date())}
    </h1>
  );
}

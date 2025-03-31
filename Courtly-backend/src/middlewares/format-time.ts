export function formatDate(isoDate: string): string {
  try {
    const dateObj = new Date(isoDate);
    if (isNaN(dateObj.getTime())) throw new Error("Invalid date");
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}

export function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) throw new Error("Invalid time");
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = (((hours + 11) % 12) + 1).toString();
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid Time";
  }
}

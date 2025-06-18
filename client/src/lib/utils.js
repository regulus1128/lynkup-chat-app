export function formatMessageTime(date) {
  const messageDate = new Date(date);
  
  const dateString = messageDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long", // Full month name like "June"
    year: "numeric",
  });
  
  const timeString = messageDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // AM/PM format
  });
  
  return `${dateString} at ${timeString}`;
}
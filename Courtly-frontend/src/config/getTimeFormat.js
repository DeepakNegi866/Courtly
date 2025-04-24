const ConvertToAMPM = (time24) => {
    if (!time24 || typeof time24 !== "string") {
      console.error("Invalid input:", time24); // Log invalid input for debugging
      return
    }
  
    time24 = time24.trim();
  
    if (!/^\d{1,2}:\d{2}$/.test(time24)) {
      throw new Error("Invalid time format. Use HH:mm (24-hour format).");
    }
  
    const [hours, minutes] = time24.split(":").map(Number);
  
    // Validate time range
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error("Invalid time. Hours must be 0-23 and minutes 0-59.");
    }
  
    const suffix = hours >= 12 ? "PM" : "AM";
    const convertedHours = hours % 12 || 12;
    return `${convertedHours}:${minutes.toString().padStart(2, "0")} ${suffix}`;
  };
export default ConvertToAMPM  
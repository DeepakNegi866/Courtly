export const formatDateToReadableString = (dateString) => {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

export const formatTimeToIST = (dateString) => {
  const date = new Date(dateString);

  // Convert date to Indian Standard Time (UTC +5:30)
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  };

  return date.toLocaleTimeString("en-IN", options);
};

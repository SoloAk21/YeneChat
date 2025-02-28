// utils/utils.js

export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    month: "short",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

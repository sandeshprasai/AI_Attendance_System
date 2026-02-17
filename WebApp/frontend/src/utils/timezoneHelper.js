/**
 * Frontend Timezone Utility for Kathmandu, Nepal (UTC+5:45)
 * Handles date formatting and conversions for display
 */

const KATHMANDU_OFFSET_MS = (5 * 60 + 45) * 60 * 1000; // UTC+5:45 in milliseconds

/**
 * Get current time in Kathmandu timezone
 * @returns {Date}
 */
export const getKathmanduTime = () => {
  const now = new Date();
  // Simply add Kathmandu offset to current UTC time
  // getTime() returns milliseconds since epoch (timezone-independent)
  return new Date(now.getTime() + KATHMANDU_OFFSET_MS);
};

/**
 * Convert any date to Kathmandu timezone
 * @param {Date|string} date
 * @returns {Date}
 */
export const convertToKathmandu = (date) => {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  // Add Kathmandu offset to the input date
  return new Date(inputDate.getTime() + KATHMANDU_OFFSET_MS);
};

/**
 * Format date for Kathmandu timezone (YYYY-MM-DD)
 * @param {Date|string} date
 * @returns {string}
 */
export const formatKathmanduDate = (date) => {
  const kathmanduDate = convertToKathmandu(date);
  
  // Use UTC methods since kathmanduDate is now adjusted to Kathmandu time
  const year = kathmanduDate.getUTCFullYear();
  const month = String(kathmanduDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kathmanduDate.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format date and time for Kathmandu timezone
 * @param {Date|string} date
 * @returns {object} { date: 'DD/MM/YYYY', time: 'HH:MM' }
 */
export const formatKathmanduDateTime = (date) => {
  const kathmanduDate = convertToKathmandu(date);
  
  // Use UTC methods since kathmanduDate is now adjusted to Kathmandu time
  const day = String(kathmanduDate.getUTCDate()).padStart(2, '0');
  const month = String(kathmanduDate.getUTCMonth() + 1).padStart(2, '0');
  const year = kathmanduDate.getUTCFullYear();
  
  const hours = String(kathmanduDate.getUTCHours()).padStart(2, '0');
  const minutes = String(kathmanduDate.getUTCMinutes()).padStart(2, '0');
  
  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`
  };
};

/**
 * Format time ago relative to Kathmandu timezone
 * @param {Date|string} date
 * @returns {string}
 */
export const formatKathmanduTimeAgo = (date) => {
  const now = getKathmanduTime();
  const inputDate = convertToKathmandu(date);
  const diffInSeconds = Math.floor((now - inputDate) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

/**
 * Get today's date in Kathmandu timezone (YYYY-MM-DD format)
 * @returns {string}
 */
export const getTodayKathmandu = () => {
  return formatKathmanduDate(new Date());
};

/**
 * Get current date-time string for Kathmandu timezone
 * @returns {string} Format: "DD MMM YYYY, HH:MM NPT"
 */
export const getKathmanduDateTimeString = () => {
  const kathmanduDate = getKathmanduTime();
  
  // Use UTC methods to extract date parts
  const options = { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC' // Use UTC since we've already adjusted the date
  };
  
  const formatted = kathmanduDate.toLocaleDateString('en-GB', options);
  return `${formatted} NPT`;
};

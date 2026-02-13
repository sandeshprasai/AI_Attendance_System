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
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcTime + KATHMANDU_OFFSET_MS);
};

/**
 * Convert any date to Kathmandu timezone
 * @param {Date|string} date
 * @returns {Date}
 */
export const convertToKathmandu = (date) => {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const utcTime = inputDate.getTime() + (inputDate.getTimezoneOffset() * 60000);
  return new Date(utcTime + KATHMANDU_OFFSET_MS);
};

/**
 * Format date for Kathmandu timezone (YYYY-MM-DD)
 * @param {Date|string} date
 * @returns {string}
 */
export const formatKathmanduDate = (date) => {
  const kathmanduDate = convertToKathmandu(date);
  
  const year = kathmanduDate.getFullYear();
  const month = String(kathmanduDate.getMonth() + 1).padStart(2, '0');
  const day = String(kathmanduDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format date and time for Kathmandu timezone
 * @param {Date|string} date
 * @returns {object} { date: 'DD/MM/YYYY', time: 'HH:MM' }
 */
export const formatKathmanduDateTime = (date) => {
  const kathmanduDate = convertToKathmandu(date);
  
  const day = String(kathmanduDate.getDate()).padStart(2, '0');
  const month = String(kathmanduDate.getMonth() + 1).padStart(2, '0');
  const year = kathmanduDate.getFullYear();
  
  const hours = String(kathmanduDate.getHours()).padStart(2, '0');
  const minutes = String(kathmanduDate.getMinutes()).padStart(2, '0');
  
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
  
  const options = { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  const formatted = kathmanduDate.toLocaleDateString('en-GB', options);
  return `${formatted} NPT`;
};

/**
 * Timezone Utility for Kathmandu, Nepal (UTC+5:45)
 * Handles all date conversions to ensure consistency across the application
 */

const KATHMANDU_OFFSET_MINUTES = 5 * 60 + 45; // UTC+5:45 in minutes

/**
 * Get current date/time in Kathmandu timezone
 * @returns {Date} Date object representing current time in Kathmandu
 */
const getKathmanduTime = () => {
  const now = new Date();
  // Add Kathmandu offset to UTC time
  return new Date(now.getTime() + (KATHMANDU_OFFSET_MINUTES * 60000) - (now.getTimezoneOffset() * 60000));
};

/**
 * Parse date string as if it's in Kathmandu timezone and get start of that day
 * @param {string|Date} dateInput - Date string like "2026-02-14" or Date object
 * @returns {Date} Start of day in UTC (representing midnight Kathmandu time)
 */
const parseAndNormalizeKathmanduDate = (dateInput) => {
  let year, month, day;
  
  if (typeof dateInput === 'string') {
    // Parse date string assuming it represents a date in Kathmandu
    const parts = dateInput.split('T')[0].split('-');
    year = parseInt(parts[0]);
    month = parseInt(parts[1]) - 1; // JS months are 0-indexed
    day = parseInt(parts[2]);
  } else {
    // Use current Kathmandu date
    const kathmanduNow = getKathmanduTime();
    year = kathmanduNow.getFullYear();
    month = kathmanduNow.getMonth();
    day = kathmanduNow.getDate();
  }
  
  // Create midnight in Kathmandu for this date
  // Then convert to UTC by subtracting the offset
  const kathmanduMidnight = Date.UTC(year, month, day, 0, 0, 0, 0);
  return new Date(kathmanduMidnight - (KATHMANDU_OFFSET_MINUTES * 60000));
};

/**
 * Get start and end of today in Kathmandu timezone (as UTC dates for DB queries)
 * @returns {Object} { startOfDay, endOfDay } in UTC
 */
const getTodayKathmanduRange = () => {
  const kathmanduNow = getKathmanduTime();
  const year = kathmanduNow.getFullYear();
  const month = kathmanduNow.getMonth();
  const day = kathmanduNow.getDate();
  
  // Start of day: Kathmandu midnight -> UTC
  const startOfDayUTC = Date.UTC(year, month, day, 0, 0, 0, 0);
  const startOfDay = new Date(startOfDayUTC - (KATHMANDU_OFFSET_MINUTES * 60000));
  
  // End of day: Kathmandu 23:59:59.999 -> UTC
  const endOfDayUTC = Date.UTC(year, month, day, 23, 59, 59, 999);
  const endOfDay = new Date(endOfDayUTC - (KATHMANDU_OFFSET_MINUTES * 60000));
  
  return { startOfDay, endOfDay };
};

/**
 * Get start of day for a specific date in Kathmandu timezone
 * @param {Date|string} date - Date to get start of day for
 * @returns {Date} Start of day in UTC (representing midnight Kathmandu time)
 */
const getKathmanduStartOfDay = (date) => {
  if (typeof date === 'string') {
    return parseAndNormalizeKathmanduDate(date);
  }
  
  // Convert date to Kathmandu time and get its start of day
  const kathmanduDate = new Date(date.getTime() + (KATHMANDU_OFFSET_MINUTES * 60000) - (date.getTimezoneOffset() * 60000));
  const year = kathmanduDate.getFullYear();
  const month = kathmanduDate.getMonth();
  const day = kathmanduDate.getDate();
  
  const startOfDayUTC = Date.UTC(year, month, day, 0, 0, 0, 0);
  return new Date(startOfDayUTC - (KATHMANDU_OFFSET_MINUTES * 60000));
};

/**
 * Get end of day for a specific date in Kathmandu timezone
 * @param {Date|string} date - Date to get end of day for
 * @returns {Date} End of day in UTC (representing 23:59:59.999 Kathmandu time)
 */
const getKathmanduEndOfDay = (date) => {
  if (typeof date === 'string') {
    const startOfDay = parseAndNormalizeKathmanduDate(date);
    return new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000) - 1);
  }
  
  // Convert date to Kathmandu time and get its end of day
  const kathmanduDate = new Date(date.getTime() + (KATHMANDU_OFFSET_MINUTES * 60000) - (date.getTimezoneOffset() * 60000));
  const year = kathmanduDate.getFullYear();
  const month = kathmanduDate.getMonth();
  const day = kathmanduDate.getDate();
  
  const endOfDayUTC = Date.UTC(year, month, day, 23, 59, 59, 999);
  return new Date(endOfDayUTC - (KATHMANDU_OFFSET_MINUTES * 60000));
};

/**
 * Convert any UTC date to Kathmandu timezone for display
 * @param {Date} date - UTC date
 * @returns {Date} Date adjusted to show Kathmandu time
 */
const convertToKathmandu = (date) => {
  return new Date(date.getTime() + (KATHMANDU_OFFSET_MINUTES * 60000) - (date.getTimezoneOffset() * 60000));
};

/**
 * Format date for Kathmandu timezone
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string (YYYY-MM-DD HH:MM:SS)
 */
const formatKathmanduDate = (date) => {
  const kathmanduDate = convertToKathmandu(date);
  
  const year = kathmanduDate.getFullYear();
  const month = String(kathmanduDate.getMonth() + 1).padStart(2, '0');
  const day = String(kathmanduDate.getDate()).padStart(2, '0');
  const hours = String(kathmanduDate.getHours()).padStart(2, '0');
  const minutes = String(kathmanduDate.getMinutes()).padStart(2, '0');
  const seconds = String(kathmanduDate.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

module.exports = {
  KATHMANDU_OFFSET_MINUTES,
  getKathmanduTime,
  getKathmanduStartOfDay,
  getKathmanduEndOfDay,
  convertToKathmandu,
  formatKathmanduDate,
  getTodayKathmanduRange,
  parseAndNormalizeKathmanduDate
};


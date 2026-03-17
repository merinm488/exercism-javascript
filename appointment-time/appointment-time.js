// @ts-check

/**
 * Create an appointment
 *
 * @param {number} days
 * @param {number} [now] (ms since the epoch, or undefined)
 *
 * @returns {Date} the appointment
 */
export function createAppointment(days, now = new Date())
{
    const current = new Date(now);
    let todayDate = current.getDate();
    current.setDate(todayDate + days);
    return current;
}


/**
 * Generate the appointment timestamp
 *
 * @param {Date} appointmentDate
 *
 * @returns {string} timestamp
 */
export function getAppointmentTimestamp(appointmentDate) {
  const date = new Date(appointmentDate);
  return date.toISOString();
}

/** 
 * Get details of an appointment
 *
 * @param {string} timestamp (ISO 8601)
 *
 * @returns {Record<'year' | 'month' | 'date' | 'hour' | 'minute', number>} the appointment details
 */
export function getAppointmentDetails(timestamp) {
  const date = new Date(timestamp);
  let time = {}
  time.year = date.getFullYear();
  time.month = date.getMonth();
  time.date = date.getDate();
  time.hour = date.getHours();
  time.minute = date.getMinutes();

  return time;
}

/**
 * Update an appointment with given options
 *
 * @param {string} timestamp (ISO 8601)
 * @param {Partial<Record<'year' | 'month' | 'date' | 'hour' | 'minute', number>>} options
 *
 * @returns {Record<'year' | 'month' | 'date' | 'hour' | 'minute', number>} the appointment details
 */
export function updateAppointment(timestamp, options) {
  const date = new Date(timestamp);
  if (options.year != undefined)
    {
      date.setFullYear(options.year)
    } 
  if (options.month != undefined)
    {
      date.setMonth(options.month)
    } 
  if (options.date != undefined)
    {
      date.setDate(options.date)
    } 
  if (options.hour != undefined)
    {
      date.setHours(options.hour)
    } 
  if (options.minute != undefined)
    {
      date.setMinutes(options.minute)
    } 
  return getAppointmentDetails(date);
}

/**
 * Get available time in seconds (rounded) between two appointments
 *
 * @param {string} timestampA (ISO 8601)
 * @param {string} timestampB (ISO 8601)
 *
 * @returns {number} amount of seconds (rounded)
 */
export function timeBetween(timestampA, timestampB) {
  const date1 = new Date(timestampA);
  const date2 = new Date(timestampB);
  const diff = Math.round(Math.abs(((date1 - date2))/1000));
  return diff;
}

/**
 * Get available times between two appointment
 *
 * @param {string} appointmentTimestamp (ISO 8601)
 * @param {string} currentTimestamp (ISO 8601)
 */
export function isValid(appointmentTimestamp, currentTimestamp) {
  const date1 = new Date(appointmentTimestamp);
  const date2 = new Date(currentTimestamp);  
  if (date1 > date2) return true;
  else return false;
}

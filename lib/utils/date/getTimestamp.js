import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Returns a formatted date string in the format of "YYYY-MM-DDTHH:mm:ss.SSSZ" (ISO 8601)
 * with optional milliseconds included
 *
 * @param {Date} date
 * @param {{ withMilliseconds: boolean }} options
 * @return {string}
 */
const getTimestamp = (date = new Date(), { withMilliseconds = false } = {}) => {
  const currentTimezone = dayjs.tz.guess();
  const dateWithTimezone = dayjs(date).tz(currentTimezone);

  return dateWithTimezone.format(
    `YYYY-MM-DDTHH:mm:ss${withMilliseconds ? '.SSS' : ''}Z`,
  );
};

export default getTimestamp;

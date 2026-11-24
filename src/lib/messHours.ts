import { MessOperatingStatus } from '@/types';

// Mess operates from 22:30 IST (10:30 PM) to 24:00 IST (12:00 AM Midnight)
export const MESS_OPEN_HOUR = 22; // 22:30
export const MESS_OPEN_MINUTE = 30;
export const MESS_CLOSE_HOUR = 24; // 24:00 (00:00 midnight)
export const MESS_CLOSE_MINUTE = 0;

/**
 * Returns current date/time converted to IST (Indian Standard Time, UTC +5:30)
 */
export function getISTDate(date = new Date()): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3600000);
}

export function formatISTTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Calculates whether the mess is currently open in IST
 * and returns formatted countdown strings.
 */
export function getMessOperatingStatus(forceOverride = false): MessOperatingStatus {
  const now = new Date();
  const ist = getISTDate(now);

  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const seconds = ist.getSeconds();

  const currentMinutesFromMidnight = hours * 60 + minutes;
  const openMinutesFromMidnight = MESS_OPEN_HOUR * 60 + MESS_OPEN_MINUTE; // 1350 mins (22:30)
  const closeMinutesFromMidnight = MESS_CLOSE_HOUR * 60 + MESS_CLOSE_MINUTE; // 1440 mins (24:00)

  const isActuallyOpen =
    currentMinutesFromMidnight >= openMinutesFromMidnight &&
    currentMinutesFromMidnight < closeMinutesFromMidnight;

  const isOpen = forceOverride || isActuallyOpen;

  let statusText = '';
  let timeRemainingFormatted = '00:00:00';
  let nextEventText = '';

  if (isOpen) {
    // Calculate seconds remaining until 24:00 (midnight IST)
    const secondsRemaining = (closeMinutesFromMidnight - currentMinutesFromMidnight) * 60 - seconds;
    const clampedSec = Math.max(0, secondsRemaining);
    const hrs = Math.floor(clampedSec / 3600);
    const mins = Math.floor((clampedSec % 3600) / 60);
    const secs = clampedSec % 60;

    timeRemainingFormatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    statusText = `OPEN • Closes in ${timeRemainingFormatted}`;
    nextEventText = `Closes at 12:00 AM IST`;
  } else {
    // Mess is closed: calculate time until next 22:30 IST
    let secondsUntilOpen = 0;
    if (currentMinutesFromMidnight < openMinutesFromMidnight) {
      // Opening later today
      secondsUntilOpen = (openMinutesFromMidnight - currentMinutesFromMidnight) * 60 - seconds;
    } else {
      // Past midnight, opening tomorrow at 22:30
      const minutesUntilMidnight = 1440 - currentMinutesFromMidnight;
      secondsUntilOpen = (minutesUntilMidnight + openMinutesFromMidnight) * 60 - seconds;
    }

    const clampedSec = Math.max(0, secondsUntilOpen);
    const hrs = Math.floor(clampedSec / 3600);
    const mins = Math.floor((clampedSec % 3600) / 60);
    const secs = clampedSec % 60;

    timeRemainingFormatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    statusText = `OPENS AT 10:30 PM • in ${timeRemainingFormatted}`;
    nextEventText = `Next window: 10:30 PM – 12:00 AM IST`;
  }

  return {
    isOpen,
    statusText,
    timeRemainingFormatted,
    nextEventText,
    isOverrideActive: forceOverride && !isActuallyOpen,
    istTimeString: formatISTTime(now),
  };
}

import { isToday, isPast, isWithinInterval, addDays, addMonths, startOfDay, parseISO } from 'date-fns';

export function isOverdue(dueDate: string): boolean {
  const date = startOfDay(new Date(dueDate));
  const today = startOfDay(new Date());
  return isPast(date) && date.getTime() !== today.getTime();
}

export function isDueToday(dueDate: string): boolean {
  return isToday(new Date(dueDate));
}

export function isDueThisWeek(dueDate: string): boolean {
  const date = new Date(dueDate);
  const today = startOfDay(new Date());
  const weekFromNow = addDays(today, 7);

  return isWithinInterval(date, { start: today, end: weekFromNow });
}

export function getDaysUntilDue(dueDate: string): number {
  const date = startOfDay(new Date(dueDate));
  const today = startOfDay(new Date());
  const diff = date.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDueStatus(dueDate: string): string {
  const days = getDaysUntilDue(dueDate);

  if (days === 0) {
    return 'Due Today';
  } else if (days === 1) {
    return 'Due Tomorrow';
  } else if (days < 0) {
    return `${Math.abs(days)} days overdue`;
  } else {
    return `Due in ${days} days`;
  }
}

export function formatDateForInput(dateString: string): string {
  if (!dateString) return '';
  const date = parseISO(dateString + 'T00:00:00');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateForDatabase(dateString: string): string {
  if (!dateString) return '';
  return dateString;
}

export function calculateNextRecurringDate(
  currentDate: string,
  interval: 'monthly' | 'quarterly' | 'semi-annually'
): string {
  const date = parseISO(currentDate + 'T00:00:00');
  let nextDate: Date;

  switch (interval) {
    case 'monthly':
      nextDate = addMonths(date, 1);
      break;
    case 'quarterly':
      nextDate = addMonths(date, 3);
      break;
    case 'semi-annually':
      nextDate = addMonths(date, 6);
      break;
    default:
      nextDate = date;
  }

  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const day = String(nextDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRecurringIntervalLabel(
  interval: 'monthly' | 'quarterly' | 'semi-annually' | null
): string {
  switch (interval) {
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Every 3 Months';
    case 'semi-annually':
      return 'Every 6 Months';
    default:
      return '';
  }
}

export function getShootStatusLabel(status: 'not_booked' | 'booked' | 'completed'): string {
  switch (status) {
    case 'not_booked':
      return 'Not Booked';
    case 'booked':
      return 'Booked';
    case 'completed':
      return 'Completed';
    default:
      return '';
  }
}

export function needsShootWarning(
  shootStatus: 'not_booked' | 'booked' | 'completed',
  contentDueDate: string | null
): boolean {
  if (shootStatus !== 'not_booked' || !contentDueDate) {
    return false;
  }

  const contentDue = parseISO(contentDueDate + 'T00:00:00');
  const today = startOfDay(new Date());
  const twoWeeksFromNow = addDays(today, 14);

  return contentDue <= twoWeeksFromNow;
}

export function getShootStatusColor(status: 'not_booked' | 'booked' | 'completed'): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'not_booked':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/30',
      };
    case 'booked':
      return {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
      };
    case 'completed':
      return {
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        border: 'border-green-500/30',
      };
    default:
      return {
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
      };
  }
}

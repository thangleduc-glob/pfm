/**
 * Formatting utilities for displaying data in the frontend
 * Handles currency, dates, and number formatting
 */

/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @param locale - The locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formats a date for display
 * @param date - The date to format (string or Date object)
 * @param locale - The locale for formatting (default: en-US)
 * @param options - Additional formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Formats a date with time
 * @param date - The date to format (string or Date object)
 * @param locale - The locale for formatting (default: en-US)
 * @returns Formatted date-time string
 */
export function formatDateTime(
  date: string | Date,
  locale: string = 'en-US'
): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formats a date for input fields (YYYY-MM-DD)
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Formats a month for display (YYYY-MM)
 * @param date - The date to format
 * @returns Month string in YYYY-MM format
 */
export function formatMonth(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}

/**
 * Formats a month for display (Month YYYY)
 * @param month - The month string in YYYY-MM format
 * @param locale - The locale for formatting (default: en-US)
 * @returns Formatted month string
 */
export function formatMonthDisplay(
  month: string,
  locale: string = 'en-US'
): string {
  const [year, monthNum] = month.split('-').map(Number);
  
  if (isNaN(year) || isNaN(monthNum)) {
    return 'Invalid month';
  }

  const date = new Date(year, monthNum - 1, 1);
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long'
  }).format(date);
}

/**
 * Formats a number with thousands separators
 * @param num - The number to format
 * @param locale - The locale for formatting (default: en-US)
 * @returns Formatted number string
 */
export function formatNumber(num: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Formats a percentage
 * @param value - The value to format (0-1)
 * @param decimals - Number of decimal places (default: 1)
 * @param locale - The locale for formatting (default: en-US)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Truncates text to a specified length
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Formats a transaction type for display
 * @param type - The transaction type
 * @returns Formatted transaction type
 */
export function formatTransactionType(type: 'income' | 'expense'): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Formats a category type for display
 * @param type - The category type
 * @returns Formatted category type
 */
export function formatCategoryType(type: 'income' | 'expense'): string {
  return formatTransactionType(type);
}

/**
 * Gets the appropriate CSS class for a transaction amount
 * @param type - The transaction type
 * @returns CSS class name
 */
export function getAmountClass(type: 'income' | 'expense'): string {
  return type === 'income' ? 'amount-positive' : 'amount-negative';
}

/**
 * Formats a relative time (e.g., "2 hours ago", "3 days ago")
 * @param date - The date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) {
    return formatDate(dateObj);
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}
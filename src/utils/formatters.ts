/**
 * Utility functions for formatting data
 */

/**
 * Formats a date to a localized string
 * @param date The date to format
 * @param locale The locale to use for formatting (defaults to en-US)
 * @returns Formatted date string
 */
export function formatDate(date: Date, locale: string = "en-US"): string {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a number as currency
 * @param amount The amount to format
 * @param currencyCode The currency code (defaults to DOP for Dominican Peso)
 * @param locale The locale to use for formatting (defaults to en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = "DOP",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

/**
 * Formats an address object into a string
 * @param address The address object
 * @returns Formatted address string
 */
export function formatAddress(address: {
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}): string {
  const parts = [];

  if (address.street) {
    parts.push(address.street + (address.number ? " " + address.number : ""));
  }

  if (address.city) {
    parts.push(address.city);
  }

  if (address.state) {
    parts.push(address.state);
  }

  if (address.country) {
    parts.push(address.country);
  }

  if (address.postalCode) {
    parts.push(address.postalCode);
  }

  return parts.join(", ");
}

/**
 * Formats a rating as stars (e.g., "★★★★☆")
 * @param rating The rating value (0-5)
 * @returns String of stars representing the rating
 */
export function formatRatingAsStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return "★".repeat(fullStars) + (halfStar ? "½" : "") + "☆".repeat(emptyStars);
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param text The text to truncate
 * @param maxLength The maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + "...";
}

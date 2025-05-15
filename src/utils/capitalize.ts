/**
 * Capitalize the first character of a string.
 *
 * @param {string} s - The string to capitalize.
 * @returns {string} The input string with its first character in uppercase.
 */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

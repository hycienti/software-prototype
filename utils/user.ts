/**
 * User utility functions
 */

/**
 * Extract first name from full name
 * @param fullName - User's full name (e.g., "John Doe" or "John")
 * @returns First name or fallback
 */
export function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) {
    return 'there';
  }

  const trimmed = fullName.trim();
  if (!trimmed) {
    return 'there';
  }

  // Split by space and get first part
  const parts = trimmed.split(/\s+/);
  return parts[0] || 'there';
}

/**
 * Get greeting based on time of day
 * @returns Greeting string
 */
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good Morning';
  } else if (hour < 17) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
}

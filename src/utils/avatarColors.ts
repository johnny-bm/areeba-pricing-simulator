/**
 * Utility functions for generating consistent avatar colors based on user names
 */

// Design system colors from the chart palette
const AVATAR_COLORS = [
  { bg: 'bg-chart-1', text: 'text-white' },
  { bg: 'bg-chart-2', text: 'text-white' },
  { bg: 'bg-chart-3', text: 'text-white' },
  { bg: 'bg-chart-4', text: 'text-white' },
  { bg: 'bg-chart-5', text: 'text-white' },
  // Additional colors for variety
  { bg: 'bg-blue-500', text: 'text-white' },
  { bg: 'bg-green-500', text: 'text-white' },
  { bg: 'bg-purple-500', text: 'text-white' },
  { bg: 'bg-pink-500', text: 'text-white' },
  { bg: 'bg-indigo-500', text: 'text-white' },
  { bg: 'bg-teal-500', text: 'text-white' },
  { bg: 'bg-orange-500', text: 'text-white' },
  { bg: 'bg-cyan-500', text: 'text-white' },
  { bg: 'bg-emerald-500', text: 'text-white' },
  { bg: 'bg-violet-500', text: 'text-white' },
];

/**
 * Generate initials from a name
 * @param name - The full name (e.g., "John Doe")
 * @returns The initials (e.g., "JD")
 */
export function getInitials(name: string): string {
  if (!name || name.trim() === '') {
    return 'U'; // Default for users without names
  }

  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate consistent avatar colors based on a name
 * Uses a simple hash function to ensure the same name always gets the same colors
 * @param name - The name to generate colors for
 * @returns Object with background and text color classes
 */
export function getAvatarColors(name: string): { bg: string; text: string } {
  if (!name || name.trim() === '') {
    return AVATAR_COLORS[0]; // Default color
  }

  // Simple hash function to convert name to a number
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get a valid index
  const colorIndex = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
}

/**
 * Get avatar props for a user
 * @param name - The user's full name
 * @returns Object with initials and color classes
 */
export function getAvatarProps(name: string): {
  initials: string;
  bgClass: string;
  textClass: string;
} {
  const initials = getInitials(name);
  const colors = getAvatarColors(name);
  
  return {
    initials,
    bgClass: colors.bg,
    textClass: colors.text,
  };
}

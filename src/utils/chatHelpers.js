import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { AVATAR_COLORS, STATUS_COLORS, AUTO_RESPONSE_MESSAGES } from './chatConstants';

/**
 * Get a consistent color for a user based on their ID
 */
export const getAvatarColor = (userId) => {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
};

/**
 * Get status color with type safety
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status];
};

/**
 * Format timestamp in a human-readable way
 * Shows relative time for today, exact time for yesterday,
 * and date for older messages
 */
export const formatMessageTime = (date) => {
  const parsedDate = new Date(date); // ✅ convert string to Date
  const now = new Date();

  if (isToday(parsedDate)) {
    return format(parsedDate, 'h:mm a');
  } else if (isYesterday(parsedDate)) {
    return 'Yesterday';
  } else if (isThisWeek(parsedDate)) {
    return format(parsedDate, 'EEEE');
  } else {
    return format(parsedDate, 'MMM d, yyyy');
  }
};


/**
 * Format timestamp for list items - shows relative time
 */
export const formatListItemTime = (date) => {
  const parsedDate = new Date(date); // ✅ handle string input

  if (isNaN(parsedDate)) return "";

  const now = new Date();
  const diffMs = now.getTime() - parsedDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return format(parsedDate, 'h:mm a');
  } else if (diffDays < 7) {
    return format(parsedDate, 'EEEE');
  } else {
    return format(parsedDate, 'MMM d');
  }
};


/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * Get a random auto-response message
 */
export const getRandomAutoResponse = () => {
  return AUTO_RESPONSE_MESSAGES[Math.floor(Math.random() * AUTO_RESPONSE_MESSAGES.length)];
};

/**
 * Check if a message is recent (within last hour)
 */
export const isRecentMessage = (date) => {
  const now = new Date();
  const diffMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
  return diffMinutes < 60;
};

/**
 * Get initials from a name
 */
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Check if user has unread messages
 */
export const hasUnreadMessages = (unreadCount) => {
  return unreadCount > 0;
};

/**
 * Format message count for display
 */
export const formatMessageCount = (count) => {
  if (count > 99) {
    return '99+';
  }
  return count.toString();
};

/**
 * Debounce function for search
 */
export const debounce = (func, wait) => {
  let timeout = null;
  
  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};
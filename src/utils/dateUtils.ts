// File: src/utils/dateUtils.ts

// Helper to get today's date string (YYYY-MM-DD)
const getTodayDateString = (): string => new Date().toISOString().slice(0, 10);

/**
 * Checks if a stored date string matches today's date.
 */
export const isToday = (dateString: string | undefined): boolean => {
    if (!dateString) return false;
    return dateString.slice(0, 10) === getTodayDateString();
};

/**
 * Checks if a stored date string matches yesterday's date.
 */
export const isYesterday = (dateString: string | undefined): boolean => {
    if (!dateString) return false;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    return dateString.slice(0, 10) === yesterday;
};

/**
 * Calculates the next streak value based on the last login.
 * This should only be called once per day when the user makes their first count.
 */
export const calculateNewStreak = (lastLoginDate: string, currentStreak: number): number => {
    if (!lastLoginDate) return 1;

    if (isToday(lastLoginDate)) {
        // Streak is not broken or continued yet today; return current streak
        return currentStreak;
    } else if (isYesterday(lastLoginDate)) {
        // Continued streak
        return currentStreak + 1;
    } else {
        // Broken streak
        return 1;
    }
};
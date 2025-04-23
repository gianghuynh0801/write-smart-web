/**
 * Utility for working with localStorage to store user preferences and credentials
 * Note: In a production app, sensitive data should be stored securely on the backend
 */

// Keys for localStorage
export const LOCAL_STORAGE_KEYS = {
  THEME: 'writesmart_theme',
  LANGUAGE: 'writesmart_language',
  WORDPRESS_CREDENTIALS: 'writesmart_wp_creds',
  SESSION_TOKEN: 'writesmart_session',
  USER_PREFERENCES: 'writesmart_preferences',
  WEBHOOK_URL: 'writesmart_webhook_url',
};

// Get an item from localStorage with optional JSON parsing
export const getItem = <T>(key: string, parseJson: boolean = true): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return null;
    return parseJson ? JSON.parse(item) : (item as unknown as T);
  } catch (error) {
    console.error(`Error getting item from localStorage for key "${key}":`, error);
    return null;
  }
};

// Set an item in localStorage with automatic JSON stringify
export const setItem = <T>(key: string, value: T): void => {
  try {
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, valueToStore);
  } catch (error) {
    console.error(`Error setting item in localStorage for key "${key}":`, error);
  }
};

// Remove an item from localStorage
export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from localStorage for key "${key}":`, error);
  }
};

// Clear all app-related items from localStorage
export const clearAll = (): void => {
  try {
    Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing all items from localStorage:', error);
  }
};

// Get user preferences with defaults
interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  notificationsEnabled: boolean;
  editorFontSize: number;
}

export const getUserPreferences = (): UserPreferences => {
  const defaults: UserPreferences = {
    theme: 'light',
    language: 'vi',
    notificationsEnabled: true,
    editorFontSize: 16
  };
  
  const stored = getItem<UserPreferences>(LOCAL_STORAGE_KEYS.USER_PREFERENCES);
  return { ...defaults, ...stored };
};

// Save user preferences
export const saveUserPreferences = (preferences: Partial<UserPreferences>): void => {
  const current = getUserPreferences();
  const updated = { ...current, ...preferences };
  setItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES, updated);
};

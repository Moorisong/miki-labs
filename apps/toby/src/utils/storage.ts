
const STORAGE_PREFIX = 'TRT_';

export const saveToStorage = (key: string, value: any) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(STORAGE_PREFIX + key, serializedValue);
  } catch (error) {
    console.error('Error saving to storage', error);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedValue = localStorage.getItem(STORAGE_PREFIX + key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error('Error loading from storage', error);
    return defaultValue;
  }
};

export const STORAGE_KEYS = {
  TOTAL_STUDENTS: 'TOTAL_STUDENTS',
  EXCLUDE_LIST: 'EXCLUDE_LIST',
  PICK_COUNT: 'PICK_COUNT',
};

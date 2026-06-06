const cloneValue = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

export const delay = (milliseconds = 450) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const readJsonStore = (key, fallbackValue) => {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) return cloneValue(fallbackValue);

  try {
    return JSON.parse(rawValue);
  } catch {
    return cloneValue(fallbackValue);
  }
};

export const writeJsonStore = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
};

export const nextId = (prefix, list) => {
  const count = Array.isArray(list) ? list.length + 1 : 1;
  return `${prefix}-${String(count).padStart(3, '0')}`;
};
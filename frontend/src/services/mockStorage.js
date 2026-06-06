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
const cloneValue = (value) => {
const cloneValue = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

export const delay = (milliseconds = 450) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const readJsonStore = (key, fallback) => {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) return cloneValue(fallback);

  try {
    return JSON.parse(rawValue);
  } catch {
    return cloneValue(fallback);
  }

  try {
    return JSON.parse(raw);
  } catch {
    return cloneValue(fallback);
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
};

export const readSessionJson = (key, fallback) => {
  const raw = sessionStorage.getItem(key);
  if (!raw) {
    return cloneValue(fallback);
  }

  try {
    return JSON.parse(raw);
  } catch {
    return cloneValue(fallback);
  }
};

export const writeSessionJson = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
  return value;
};

export const nextId = (prefix, list) => {
  const count = Array.isArray(list) ? list.length + 1 : 1;
  return `${prefix}-${String(count).padStart(3, '0')}`;
};

export const nowStamp = () => new Date().toISOString();
const STORAGE_PREFIX = 'vb_';

export const STORAGE_KEYS = {
  users: `${STORAGE_PREFIX}demo_users`,
  vendors: `${STORAGE_PREFIX}vendors`,
  rfqs: `${STORAGE_PREFIX}rfqs`,
  quotations: `${STORAGE_PREFIX}quotations`,
  purchaseOrders: `${STORAGE_PREFIX}purchase_orders`,
  invoices: `${STORAGE_PREFIX}invoices`,
  activityFeed: `${STORAGE_PREFIX}activity_feed`,
  notifications: `${STORAGE_PREFIX}notifications`,
  authToken: `${STORAGE_PREFIX}auth_token`,
  authUser: `${STORAGE_PREFIX}auth_user`,
  theme: `${STORAGE_PREFIX}theme`,
};

const clone = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

export const readJsonStore = (key, fallbackValue) => {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) return clone(fallbackValue);
  try {
    return JSON.parse(rawValue);
  } catch {
    return clone(fallbackValue);
  }
};

export const writeJsonStore = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
};

export const removeStoreValue = (key) => {
  localStorage.removeItem(key);
};

export const readSessionValue = (key) => sessionStorage.getItem(key);

export const writeSessionValue = (key, value) => {
  sessionStorage.setItem(key, value);
};

export const removeSessionValue = (key) => {
  sessionStorage.removeItem(key);
};

export const ensureJsonStore = (key, seedValue) => {
  if (!localStorage.getItem(key)) {
    writeJsonStore(key, seedValue);
  }
  return readJsonStore(key, seedValue);
};

export const nextSequentialId = (items, prefix) => {
  const maxNumeric = items.reduce((maxValue, item) => {
    const match = String(item.id || '').match(/(\d+)$/);
    if (!match) return maxValue;
    const parsed = Number(match[1]);
    return Number.isNaN(parsed) ? maxValue : Math.max(maxValue, parsed);
  }, 0);

  return `${prefix}${String(maxNumeric + 1).padStart(3, '0')}`;
};

export const createMockToken = (payload) => {
  const raw = JSON.stringify({
    ...payload,
    issuedAt: Date.now(),
  });

  return `vb.mock.${btoa(unescape(encodeURIComponent(raw)))}`;
};

export const decodeMockToken = (token) => {
  if (!token || !token.startsWith('vb.mock.')) return null;
  try {
    const encoded = token.slice('vb.mock.'.length);
    const decoded = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const delay = (milliseconds = 450) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const cloneValue = clone;
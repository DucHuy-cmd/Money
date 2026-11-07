import { getTodayDateString, getPreviousMonthKey } from './utils';

const PREFIX_MONTH = '@month_data_';
const KEY_MONTHS_LIST = '@months_list';
const KEY_SETTINGS = '@app_settings';

const DEFAULT_SETTINGS = {
  reminderHour: 18,
  reminderMinute: 0,
  reminderEnabled: true,
};

export const getAllMonthKeys = () => {
  try {
    const raw = localStorage.getItem(KEY_MONTHS_LIST);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.sort().reverse() : [];
  } catch (e) {
    return [];
  }
};

const registerMonthKey = (monthKey) => {
  try {
    const list = getAllMonthKeys();
    if (!list.includes(monthKey)) {
      list.push(monthKey);
      list.sort().reverse();
      localStorage.setItem(KEY_MONTHS_LIST, JSON.stringify(list));
    }
  } catch (e) {
    console.error(e);
  }
};

export const getMonthData = (monthKey) => {
  try {
    const raw = localStorage.getItem(PREFIX_MONTH + monthKey);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const saveMonthData = (monthKey, data) => {
  localStorage.setItem(PREFIX_MONTH + monthKey, JSON.stringify(data));
  registerMonthKey(monthKey);
  return data;
};

export const isMonthConfigured = (monthKey) => {
  const data = getMonthData(monthKey);
  return Boolean(data && data.setupCompleted);
};

export const initializeMonth = (monthKey, { budget = 0, fixedExpenses = [] }) => {
  const existing = getMonthData(monthKey);
  const newData = {
    monthKey,
    budget: Number(budget) || 0,
    setupCompleted: true,
    fixedExpenses: fixedExpenses.map((item, idx) => ({
      id: item.id || `fix_${Date.now()}_${idx}`,
      name: item.name.trim(),
      amount: Number(item.amount) || 0,
      paid: Boolean(item.paid),
      paidDate: item.paidDate || null,
    })),
    dailyExpenses: existing?.dailyExpenses || [],
    noExpenseDays: existing?.noExpenseDays || [],
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveMonthData(monthKey, newData);
  return newData;
};

export const addDailyExpense = (monthKey, { categoryId, categoryName, amount, note = '', date, time }) => {
  const data = getMonthData(monthKey) || {
    monthKey,
    budget: 0,
    setupCompleted: false,
    fixedExpenses: [],
    dailyExpenses: [],
    noExpenseDays: [],
  };

  const newExpense = {
    id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    categoryId,
    categoryName,
    amount: Number(amount),
    note: (note || '').trim(),
    date: date || getTodayDateString(),
    time: time || new Date().toTimeString().substring(0, 5),
    createdAt: new Date().toISOString(),
  };

  const updatedNoExpenseDays = (data.noExpenseDays || []).filter((d) => d !== newExpense.date);

  const updatedData = {
    ...data,
    dailyExpenses: [newExpense, ...(data.dailyExpenses || [])],
    noExpenseDays: updatedNoExpenseDays,
    updatedAt: new Date().toISOString(),
  };

  saveMonthData(monthKey, updatedData);
  return { updatedData, newExpense };
};

export const deleteDailyExpense = (monthKey, expenseId) => {
  const data = getMonthData(monthKey);
  if (!data) return null;

  const updatedData = {
    ...data,
    dailyExpenses: (data.dailyExpenses || []).filter((item) => item.id !== expenseId),
    updatedAt: new Date().toISOString(),
  };

  saveMonthData(monthKey, updatedData);
  return updatedData;
};

export const toggleFixedExpensePaid = (monthKey, fixedId) => {
  const data = getMonthData(monthKey);
  if (!data) return null;

  const today = getTodayDateString();
  const updatedFixed = (data.fixedExpenses || []).map((item) => {
    if (item.id === fixedId) {
      const nextPaid = !item.paid;
      return {
        ...item,
        paid: nextPaid,
        paidDate: nextPaid ? today : null,
      };
    }
    return item;
  });

  const updatedData = {
    ...data,
    fixedExpenses: updatedFixed,
    updatedAt: new Date().toISOString(),
  };

  saveMonthData(monthKey, updatedData);
  return updatedData;
};

export const markDayAsNoExpense = (monthKey, dateStr = getTodayDateString()) => {
  const data = getMonthData(monthKey) || {
    monthKey,
    budget: 0,
    setupCompleted: false,
    fixedExpenses: [],
    dailyExpenses: [],
    noExpenseDays: [],
  };

  const daysSet = new Set(data.noExpenseDays || []);
  daysSet.add(dateStr);

  const updatedData = {
    ...data,
    noExpenseDays: Array.from(daysSet),
    updatedAt: new Date().toISOString(),
  };

  saveMonthData(monthKey, updatedData);
  return updatedData;
};

export const hasUserLoggedToday = (monthKey, todayStr = getTodayDateString()) => {
  const data = getMonthData(monthKey);
  if (!data) return false;

  const hasExpense = (data.dailyExpenses || []).some((item) => item.date === todayStr);
  if (hasExpense) return true;

  return (data.noExpenseDays || []).includes(todayStr);
};

export const getPreviousMonthPreset = (currentMonthKey) => {
  const prevKey = getPreviousMonthKey(currentMonthKey);
  const prevData = getMonthData(prevKey);
  if (!prevData) return null;

  return {
    monthKey: prevKey,
    budget: prevData.budget,
    fixedExpenses: (prevData.fixedExpenses || []).map((item) => ({
      ...item,
      paid: false,
      paidDate: null,
    })),
  };
};

export const getSettings = () => {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings) => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(updated));
  return updated;
};

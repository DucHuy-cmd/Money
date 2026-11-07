import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayDateString, getPreviousMonthKey } from '../utils/format';

const PREFIX_MONTH = '@month_data_';
const KEY_MONTHS_LIST = '@months_list';
const KEY_SETTINGS = '@app_settings';

const DEFAULT_SETTINGS = {
  reminderHour: 18,
  reminderMinute: 0,
  reminderEnabled: true,
};

/**
 * Get all tracked month keys (e.g. ['2026-10', '2026-11'])
 */
export const getAllMonthKeys = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY_MONTHS_LIST);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.sort().reverse() : [];
  } catch (e) {
    console.error('Error getting month keys:', e);
    return [];
  }
};

/**
 * Register a month key into the index
 */
const registerMonthKey = async (monthKey) => {
  try {
    const list = await getAllMonthKeys();
    if (!list.includes(monthKey)) {
      list.push(monthKey);
      list.sort().reverse();
      await AsyncStorage.setItem(KEY_MONTHS_LIST, JSON.stringify(list));
    }
  } catch (e) {
    console.error('Error registering month key:', e);
  }
};

/**
 * Get full data for a specific month
 */
export const getMonthData = async (monthKey) => {
  try {
    const raw = await AsyncStorage.getItem(PREFIX_MONTH + monthKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading data for ${monthKey}:`, e);
    return null;
  }
};

/**
 * Save data for a specific month
 */
export const saveMonthData = async (monthKey, data) => {
  try {
    await AsyncStorage.setItem(PREFIX_MONTH + monthKey, JSON.stringify(data));
    await registerMonthKey(monthKey);
    return data;
  } catch (e) {
    console.error(`Error saving data for ${monthKey}:`, e);
    throw e;
  }
};

/**
 * Check if a month is already configured with initial budget and fixed costs
 */
export const isMonthConfigured = async (monthKey) => {
  const data = await getMonthData(monthKey);
  return Boolean(data && data.setupCompleted);
};

/**
 * Initialize a new month with initial budget & fixed costs
 */
export const initializeMonth = async (monthKey, { budget = 0, fixedExpenses = [] }) => {
  const existing = await getMonthData(monthKey);
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
      icon: item.icon || 'card-outline',
    })),
    dailyExpenses: existing?.dailyExpenses || [],
    noExpenseDays: existing?.noExpenseDays || [],
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveMonthData(monthKey, newData);
  return newData;
};

/**
 * Add a daily flexible expense
 */
export const addDailyExpense = async (monthKey, { categoryId, categoryName, amount, note = '', date, time }) => {
  const data = (await getMonthData(monthKey)) || {
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

  // If user entered an expense today, remove today from noExpenseDays if present
  const updatedNoExpenseDays = (data.noExpenseDays || []).filter((d) => d !== newExpense.date);

  const updatedData = {
    ...data,
    dailyExpenses: [newExpense, ...(data.dailyExpenses || [])],
    noExpenseDays: updatedNoExpenseDays,
    updatedAt: new Date().toISOString(),
  };

  await saveMonthData(monthKey, updatedData);
  return { updatedData, newExpense };
};

/**
 * Delete a daily expense
 */
export const deleteDailyExpense = async (monthKey, expenseId) => {
  const data = await getMonthData(monthKey);
  if (!data) return null;

  const updatedData = {
    ...data,
    dailyExpenses: (data.dailyExpenses || []).filter((item) => item.id !== expenseId),
    updatedAt: new Date().toISOString(),
  };

  await saveMonthData(monthKey, updatedData);
  return updatedData;
};

/**
 * Toggle fixed expense paid status
 */
export const toggleFixedExpensePaid = async (monthKey, fixedId) => {
  const data = await getMonthData(monthKey);
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

  await saveMonthData(monthKey, updatedData);
  return updatedData;
};

/**
 * Mark a day as "Không tiêu gì" (explicitly zero spending today)
 */
export const markDayAsNoExpense = async (monthKey, dateStr = getTodayDateString()) => {
  const data = (await getMonthData(monthKey)) || {
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

  await saveMonthData(monthKey, updatedData);
  return updatedData;
};

/**
 * Check if the user has entered any expense or marked zero-spend for today
 */
export const hasUserLoggedToday = async (monthKey, todayStr = getTodayDateString()) => {
  const data = await getMonthData(monthKey);
  if (!data) return false;

  const hasExpense = (data.dailyExpenses || []).some((item) => item.date === todayStr);
  if (hasExpense) return true;

  const isMarkedNoExpense = (data.noExpenseDays || []).includes(todayStr);
  return isMarkedNoExpense;
};

/**
 * Get data from the previous month to easily copy over fixed expenses
 */
export const getPreviousMonthPreset = async (currentMonthKey) => {
  const prevKey = getPreviousMonthKey(currentMonthKey);
  const prevData = await getMonthData(prevKey);
  if (!prevData) return null;

  return {
    monthKey: prevKey,
    budget: prevData.budget,
    fixedExpenses: (prevData.fixedExpenses || []).map((item) => ({
      ...item,
      paid: false, // Reset paid status for new month
      paidDate: null,
    })),
  };
};

/**
 * Settings helpers
 */
export const getSettings = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings) => {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(KEY_SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving settings:', e);
    throw e;
  }
};

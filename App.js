import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import {
  getMonthKey,
  getTodayDateString,
  getPreviousMonthKey,
} from './src/utils/format';
import {
  getMonthData,
  initializeMonth,
  addDailyExpense,
  deleteDailyExpense,
  toggleFixedExpensePaid,
  markDayAsNoExpense,
  hasUserLoggedToday,
  getPreviousMonthPreset,
  getSettings,
  saveSettings,
} from './src/services/storage';
import {
  registerForPushNotificationsAsync,
  scheduleDailyReminder,
  cancelDailyReminder,
} from './src/services/notification';

import Header from './src/components/Header';
import BudgetOverviewCard from './src/components/BudgetOverviewCard';
import FixedExpensesCard from './src/components/FixedExpensesCard';
import DailyExpensesList from './src/components/DailyExpensesList';
import AddExpenseModal from './src/components/AddExpenseModal';
import MonthSetupModal from './src/components/MonthSetupModal';
import MonthHistoryModal from './src/components/MonthHistoryModal';
import SettingsModal from './src/components/SettingsModal';
import { refreshHomeWidget } from './src/widgets/updateWidget';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentMonthKey, setCurrentMonthKey] = useState(getMonthKey());
  const [monthData, setMonthData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [previousMonthData, setPreviousMonthData] = useState(null);

  // Modals visibility
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showMonthSetup, setShowMonthSetup] = useState(false);
  const [isMandatorySetup, setIsMandatorySetup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Initialize and load data
  const loadAppData = useCallback(async () => {
    try {
      setLoading(true);
      const todayMonthKey = getMonthKey();
      setCurrentMonthKey(todayMonthKey);

      // Load settings
      const appSettings = await getSettings();
      setSettings(appSettings);

      // Request notification permissions & configure daily 18:00 reminder
      await registerForPushNotificationsAsync();

      // Check current month data
      const data = await getMonthData(todayMonthKey);

      if (!data || !data.setupCompleted) {
        // Month not configured yet! (first time or Day 1 of new month)
        // Retrieve previous month for easy 1-tap copy
        const prevData = await getPreviousMonthPreset(todayMonthKey);
        setPreviousMonthData(prevData);

        // Force mandatory setup modal
        setIsMandatorySetup(true);
        setShowMonthSetup(true);
      } else {
        setMonthData(data);
        setIsMandatorySetup(false);

        // Check if user already logged today to adjust 18:00 reminder
        const loggedToday = await hasUserLoggedToday(todayMonthKey);
        if (appSettings.reminderEnabled) {
          await scheduleDailyReminder(
            appSettings.reminderHour || 18,
            appSettings.reminderMinute || 0,
            loggedToday
          );
        }
      }
    } catch (error) {
      console.error('Failed to load app data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  // Sync widget with current data
  useEffect(() => {
    if (monthData) {
      const todayStr = getTodayDateString();
      const todayExp = (monthData.dailyExpenses || []).filter((e) => e.date === todayStr);
      const todaySpent = todayExp.reduce((s, it) => s + (Number(it.amount) || 0), 0);

      const fixedPaid = (monthData.fixedExpenses || [])
        .filter((f) => f.paid)
        .reduce((s, it) => s + (Number(it.amount) || 0), 0);
      const flexibleTotal = (monthData.dailyExpenses || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
      const totalSpent = fixedPaid + flexibleTotal;
      const remaining = (Number(monthData.budget) || 0) - totalSpent;

      refreshHomeWidget({ todaySpent, remaining });
    }
  }, [monthData]);

  // Handle saving month setup
  const handleSaveMonthSetup = async ({ budget, fixedExpenses }) => {
    try {
      const initialized = await initializeMonth(currentMonthKey, {
        budget,
        fixedExpenses,
      });
      setMonthData(initialized);
      setShowMonthSetup(false);
      setIsMandatorySetup(false);

      // Schedule notification
      const loggedToday = await hasUserLoggedToday(currentMonthKey);
      if (settings?.reminderEnabled) {
        await scheduleDailyReminder(18, 0, loggedToday);
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu cài đặt tháng này. Vui lòng thử lại.');
    }
  };

  // Handle adding daily flexible expense
  const handleSaveDailyExpense = async (expensePayload) => {
    try {
      const { updatedData } = await addDailyExpense(currentMonthKey, expensePayload);
      setMonthData(updatedData);

      // Since user just logged an expense today, we can reschedule reminder
      if (settings?.reminderEnabled) {
        await scheduleDailyReminder(settings.reminderHour || 18, 0, true);
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu khoản chi.');
    }
  };

  // Handle deleting daily flexible expense
  const handleDeleteDailyExpense = async (expenseId) => {
    try {
      const updated = await deleteDailyExpense(currentMonthKey, expenseId);
      if (updated) setMonthData(updated);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể xóa khoản chi.');
    }
  };

  // Handle toggling fixed expense paid checkbox
  const handleToggleFixedPaid = async (fixedId) => {
    try {
      const updated = await toggleFixedExpensePaid(currentMonthKey, fixedId);
      if (updated) setMonthData(updated);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
    }
  };

  // Handle marking day as No Expense
  const handleMarkNoExpense = async () => {
    try {
      const updated = await markDayAsNoExpense(currentMonthKey);
      setMonthData(updated);
      Alert.alert(
        'Đã ghi nhận! 🎉',
        'Hôm nay bạn không tiêu gì. App sẽ không gửi thông báo nhắc lúc 18h00 hôm nay.'
      );
      if (settings?.reminderEnabled) {
        await scheduleDailyReminder(settings.reminderHour || 18, 0, true);
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
    }
  };

  // Handle updating settings
  const handleUpdateSettings = async (newSettings) => {
    try {
      const updated = await saveSettings(newSettings);
      setSettings(updated);

      if (updated.reminderEnabled) {
        const loggedToday = await hasUserLoggedToday(currentMonthKey);
        await scheduleDailyReminder(updated.reminderHour || 18, 0, loggedToday);
      } else {
        await cancelDailyReminder();
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể cập nhật cài đặt.');
    }
  };

  // Handle full reset
  const handleResetAllData = async () => {
    try {
      await AsyncStorage.clear();
      setShowSettings(false);
      setMonthData(null);
      await loadAppData();
      Alert.alert('Thành công', 'Đã xóa toàn bộ dữ liệu.');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể xóa dữ liệu.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Đang tải sổ chi tiêu...</Text>
      </View>
    );
  }

  // Calculations for dashboard
  const budget = monthData?.budget || 0;
  const fixedExpenses = monthData?.fixedExpenses || [];
  const dailyExpenses = monthData?.dailyExpenses || [];
  const noExpenseDays = monthData?.noExpenseDays || [];

  const fixedTotal = fixedExpenses.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const fixedPaid = fixedExpenses
    .filter((it) => it.paid)
    .reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

  const flexibleTotal = dailyExpenses.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const todayStr = getTodayDateString();
  const flexibleToday = dailyExpenses
    .filter((it) => it.date === todayStr)
    .reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

  const totalSpent = fixedPaid + flexibleTotal;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* App Header */}
      <Header
        currentMonthKey={currentMonthKey}
        onOpenHistory={() => setShowHistory(true)}
        onOpenSettings={() => setShowSettings(true)}
        onEditMonthSetup={() => {
          setIsMandatorySetup(false);
          setShowMonthSetup(true);
        }}
      />

      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Budget Overview Card */}
        <BudgetOverviewCard
          budget={budget}
          totalSpent={totalSpent}
          fixedTotal={fixedTotal}
          fixedPaid={fixedPaid}
          flexibleTotal={flexibleTotal}
          flexibleToday={flexibleToday}
        />

        {/* 1. Khoản Cố Định (Fixed Expenses) */}
        <FixedExpensesCard
          fixedExpenses={fixedExpenses}
          onTogglePaid={handleToggleFixedPaid}
          onManageFixed={() => {
            setIsMandatorySetup(false);
            setShowMonthSetup(true);
          }}
        />

        {/* 2. Khoản Linh Động (Daily/Flexible Expenses) */}
        <DailyExpensesList
          expenses={dailyExpenses}
          noExpenseDays={noExpenseDays}
          onOpenAddExpense={() => setShowAddExpense(true)}
          onMarkNoExpense={handleMarkNoExpense}
          onDeleteExpense={handleDeleteDailyExpense}
        />
      </ScrollView>

      {/* Floating Action Button for Quick Add */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddExpense(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modals */}
      <AddExpenseModal
        visible={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onSave={handleSaveDailyExpense}
      />

      <MonthSetupModal
        visible={showMonthSetup}
        isMandatory={isMandatorySetup}
        monthKey={currentMonthKey}
        initialBudget={monthData?.budget || 0}
        initialFixedExpenses={monthData?.fixedExpenses || []}
        previousMonthData={previousMonthData}
        onSave={handleSaveMonthSetup}
        onClose={() => setShowMonthSetup(false)}
      />

      <MonthHistoryModal
        visible={showHistory}
        currentMonthKey={currentMonthKey}
        onClose={() => setShowHistory(false)}
      />

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetAllData={handleResetAllData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  mainScroll: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FLEXIBLE_CATEGORIES } from '../constants/categories';
import { formatCurrency, formatDisplayDate, getTodayDateString } from '../utils/format';

export default function DailyExpensesList({
  expenses = [],
  noExpenseDays = [],
  onOpenAddExpense,
  onMarkNoExpense,
  onDeleteExpense,
}) {
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'all'
  const todayStr = getTodayDateString();

  const isMarkedNoExpenseToday = noExpenseDays.includes(todayStr);
  const todayExpenses = expenses.filter((item) => item.date === todayStr);
  const totalToday = todayExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Helper to get category visual info
  const getCatMeta = (catId) => {
    const found = FLEXIBLE_CATEGORIES.find((c) => c.id === catId);
    return found || {
      name: 'Chi tiêu khác',
      icon: 'receipt-outline',
      color: '#6B7280',
      bgColor: '#F3F4F6',
    };
  };

  const confirmDelete = (item) => {
    Alert.alert(
      'Xóa khoản chi?',
      `Bạn có chắc muốn xóa "${item.categoryName} - ${formatCurrency(item.amount)}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => onDeleteExpense(item.id),
        },
      ]
    );
  };

  // Group all expenses by date for 'all' tab
  const groupedExpenses = expenses.reduce((acc, item) => {
    const d = item.date || 'Khác';
    if (!acc[d]) acc[d] = [];
    acc[d].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedExpenses).sort().reverse();

  return (
    <View style={styles.container}>
      {/* Header with Switcher */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithBadge}>
          <Text style={styles.sectionTitle}>Chi Tiêu Linh Động</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{expenses.length}</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'today' && styles.tabBtnActive]}
            onPress={() => setActiveTab('today')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'today' && styles.tabTextActive]}>
              Hôm nay
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              Cả tháng
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TODAY TAB */}
      {activeTab === 'today' && (
        <View>
          {todayExpenses.length === 0 ? (
            <View style={styles.emptyTodayBox}>
              {isMarkedNoExpenseToday ? (
                <View style={styles.noExpenseBanner}>
                  <Ionicons name="sparkles" size={24} color="#10B981" />
                  <Text style={styles.noExpenseTitle}>Hôm nay bạn không tiêu gì! 🎉</Text>
                  <Text style={styles.noExpenseSub}>
                    Tuyệt vời! App sẽ không nhắc bạn lúc 18h00 hôm nay.
                  </Text>
                  <TouchableOpacity
                    style={styles.reopenAddBtn}
                    onPress={onOpenAddExpense}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reopenAddText}>+ Nếu có phát sinh khoản chi, bấm vào đây</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.reminderBanner}>
                  <Ionicons name="time-outline" size={26} color="#F59E0B" />
                  <Text style={styles.reminderTitle}>Hôm nay bạn chưa nhập chi tiêu!</Text>
                  <Text style={styles.reminderSub}>
                    (Đúng 18h00 app sẽ gửi thông báo nhắc nếu chưa nhập)
                  </Text>

                  <View style={styles.reminderButtonsRow}>
                    <TouchableOpacity
                      style={styles.quickAddBtn}
                      onPress={onOpenAddExpense}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.quickAddText}>Nhập chi tiêu ngay</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.zeroSpendBtn}
                      onPress={onMarkNoExpense}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="shield-checkmark-outline" size={16} color="#4B5563" />
                      <Text style={styles.zeroSpendText}>Hôm nay ko tiêu</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View>
              <View style={styles.todaySubtotal}>
                <Text style={styles.todaySubtotalLabel}>TỔNG CHI:</Text>
                <Text style={styles.todaySubtotalValue}>{formatCurrency(totalToday)}</Text>
              </View>

              {todayExpenses.map((item) => {
                const meta = getCatMeta(item.categoryId);
                return (
                  <View key={item.id} style={styles.expenseItem}>
                    <View style={[styles.catIconWrap, { backgroundColor: meta.bgColor }]}>
                      <Ionicons name={meta.icon} size={20} color={meta.color} />
                    </View>

                    <View style={styles.expenseDetails}>
                      <Text style={styles.expenseCatName}>{item.categoryName || meta.name}</Text>
                      <Text style={styles.expenseSub}>
                        {item.time ? `${item.time} • ` : ''}
                        {item.note || 'Không có ghi chú'}
                      </Text>
                    </View>

                    <Text style={styles.expenseAmount}>-{formatCurrency(item.amount)}</Text>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => confirmDelete(item)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* ALL MONTH TAB */}
      {activeTab === 'all' && (
        <View>
          {expenses.length === 0 ? (
            <View style={styles.emptyAllBox}>
              <Ionicons name="receipt-outline" size={32} color="#D1D5DB" />
              <Text style={styles.emptyAllText}>Chưa có khoản chi linh động nào trong tháng này.</Text>
            </View>
          ) : (
            sortedDates.map((dateStr) => {
              const dayItems = groupedExpenses[dateStr] || [];
              const dayTotal = dayItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

              return (
                <View key={dateStr} style={styles.dateGroup}>
                  <View style={styles.dateGroupHeader}>
                    <Text style={styles.dateGroupTitle}>{formatDisplayDate(dateStr)}</Text>
                    <Text style={styles.dateGroupTotal}>-{formatCurrency(dayTotal)}</Text>
                  </View>

                  {dayItems.map((item) => {
                    const meta = getCatMeta(item.categoryId);
                    return (
                      <View key={item.id} style={styles.expenseItem}>
                        <View style={[styles.catIconWrap, { backgroundColor: meta.bgColor }]}>
                          <Ionicons name={meta.icon} size={18} color={meta.color} />
                        </View>

                        <View style={styles.expenseDetails}>
                          <Text style={styles.expenseCatName}>{item.categoryName || meta.name}</Text>
                          <Text style={styles.expenseSub}>
                            {item.time ? `${item.time} • ` : ''}
                            {item.note || 'Không có ghi chú'}
                          </Text>
                        </View>

                        <Text style={styles.expenseAmount}>-{formatCurrency(item.amount)}</Text>

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => confirmDelete(item)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 80, // Space for Floating Action Button
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#111827',
  },
  emptyTodayBox: {
    paddingVertical: 4,
  },
  reminderBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
    marginTop: 6,
  },
  reminderSub: {
    fontSize: 11,
    color: '#D97706',
    marginTop: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  reminderButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  quickAddBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  quickAddText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  zeroSpendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  zeroSpendText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  noExpenseBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  noExpenseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 4,
  },
  noExpenseSub: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
    textAlign: 'center',
  },
  reopenAddBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  reopenAddText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  todaySubtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  todaySubtotalLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  todaySubtotalValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCatName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  expenseSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
    marginRight: 8,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyAllBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyAllText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: 12,
  },
  dateGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  dateGroupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  dateGroupTotal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
});

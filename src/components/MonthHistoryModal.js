import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllMonthKeys, getMonthData } from '../services/storage';
import { formatCurrency, formatMonthTitle, formatDisplayDate } from '../utils/format';
import { FLEXIBLE_CATEGORIES } from '../constants/categories';

export default function MonthHistoryModal({ visible, currentMonthKey, onClose, onSelectMonth }) {
  const [months, setMonths] = useState([]);
  const [selectedMonthKey, setSelectedMonthKey] = useState(currentMonthKey);
  const [monthDetails, setMonthDetails] = useState(null);

  useEffect(() => {
    if (visible) {
      loadMonthsList();
    }
  }, [visible, currentMonthKey]);

  useEffect(() => {
    if (selectedMonthKey) {
      loadMonthData(selectedMonthKey);
    }
  }, [selectedMonthKey]);

  const loadMonthsList = async () => {
    const list = await getAllMonthKeys();
    setMonths(list);
    if (!list.includes(selectedMonthKey) && list.length > 0) {
      setSelectedMonthKey(list[0]);
    }
  };

  const loadMonthData = async (mKey) => {
    const data = await getMonthData(mKey);
    setMonthDetails(data);
  };

  const getCatMeta = (catId) => {
    const found = FLEXIBLE_CATEGORIES.find((c) => c.id === catId);
    return found || {
      name: 'Chi tiêu khác',
      icon: 'receipt-outline',
      color: '#6B7280',
      bgColor: '#F3F4F6',
    };
  };

  // Calculations for selected month
  const budget = monthDetails?.budget || 0;
  const fixedTotal = (monthDetails?.fixedExpenses || []).reduce(
    (sum, it) => sum + (Number(it.amount) || 0),
    0
  );
  const fixedPaid = (monthDetails?.fixedExpenses || [])
    .filter((it) => it.paid)
    .reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const flexibleTotal = (monthDetails?.dailyExpenses || []).reduce(
    (sum, it) => sum + (Number(it.amount) || 0),
    0
  );
  const totalSpent = fixedPaid + flexibleTotal;
  const remaining = budget - totalSpent;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>Lịch Sử Chi Tiêu Các Tháng</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Month Selector Carousel / Tabs */}
        <View style={styles.selectorWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthChips}>
            {months.map((mKey) => {
              const isSelected = mKey === selectedMonthKey;
              const isCurrent = mKey === currentMonthKey;
              return (
                <TouchableOpacity
                  key={mKey}
                  style={[styles.monthChip, isSelected && styles.monthChipActive]}
                  onPress={() => setSelectedMonthKey(mKey)}
                >
                  <Text style={[styles.monthChipText, isSelected && styles.monthChipTextActive]}>
                    {formatMonthTitle(mKey)} {isCurrent ? '(Hiện tại)' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Month Content */}
        <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
          {monthDetails ? (
            <View>
              {/* Summary Card */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryMonthName}>{formatMonthTitle(selectedMonthKey)}</Text>

                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Ngân sách</Text>
                    <Text style={styles.statVal}>{formatCurrency(budget)}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Tổng đã chi</Text>
                    <Text style={[styles.statVal, { color: '#EF4444' }]}>{formatCurrency(totalSpent)}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Khoản Cố Định</Text>
                    <Text style={styles.statVal}>{formatCurrency(fixedPaid)}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Khoản Linh Động</Text>
                    <Text style={styles.statVal}>{formatCurrency(flexibleTotal)}</Text>
                  </View>
                </View>

                <View style={styles.netBox}>
                  <Text style={styles.netLabel}>Kết quả tháng:</Text>
                  <Text
                    style={[
                      styles.netValue,
                      { color: remaining >= 0 ? '#10B981' : '#EF4444' },
                    ]}
                  >
                    {remaining >= 0 ? `Dư ${formatCurrency(remaining)}` : `Bội chi ${formatCurrency(Math.abs(remaining))}`}
                  </Text>
                </View>
              </View>

              {/* Fixed Expenses Details */}
              <View style={styles.sectionBox}>
                <Text style={styles.sectionHeader}>Khoản Cố Định ({monthDetails.fixedExpenses?.length || 0})</Text>
                {monthDetails.fixedExpenses?.length > 0 ? (
                  monthDetails.fixedExpenses.map((item) => (
                    <View key={item.id} style={styles.detailRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.detailName}>{item.name}</Text>
                        <Text style={styles.detailSub}>
                          {item.paid ? `✓ Đã đóng (${item.paidDate || 'trong tháng'})` : '✗ Chưa đóng'}
                        </Text>
                      </View>
                      <Text style={styles.detailAmount}>{formatCurrency(item.amount)}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyNote}>Không có khoản cố định trong tháng này.</Text>
                )}
              </View>

              {/* Flexible Daily Expenses Details */}
              <View style={styles.sectionBox}>
                <Text style={styles.sectionHeader}>
                  Các Khoản Chi Linh Động ({monthDetails.dailyExpenses?.length || 0})
                </Text>
                {monthDetails.dailyExpenses?.length > 0 ? (
                  monthDetails.dailyExpenses.map((item) => {
                    const meta = getCatMeta(item.categoryId);
                    return (
                      <View key={item.id} style={styles.detailRow}>
                        <View style={[styles.miniCatIcon, { backgroundColor: meta.bgColor }]}>
                          <Ionicons name={meta.icon} size={16} color={meta.color} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={styles.detailName}>{item.categoryName || meta.name}</Text>
                          <Text style={styles.detailSub}>
                            {formatDisplayDate(item.date)} {item.time ? `• ${item.time}` : ''}{' '}
                            {item.note ? `• ${item.note}` : ''}
                          </Text>
                        </View>
                        <Text style={[styles.detailAmount, { color: '#EF4444' }]}>
                          -{formatCurrency(item.amount)}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.emptyNote}>Chưa có khoản chi linh động nào.</Text>
                )}
              </View>

              <View style={{ height: 40 }} />
            </View>
          ) : (
            <View style={styles.loadingBox}>
              <Text style={styles.emptyNote}>Không tìm thấy dữ liệu tháng này.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  selectorWrap: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  monthChips: {
    paddingHorizontal: 16,
    gap: 8,
  },
  monthChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  monthChipActive: {
    backgroundColor: '#10B981',
  },
  monthChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  monthChipTextActive: {
    color: '#FFFFFF',
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryMonthName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  netBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  netLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  netValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  miniCatIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  detailSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  detailAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptyNote: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
});

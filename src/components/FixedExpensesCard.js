import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/format';

export default function FixedExpensesCard({ fixedExpenses = [], onTogglePaid, onManageFixed }) {
  const [expanded, setExpanded] = useState(true);

  const paidCount = fixedExpenses.filter((item) => item.paid).length;
  const totalCount = fixedExpenses.length;
  const totalAmount = fixedExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const paidAmount = fixedExpenses.filter((item) => item.paid).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar-outline" size={18} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.title}>Khoản Cố Định Tháng Này</Text>
            <Text style={styles.subTitle}>
              Đã thanh toán {paidCount}/{totalCount} ({formatCurrency(paidAmount)})
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6B7280"
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {fixedExpenses.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có khoản cố định nào. Bấm cài đặt để thêm.</Text>
          ) : (
            fixedExpenses.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, item.paid && styles.itemRowPaid]}
                onPress={() => onTogglePaid(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.checkboxContainer}>
                  <Ionicons
                    name={item.paid ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={item.paid ? '#10B981' : '#9CA3AF'}
                  />
                </View>

                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, item.paid && styles.itemNamePaid]}>
                    {item.name}
                  </Text>
                  {item.paid && item.paidDate ? (
                    <Text style={styles.paidDateText}>Đã đóng ({item.paidDate})</Text>
                  ) : (
                    <Text style={styles.unpaidText}>Chạm để đánh dấu đã đóng</Text>
                  )}
                </View>

                <Text style={[styles.itemAmount, item.paid && styles.itemAmountPaid]}>
                  {formatCurrency(item.amount)}
                </Text>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity
            style={styles.manageButton}
            onPress={onManageFixed}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={16} color="#4B5563" />
            <Text style={styles.manageButtonText}>Chỉnh sửa danh sách cố định</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F8FAFC',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  subTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingVertical: 10,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemRowPaid: {
    opacity: 0.75,
  },
  checkboxContainer: {
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemNamePaid: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  paidDateText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
    marginTop: 2,
  },
  unpaidText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  itemAmountPaid: {
    color: '#10B981',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  manageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
});

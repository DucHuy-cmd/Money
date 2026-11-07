import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/format';

export default function BudgetOverviewCard({
  budget = 0,
  totalSpent = 0,
  fixedTotal = 0,
  fixedPaid = 0,
  flexibleTotal = 0,
  flexibleToday = 0,
}) {
  const remaining = budget - totalSpent;
  const spentPercent = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;

  // Status colors based on remaining budget
  let statusColor = '#10B981'; // green
  let statusBg = '#ECFDF5';
  let statusText = 'Ngân sách an toàn';

  if (remaining < 0) {
    statusColor = '#EF4444'; // red
    statusBg = '#FEE2E2';
    statusText = 'Đã vượt ngân sách!';
  } else if (spentPercent >= 80) {
    statusColor = '#F59E0B'; // yellow/amber
    statusBg = '#FEF3C7';
    statusText = 'Sắp hết ngân sách!';
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.subTitle}>Số tiền còn lại</Text>
          <Text style={[styles.mainAmount, { color: remaining < 0 ? '#EF4444' : '#111827' }]}>
            {formatCurrency(remaining)}
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: statusBg }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${spentPercent}%`,
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Đã tiêu: {formatCurrency(totalSpent)} ({spentPercent}%)</Text>
          <Text style={styles.progressLabel}>Ngân sách: {formatCurrency(budget)}</Text>
        </View>
      </View>

      {/* 2 Main Categories Comparison: Cố Định vs Linh Động */}
      <View style={styles.categorySummary}>
        <View style={styles.categoryCol}>
          <View style={styles.categoryTitleRow}>
            <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.categoryName}>Cố Định</Text>
          </View>
          <Text style={styles.catAmount}>{formatCurrency(fixedPaid)}</Text>
          <Text style={styles.catSub}>
            Dự kiến: {formatCurrency(fixedTotal)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.categoryCol}>
          <View style={styles.categoryTitleRow}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.categoryName}>Linh Động</Text>
          </View>
          <Text style={styles.catAmount}>{formatCurrency(flexibleTotal)}</Text>
          <Text style={styles.catSub}>
            Hôm nay: <Text style={{ fontWeight: '700', color: '#10B981' }}>{formatCurrency(flexibleToday)}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subTitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  mainAmount: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 14,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  categorySummary: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    alignItems: 'center',
  },
  categoryCol: {
    flex: 1,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  catAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  catSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
});

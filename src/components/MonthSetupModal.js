import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEFAULT_FIXED_PRESETS } from '../constants/categories';
import {
  formatCurrency,
  formatNumberInput,
  parseNumber,
  formatMonthTitle,
} from '../utils/format';

export default function MonthSetupModal({
  visible,
  isMandatory = false,
  monthKey,
  initialBudget = 0,
  initialFixedExpenses = [],
  previousMonthData = null,
  onSave,
  onClose,
}) {
  const [budgetStr, setBudgetStr] = useState('');
  const [fixedList, setFixedList] = useState([]);
  const [newFixedName, setNewFixedName] = useState('');
  const [newFixedAmount, setNewFixedAmount] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialBudget > 0) {
        setBudgetStr(formatNumberInput(initialBudget));
      } else {
        setBudgetStr('');
      }

      if (initialFixedExpenses && initialFixedExpenses.length > 0) {
        setFixedList(initialFixedExpenses);
      } else if (previousMonthData?.fixedExpenses?.length > 0) {
        // Offer previous month preset
        setFixedList(
          previousMonthData.fixedExpenses.map((item) => ({
            id: `fix_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            name: item.name,
            amount: item.amount,
            paid: false,
          }))
        );
        if (previousMonthData.budget && !initialBudget) {
          setBudgetStr(formatNumberInput(previousMonthData.budget));
        }
      } else {
        setFixedList([]);
      }
    }
  }, [visible, initialBudget, initialFixedExpenses, previousMonthData]);

  // Copy previous month data
  const handleCopyFromPrevious = () => {
    if (!previousMonthData) return;
    setBudgetStr(formatNumberInput(previousMonthData.budget));
    setFixedList(
      (previousMonthData.fixedExpenses || []).map((item) => ({
        id: `fix_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: item.name,
        amount: item.amount,
        paid: false,
      }))
    );
  };

  // Add preset fixed item
  const handleAddPreset = (preset) => {
    const exists = fixedList.find((f) => f.name.toLowerCase() === preset.name.toLowerCase());
    if (exists) {
      Alert.alert('Thông báo', `Khoản "${preset.name}" đã có trong danh sách.`);
      return;
    }
    setFixedList([
      ...fixedList,
      {
        id: `fix_${Date.now()}`,
        name: preset.name,
        amount: 0,
        paid: false,
      },
    ]);
  };

  // Update amount of an existing fixed item
  const handleUpdateFixedAmount = (id, text) => {
    const num = parseNumber(text);
    setFixedList(
      fixedList.map((item) => (item.id === id ? { ...item, amount: num } : item))
    );
  };

  // Delete fixed item
  const handleDeleteFixed = (id) => {
    setFixedList(fixedList.filter((item) => item.id !== id));
  };

  // Add custom fixed expense
  const handleAddCustomFixed = () => {
    if (!newFixedName.trim()) {
      alert('Vui lòng nhập tên khoản chi cố định!');
      return;
    }
    const num = parseNumber(newFixedAmount);
    setFixedList([
      ...fixedList,
      {
        id: `fix_${Date.now()}`,
        name: newFixedName.trim(),
        amount: num || 0,
        paid: false,
      },
    ]);
    setNewFixedName('');
    setNewFixedAmount('');
    setShowAddCustom(false);
  };

  const totalFixed = fixedList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleComplete = () => {
    const budgetNum = parseNumber(budgetStr);
    if (!budgetNum || budgetNum <= 0) {
      Alert.alert('Chưa nhập ngân sách', 'Bạn vui lòng nhập tổng ngân sách dự kiến tháng này.');
      return;
    }

    onSave({
      budget: budgetNum,
      fixedExpenses: fixedList,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        if (!isMandatory && onClose) onClose();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.headerSubtitle}>
              {isMandatory ? 'Cần thiết lập để sử dụng' : 'Cập nhật ngân sách'}
            </Text>
            <Text style={styles.headerTitle}>{formatMonthTitle(monthKey)}</Text>
          </View>
          {!isMandatory && onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {/* Inherit previous month banner if available */}
          {previousMonthData && (
            <View style={styles.inheritBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inheritTitle}>Kế thừa từ tháng trước?</Text>
                <Text style={styles.inheritSub}>
                  Sao chép ngân sách và các khoản cố định cũ trong 1 chạm.
                </Text>
              </View>
              <TouchableOpacity style={styles.inheritBtn} onPress={handleCopyFromPrevious}>
                <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
                <Text style={styles.inheritBtnText}>Sao chép</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 1: MONTHLY BUDGET */}
          <View style={styles.stepBox}>
            <View style={styles.stepTitleRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Ngân sách / Thu nhập tháng này</Text>
            </View>
            <Text style={styles.stepDesc}>
              Tổng số tiền bạn dự định chi hoặc thu nhập có thể tiêu trong tháng.
            </Text>

            <View style={styles.budgetInputContainer}>
              <TextInput
                style={styles.budgetInput}
                keyboardType="numeric"
                placeholder="VD: 10.000.000"
                placeholderTextColor="#9CA3AF"
                value={budgetStr}
                onChangeText={(text) => setBudgetStr(formatNumberInput(text))}
              />
              <Text style={styles.budgetSuffix}>đ</Text>
            </View>
          </View>

          {/* STEP 2: FIXED EXPENSES */}
          <View style={styles.stepBox}>
            <View style={styles.stepTitleRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Khoản chi CỐ ĐỊNH trong tháng</Text>
            </View>
            <Text style={styles.stepDesc}>
              Các khoản phải trả hàng tháng (Tiền phòng, điện nước, internet, trả góp...).
            </Text>

            {/* Quick Presets */}
            <Text style={styles.presetLabel}>Gợi ý nhanh (Chạm để thêm):</Text>
            <View style={styles.presetsRow}>
              {DEFAULT_FIXED_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={styles.presetChip}
                  onPress={() => handleAddPreset(preset)}
                >
                  <Text style={styles.presetChipText}>+ {preset.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fixed Expenses List */}
            {fixedList.length > 0 ? (
              <View style={styles.fixedListContainer}>
                {fixedList.map((item) => (
                  <View key={item.id} style={styles.fixedItemRow}>
                    <View style={styles.fixedItemNameCol}>
                      <Text style={styles.fixedItemNameText}>{item.name}</Text>
                    </View>

                    <View style={styles.fixedItemAmountCol}>
                      <TextInput
                        style={styles.fixedItemAmountInput}
                        keyboardType="numeric"
                        placeholder="Số tiền"
                        placeholderTextColor="#9CA3AF"
                        value={item.amount ? formatNumberInput(item.amount) : ''}
                        onChangeText={(t) => handleUpdateFixedAmount(item.id, t)}
                      />
                      <Text style={styles.currencySmall}>đ</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.trashBtn}
                      onPress={() => handleDeleteFixed(item.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.fixedSummaryRow}>
                  <Text style={styles.fixedSummaryLabel}>Tổng chi cố định:</Text>
                  <Text style={styles.fixedSummaryValue}>{formatCurrency(totalFixed)}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyFixedNotice}>
                <Text style={styles.emptyFixedText}>
                  Chưa có khoản cố định nào. Bạn có thể bấm các gợi ý phía trên hoặc thêm bên dưới.
                </Text>
              </View>
            )}

            {/* Add Custom Fixed Expense */}
            {showAddCustom ? (
              <View style={styles.customAddBox}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Tên khoản chi (VD: Học phí em gái)"
                  placeholderTextColor="#9CA3AF"
                  value={newFixedName}
                  onChangeText={setNewFixedName}
                />
                <View style={styles.customAmountRow}>
                  <TextInput
                    style={[styles.customInput, { flex: 1 }]}
                    keyboardType="numeric"
                    placeholder="Số tiền"
                    placeholderTextColor="#9CA3AF"
                    value={newFixedAmount}
                    onChangeText={(t) => setNewFixedAmount(formatNumberInput(t))}
                  />
                  <TouchableOpacity style={styles.confirmAddBtn} onPress={handleAddCustomFixed}>
                    <Text style={styles.confirmAddText}>Thêm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.showAddBtn}
                onPress={() => setShowAddCustom(true)}
              >
                <Ionicons name="add" size={18} color="#2563EB" />
                <Text style={styles.showAddText}>Thêm khoản cố định tự đặt tên</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom Complete Button */}
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done-circle" size={22} color="#FFFFFF" />
            <Text style={styles.completeBtnText}>Hoàn Tất & Bắt Đầu Tháng Này</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inheritBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  inheritTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  inheritSub: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
  },
  inheritBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  inheritBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stepBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  stepDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
    marginLeft: 34,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  budgetInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  budgetSuffix: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  fixedListContainer: {
    marginTop: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
  },
  fixedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  fixedItemNameCol: {
    flex: 1.2,
  },
  fixedItemNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  fixedItemAmountCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  fixedItemAmountInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
  },
  currencySmall: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  trashBtn: {
    padding: 6,
  },
  fixedSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 4,
  },
  fixedSummaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  fixedSummaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  emptyFixedNotice: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
  },
  emptyFixedText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  showAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
  },
  showAddText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  customAddBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    gap: 8,
  },
  customInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  customAmountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmAddBtn: {
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmAddText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  completeBtn: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

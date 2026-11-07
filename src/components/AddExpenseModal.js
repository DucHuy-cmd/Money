import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FLEXIBLE_CATEGORIES, QUICK_AMOUNTS } from '../constants/categories';
import { formatCurrency, formatNumberInput, parseNumber, getTodayDateString, getCurrentTimeString } from '../utils/format';

export default function AddExpenseModal({ visible, onClose, onSave }) {
  const [selectedCat, setSelectedCat] = useState(FLEXIBLE_CATEGORIES[0]);
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');

  const handleQuickAdd = (value) => {
    const current = parseNumber(amountStr);
    const updated = current + value;
    setAmountStr(formatNumberInput(updated));
  };

  const handleSave = () => {
    const num = parseNumber(amountStr);
    if (!num || num <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    onSave({
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      amount: num,
      note: note.trim(),
      date: getTodayDateString(),
      time: getCurrentTimeString(),
    });

    // Reset fields
    setAmountStr('');
    setNote('');
    setSelectedCat(FLEXIBLE_CATEGORIES[0]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Ghi Khoản Chi Linh Động</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Amount Input */}
            <View style={styles.amountBox}>
              <Text style={styles.inputLabel}>Số tiền chi (VNĐ)</Text>
              <View style={styles.amountInputRow}>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  value={amountStr}
                  onChangeText={(text) => setAmountStr(formatNumberInput(text))}
                  autoFocus={true}
                />
                <Text style={styles.currencySuffix}>đ</Text>
              </View>
            </View>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmountsRow}>
              {QUICK_AMOUNTS.map((q) => (
                <TouchableOpacity
                  key={q.value}
                  style={styles.quickAmountBtn}
                  onPress={() => handleQuickAdd(q.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickAmountText}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Categories Selector */}
            <Text style={styles.sectionLabel}>Chọn danh mục</Text>
            <View style={styles.categoriesGrid}>
              {FLEXIBLE_CATEGORIES.map((cat) => {
                const isSelected = selectedCat.id === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      isSelected && { borderColor: cat.color, backgroundColor: cat.bgColor },
                    ]}
                    onPress={() => setSelectedCat(cat)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.catIconWrap,
                        { backgroundColor: isSelected ? cat.color : cat.bgColor },
                      ]}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={20}
                        color={isSelected ? '#FFFFFF' : cat.color}
                      />
                    </View>
                    <Text
                      style={[
                        styles.catName,
                        isSelected && { color: cat.color, fontWeight: '700' },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Note input */}
            <Text style={styles.sectionLabel}>Ghi chú (Tùy chọn)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder={selectedCat.id === 'gas' ? 'VD: Đổ xăng xe số / xe ga...' : 'VD: Cơm trưa, cafe sáng...'}
              placeholderTextColor="#9CA3AF"
              value={note}
              onChangeText={setNote}
            />

            {/* Save Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.8}>
              <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                Lưu Chi Tiêu {amountStr ? `(${amountStr} đ)` : ''}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  amountBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountInput: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    minWidth: 120,
  },
  currencySuffix: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 6,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    justifyContent: 'space-between',
  },
  quickAmountBtn: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  catIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    flex: 1,
  },
  noteInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  submitBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    gap: 8,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

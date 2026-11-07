import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendTestNotification, registerForPushNotificationsAsync } from '../services/notification';

export default function SettingsModal({
  visible,
  onClose,
  settings,
  onUpdateSettings,
  onResetAllData,
}) {
  const [enabled, setEnabled] = useState(settings?.reminderEnabled ?? true);
  const hour = settings?.reminderHour ?? 18;
  const minute = settings?.reminderMinute ?? 0;

  const handleToggleReminder = (val) => {
    setEnabled(val);
    onUpdateSettings({ reminderEnabled: val });
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
  };

  const confirmReset = () => {
    Alert.alert(
      '⚠️ Xóa toàn bộ dữ liệu?',
      'Hành động này sẽ xóa toàn bộ ngân sách và lịch sử các tháng. Bạn có chắc chắn không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa sạch',
          style: 'destructive',
          onPress: onResetAllData,
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>Cài Đặt & Nhắc Nhở</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Notification Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="notifications" size={20} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Nhắc nhở nhập chi tiêu mỗi ngày</Text>
                <Text style={styles.cardDesc}>
                  Tự động nhắc lúc {hour}:00 nếu ngày hôm nay bạn chưa nhập khoản chi nào.
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={handleToggleReminder}
                trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
                thumbColor={enabled ? '#10B981' : '#F4F3F4'}
              />
            </View>

            {/* Test notification button */}
            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTestNotification}
              activeOpacity={0.7}
            >
              <Ionicons name="paper-plane-outline" size={16} color="#10B981" />
              <Text style={styles.testBtnText}>Thử gửi thông báo ngay bây giờ</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy & Offline info */}
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.infoTitle}>Bảo mật & Hoạt động Offline</Text>
              <Text style={styles.infoDesc}>
                Tất cả dữ liệu được lưu trực tiếp trên máy của bạn. Không cần mạng, không cần tạo tài khoản và không gửi thông tin đi bất cứ đâu.
              </Text>
            </View>
          </View>

          {/* Reset App */}
          <TouchableOpacity style={styles.resetBtn} onPress={confirmReset} activeOpacity={0.7}>
            <Ionicons name="trash-bin-outline" size={18} color="#EF4444" />
            <Text style={styles.resetBtnText}>Đặt lại ứng dụng & Xóa dữ liệu</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  infoDesc: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
    lineHeight: 16,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
  },
});

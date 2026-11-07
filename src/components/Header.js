import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatMonthTitle } from '../utils/format';

export default function Header({ currentMonthKey, onOpenHistory, onOpenSettings, onEditMonthSetup }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.monthBadge} onPress={onEditMonthSetup} activeOpacity={0.7}>
        <Ionicons name="calendar" size={18} color="#10B981" />
        <Text style={styles.monthText}>{formatMonthTitle(currentMonthKey)}</Text>
        <Ionicons name="pencil" size={12} color="#6B7280" style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton} onPress={onOpenHistory} activeOpacity={0.7}>
          <Ionicons name="time-outline" size={22} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={onOpenSettings} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={22} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

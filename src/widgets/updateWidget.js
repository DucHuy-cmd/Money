import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { Platform } from 'react-native';
import { MoneyBarWidget } from './MoneyBarWidget';
import { formatCurrency } from '../utils/format';

export async function refreshHomeWidget({ todaySpent = 0, remaining = 0 }) {
  if (Platform.OS !== 'android') return;

  try {
    await requestWidgetUpdate({
      widgetName: 'MoneyBarWidget',
      renderWidget: () => (
        <MoneyBarWidget
          todaySpent={formatCurrency(todaySpent)}
          remaining={formatCurrency(remaining)}
        />
      ),
    });
  } catch (error) {
    // In dev or web environment, widget updating might not be available
    console.log('Widget update status:', error?.message || 'Done');
  }
}

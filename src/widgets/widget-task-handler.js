import React from 'react';
import { MoneyBarWidget } from './MoneyBarWidget';
import { getMonthData } from '../services/storage';
import { getMonthKey, getTodayDateString, formatCurrency } from '../utils/format';

export async function widgetTaskHandler(props) {
  const { widgetInfo, widgetAction, renderWidget } = props;

  if (widgetInfo.widgetName === 'MoneyBarWidget') {
    switch (widgetAction) {
      case 'WIDGET_ADDED':
      case 'WIDGET_UPDATE':
      case 'WIDGET_RESIZED': {
        try {
          const currentMonthKey = getMonthKey();
          const todayStr = getTodayDateString();
          const data = await getMonthData(currentMonthKey);

          let todayTotal = 0;
          let remaining = 0;

          if (data) {
            const todayExpenses = (data.dailyExpenses || []).filter((e) => e.date === todayStr);
            todayTotal = todayExpenses.reduce((s, it) => s + (Number(it.amount) || 0), 0);

            const fixedPaid = (data.fixedExpenses || [])
              .filter((f) => f.paid)
              .reduce((s, it) => s + (Number(it.amount) || 0), 0);
            const flexibleTotal = (data.dailyExpenses || []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
            const totalSpent = fixedPaid + flexibleTotal;
            remaining = (Number(data.budget) || 0) - totalSpent;
          }

          renderWidget(
            <MoneyBarWidget
              todaySpent={formatCurrency(todayTotal)}
              remaining={formatCurrency(remaining)}
            />
          );
        } catch (e) {
          console.error('Error rendering widget:', e);
          renderWidget(<MoneyBarWidget todaySpent="0 đ" remaining="0 đ" />);
        }
        break;
      }
      default:
        break;
    }
  }
}

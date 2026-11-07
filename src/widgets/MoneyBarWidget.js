import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function MoneyBarWidget({ todaySpent = '0 đ', remaining = '0 đ' }) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}
      clickAction="OPEN_APP"
    >
      {/* Left Column: Hôm nay */}
      <FlexWidget style={{ flexDirection: 'column', justifyContent: 'center' }}>
        <TextWidget
          text="💰 Tiêu hôm nay"
          style={{
            fontSize: 11,
            color: '#64748B',
            fontWeight: '600',
          }}
        />
        <TextWidget
          text={todaySpent}
          style={{
            fontSize: 16,
            color: '#0F172A',
            fontWeight: 'bold',
          }}
        />
      </FlexWidget>

      {/* Center Column: Ví còn lại */}
      <FlexWidget style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <TextWidget
          text="Ví tháng còn"
          style={{
            fontSize: 11,
            color: '#64748B',
            fontWeight: '500',
          }}
        />
        <TextWidget
          text={remaining}
          style={{
            fontSize: 14,
            color: '#10B981',
            fontWeight: 'bold',
          }}
        />
      </FlexWidget>

      {/* Right Column: Plus Button */}
      <FlexWidget
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: '#10B981',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        clickAction="OPEN_APP"
      >
        <TextWidget
          text="+"
          style={{
            fontSize: 22,
            color: '#FFFFFF',
            fontWeight: 'bold',
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

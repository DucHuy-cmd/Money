export const DEFAULT_FIXED_PRESETS = [
  { id: 'rent', name: 'Tiền phòng / Tiền nhà', defaultAmount: 0 },
  { id: 'utilities', name: 'Điện, Nước, Rác', defaultAmount: 0 },
  { id: 'internet', name: 'Internet / 4G', defaultAmount: 0 },
  { id: 'installment', name: 'Trả góp / Nợ', defaultAmount: 0 },
  { id: 'insurance', name: 'Bảo hiểm / Tiết kiệm', defaultAmount: 0 },
  { id: 'family', name: 'Gửi về gia đình', defaultAmount: 0 },
];

export const FLEXIBLE_CATEGORIES = [
  {
    id: 'food',
    name: 'Tiền ăn uống',
    icon: 'Utensils',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    isDaily: true,
  },
  {
    id: 'gas',
    name: 'Tiền xăng xe',
    icon: 'Fuel',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    isDaily: false,
  },
  {
    id: 'coffee',
    name: 'Cafe & Đồ uống',
    icon: 'Coffee',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    isDaily: false,
  },
  {
    id: 'shopping',
    name: 'Mua sắm & Tiêu dùng',
    icon: 'ShoppingBag',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    isDaily: false,
  },
  {
    id: 'other',
    name: 'Khoản linh động khác',
    icon: 'MoreHorizontal',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    isDaily: false,
  },
];

export const QUICK_AMOUNTS = [
  { label: '+20k', value: 20000 },
  { label: '+30k', value: 30000 },
  { label: '+50k', value: 50000 },
  { label: '+100k', value: 100000 },
  { label: '+200k', value: 200000 },
  { label: '+500k', value: 500000 },
];

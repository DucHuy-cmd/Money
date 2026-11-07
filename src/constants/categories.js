export const EXPENSE_TYPES = {
  FIXED: 'fixed',
  FLEXIBLE: 'flexible',
};

// Preset suggestions for Fixed Expenses (Chi phí cố định)
export const DEFAULT_FIXED_PRESETS = [
  { id: 'rent', name: 'Tiền phòng / Tiền nhà', defaultAmount: 0, icon: 'home-outline' },
  { id: 'utilities', name: 'Điện, Nước, Rác', defaultAmount: 0, icon: 'flash-outline' },
  { id: 'internet', name: 'Internet / 4G', defaultAmount: 0, icon: 'wifi-outline' },
  { id: 'installment', name: 'Trả góp / Nợ', defaultAmount: 0, icon: 'card-outline' },
  { id: 'insurance', name: 'Bảo hiểm / Tiết kiệm', defaultAmount: 0, icon: 'shield-checkmark-outline' },
  { id: 'family', name: 'Gửi về gia đình', defaultAmount: 0, icon: 'people-outline' },
];

// Flexible Expense Categories (Chi phí linh động)
export const FLEXIBLE_CATEGORIES = [
  {
    id: 'food',
    name: 'Tiền ăn uống',
    icon: 'restaurant-outline',
    color: '#EF4444', // Red-500
    bgColor: '#FEE2E2',
    isDaily: true,
    description: 'Ăn sáng, trưa, tối, ăn vặt...',
  },
  {
    id: 'gas',
    name: 'Tiền xăng xe',
    icon: 'speedometer-outline',
    color: '#F59E0B', // Amber-500
    bgColor: '#FEF3C7',
    isDaily: false, // User only enters when fueling up
    description: 'Đổ xăng khi cần',
  },
  {
    id: 'coffee',
    name: 'Cafe & Nước giải khát',
    icon: 'cafe-outline',
    color: '#8B5CF6', // Purple-500
    bgColor: '#EDE9FE',
    isDaily: false,
    description: 'Cafe, trà sữa, tụ tập bạn bè',
  },
  {
    id: 'shopping',
    name: 'Mua sắm & Tiêu dùng',
    icon: 'cart-outline',
    color: '#3B82F6', // Blue-500
    bgColor: '#DBEAFE',
    isDaily: false,
    description: 'Dầu gội, bột giặt, quần áo...',
  },
  {
    id: 'other',
    name: 'Khoản linh động khác',
    icon: 'ellipsis-horizontal-circle-outline',
    color: '#6B7280', // Gray-500
    bgColor: '#F3F4F6',
    isDaily: false,
    description: 'Thuốc men, sửa xe, phát sinh...',
  },
];

// Quick amount buttons for fast entry
export const QUICK_AMOUNTS = [
  { label: '+20k', value: 20000 },
  { label: '+30k', value: 30000 },
  { label: '+50k', value: 50000 },
  { label: '+100k', value: 100000 },
  { label: '+200k', value: 200000 },
  { label: '+500k', value: 500000 },
];

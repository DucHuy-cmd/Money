export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 đ';
  }
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';
};

export const formatNumberInput = (val) => {
  if (!val) return '';
  const numStr = String(val).replace(/\D/g, '');
  if (!numStr) return '';
  return new Intl.NumberFormat('vi-VN').format(parseInt(numStr, 10));
};

export const parseNumber = (str) => {
  if (!str) return 0;
  const cleaned = String(str).replace(/\D/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
};

export const getMonthKey = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const formatMonthTitle = (monthKey) => {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  return `Tháng ${month}/${year}`;
};

export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const today = getTodayDateString();
  const [y, m, d] = dateStr.split('-');
  if (dateStr === today) {
    return `Hôm nay, ${d}/${m}`;
  }
  return `${d}/${m}/${y}`;
};

export const getCurrentTimeString = () => {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${mins}`;
};

export const getPreviousMonthKey = (monthKey) => {
  const [y, m] = monthKey.split('-').map(Number);
  let prevY = y;
  let prevM = m - 1;
  if (prevM === 0) {
    prevM = 12;
    prevY = y - 1;
  }
  return `${prevY}-${String(prevM).padStart(2, '0')}`;
};

/**
 * Add or subtract days from YYYY-MM-DD
 */
export const addDays = (dateStr, days) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const nextY = date.getFullYear();
  const nextM = String(date.getMonth() + 1).padStart(2, '0');
  const nextD = String(date.getDate()).padStart(2, '0');
  return `${nextY}-${nextM}-${nextD}`;
};

/**
 * Format date in full Vietnamese with day of week: "Hôm nay, 07/11/2026" or "Thứ Sáu, 06/11/2026"
 */
export const formatDateFullVietnamese = (dateStr) => {
  if (!dateStr) return '';
  const today = getTodayDateString();
  const yesterday = addDays(today, -1);
  const dayBeforeYesterday = addDays(today, -2);

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[dateObj.getDay()];

  const formattedDate = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;

  if (dateStr === today) {
    return `Hôm nay (${formattedDate})`;
  }
  if (dateStr === yesterday) {
    return `Hôm qua (${formattedDate})`;
  }
  if (dateStr === dayBeforeYesterday) {
    return `Hôm kia (${formattedDate})`;
  }
  return `${dayName}, ${formattedDate}`;
};

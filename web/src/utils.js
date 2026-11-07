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

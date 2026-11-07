import React, { useState, useEffect } from 'react';
import {
  Calendar,
  History,
  Settings,
  Plus,
  CheckSquare,
  Square,
  Trash2,
  Download,
  Bell,
  Sparkles,
  AlertCircle,
  Copy,
  X,
  CheckCircle,
  Utensils,
  Fuel,
  Coffee,
  ShoppingBag,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import './App.css';
import {
  formatCurrency,
  formatNumberInput,
  parseNumber,
  getMonthKey,
  formatMonthTitle,
  getTodayDateString,
  formatDisplayDate,
  getCurrentTimeString,
  addDays,
  formatDateFullVietnamese,
} from './utils';
import {
  DEFAULT_FIXED_PRESETS,
  FLEXIBLE_CATEGORIES,
  QUICK_AMOUNTS,
} from './constants';
import {
  getMonthData,
  initializeMonth,
  addDailyExpense,
  deleteDailyExpense,
  toggleFixedExpensePaid,
  markDayAsNoExpense,
  hasUserLoggedToday,
  getPreviousMonthPreset,
  getAllMonthKeys,
  getSettings,
  saveSettings,
} from './storage';
import {
  sendNotification,
  testNotification,
} from './notifications';

export default function App() {
  const [currentMonthKey, setCurrentMonthKey] = useState(getMonthKey());
  const [monthData, setMonthData] = useState(null);
  const [settings, setSettings] = useState(getSettings());
  const [previousMonthData, setPreviousMonthData] = useState(null);

  // Date selection state
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  // PWA install prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isMandatorySetup, setIsMandatorySetup] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState('day'); // 'day' | 'all'
  const [fixedExpanded, setFixedExpanded] = useState(true);

  // Form states for Add Expense
  const [selectedCat, setSelectedCat] = useState(FLEXIBLE_CATEGORIES[0]);
  const [expenseAmountStr, setExpenseAmountStr] = useState('');
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseDate, setExpenseDate] = useState(getTodayDateString());

  // Form states for Setup
  const [setupBudgetStr, setSetupBudgetStr] = useState('');
  const [setupFixedList, setSetupFixedList] = useState([]);
  const [newCustomFixedName, setNewCustomFixedName] = useState('');
  const [newCustomFixedAmount, setNewCustomFixedAmount] = useState('');

  // History state
  const [historyMonths, setHistoryMonths] = useState([]);
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState(currentMonthKey);
  const [historyDetails, setHistoryDetails] = useState(null);

  // Load App Data
  const loadData = () => {
    const todayMonth = getMonthKey();
    setCurrentMonthKey(todayMonth);
    const data = getMonthData(todayMonth);

    if (!data || !data.setupCompleted) {
      // Month not setup yet! Force mandatory setup
      const prevData = getPreviousMonthPreset(todayMonth);
      setPreviousMonthData(prevData);
      setIsMandatorySetup(true);
      setShowSetupModal(true);
    } else {
      setMonthData(data);
      setIsMandatorySetup(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for PWA install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Notification check interval at 18:00
    const checkNotificationTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const min = now.getMinutes();
      const curSettings = getSettings();

      if (curSettings.reminderEnabled && hour === (curSettings.reminderHour || 18) && min === 0) {
        const todayMonth = getMonthKey();
        const hasLogged = hasUserLoggedToday(todayMonth);
        if (!hasLogged) {
          sendNotification(
            '💰 Bạn ơi, 18h00 rồi!',
            'Hôm nay bạn đã chi tiêu gì chưa? Dành 5 giây ghi lại nhé!'
          );
        }
      }
    };

    const intervalId = setInterval(checkNotificationTime, 60000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearInterval(intervalId);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert('Để cài đặt ứng dụng: Bấm vào dấu 3 chấm góc trên trình duyệt Chrome -> Chọn "Thêm vào màn hình chính" (Add to Home screen)');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  // Open add modal prepopulated with currently selected date
  const handleOpenAddForDate = (targetDate = selectedDate) => {
    setExpenseDate(targetDate);
    setExpenseAmountStr('');
    setExpenseNote('');
    setSelectedCat(FLEXIBLE_CATEGORIES[0]);
    setShowAddModal(true);
  };

  // Add Expense
  const handleSaveExpense = () => {
    const num = parseNumber(expenseAmountStr);
    if (!num || num <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    const targetMonth = getMonthKey(expenseDate);
    const { updatedData } = addDailyExpense(targetMonth, {
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      amount: num,
      note: expenseNote.trim(),
      date: expenseDate || selectedDate,
      time: getCurrentTimeString(),
    });

    if (targetMonth === currentMonthKey) {
      setMonthData(updatedData);
    }
    setShowAddModal(false);
  };

  // Setup Modal Save
  const handleSaveSetup = () => {
    const budgetNum = parseNumber(setupBudgetStr);
    if (!budgetNum || budgetNum <= 0) {
      alert('Vui lòng nhập tổng ngân sách tháng này!');
      return;
    }

    const saved = initializeMonth(currentMonthKey, {
      budget: budgetNum,
      fixedExpenses: setupFixedList,
    });

    setMonthData(saved);
    setShowSetupModal(false);
    setIsMandatorySetup(false);
  };

  const handleCopyPrev = () => {
    if (!previousMonthData) return;
    setSetupBudgetStr(formatNumberInput(previousMonthData.budget));
    setSetupFixedList(previousMonthData.fixedExpenses || []);
  };

  const handleToggleFixed = (id) => {
    const updated = toggleFixedExpensePaid(currentMonthKey, id);
    if (updated) setMonthData(updated);
  };

  const handleDeleteDaily = (id) => {
    if (confirm('Bạn có chắc muốn xóa khoản chi này?')) {
      const updated = deleteDailyExpense(currentMonthKey, id);
      if (updated) setMonthData(updated);
    }
  };

  const handleMarkZeroForDay = (dateStr) => {
    const updated = markDayAsNoExpense(currentMonthKey, dateStr);
    setMonthData(updated);
    alert(`Đã ghi nhận! 🎉 Ngày ${formatDisplayDate(dateStr)} không có chi tiêu.`);
  };

  const openEditSetup = () => {
    setSetupBudgetStr(formatNumberInput(monthData?.budget || 0));
    setSetupFixedList(monthData?.fixedExpenses || []);
    setIsMandatorySetup(false);
    setShowSetupModal(true);
  };

  const openHistory = () => {
    const keys = getAllMonthKeys();
    setHistoryMonths(keys);
    setSelectedHistoryMonth(currentMonthKey);
    setHistoryDetails(getMonthData(currentMonthKey));
    setShowHistoryModal(true);
  };

  // Date Navigation
  const todayStr = getTodayDateString();
  const isSelectedDateToday = selectedDate === todayStr;

  const handlePrevDay = () => {
    setSelectedDate(addDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleJumpToToday = () => {
    setSelectedDate(todayStr);
  };

  // Calculations for dashboard
  const budget = monthData?.budget || 0;
  const fixedExpenses = monthData?.fixedExpenses || [];
  const dailyExpenses = monthData?.dailyExpenses || [];
  const noExpenseDays = monthData?.noExpenseDays || [];

  const fixedPaid = fixedExpenses.filter((f) => f.paid).reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const fixedTotal = fixedExpenses.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const flexibleTotal = dailyExpenses.reduce((s, it) => s + (Number(it.amount) || 0), 0);

  // Selected date spending
  const selectedDateExpenses = dailyExpenses.filter((e) => e.date === selectedDate);
  const selectedDateTotal = selectedDateExpenses.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const isZeroOnSelectedDate = noExpenseDays.includes(selectedDate);

  const totalSpent = fixedPaid + flexibleTotal;
  const remaining = budget - totalSpent;
  const spentPercent = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;

  // Group all expenses by date for 'all' tab
  const groupedAllExpenses = dailyExpenses.reduce((acc, item) => {
    const d = item.date || 'Khác';
    if (!acc[d]) acc[d] = [];
    acc[d].push(item);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedAllExpenses).sort().reverse();

  const getCatIcon = (iconName, color = '#10B981', size = 18) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils size={size} color={color} />;
      case 'Fuel':
        return <Fuel size={size} color={color} />;
      case 'Coffee':
        return <Coffee size={size} color={color} />;
      case 'ShoppingBag':
        return <ShoppingBag size={size} color={color} />;
      default:
        return <MoreHorizontal size={size} color={color} />;
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <button className="month-badge" onClick={openEditSetup}>
          <Calendar size={16} />
          <span>{formatMonthTitle(currentMonthKey)}</span>
        </button>

        <div className="header-actions">
          {showInstallBanner && (
            <button className="icon-btn" onClick={handleInstallApp} title="Cài đặt App vào điện thoại">
              <Download size={20} color="#10B981" />
            </button>
          )}
          <button className="icon-btn" onClick={openHistory} title="Lịch sử các tháng">
            <History size={20} />
          </button>
          <button className="icon-btn" onClick={() => setShowSettingsModal(true)} title="Cài đặt">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="install-banner">
          <div className="install-banner-text">
            <div className="install-banner-title">📲 Cài đặt App Quản Lý Chi Tiêu</div>
            <div className="install-banner-sub">Dùng độc lập trên điện thoại không cần mở máy tính!</div>
          </div>
          <button className="install-btn" onClick={handleInstallApp}>
            Cài đặt ngay
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="main-scroll">
        {/* Card 1: Tổng Ngân Sách */}
        <div className="card">
          <div className="budget-header">
            <div>
              <div className="budget-sub">Số tiền còn lại</div>
              <div className="budget-amount" style={{ color: remaining < 0 ? '#EF4444' : '#0F172A' }}>
                {formatCurrency(remaining)}
              </div>
            </div>
            <div
              className="status-badge"
              style={{
                backgroundColor: remaining < 0 ? '#FEE2E2' : spentPercent >= 80 ? '#FEF3C7' : '#ECFDF5',
                color: remaining < 0 ? '#EF4444' : spentPercent >= 80 ? '#F59E0B' : '#10B981',
              }}
            >
              {remaining < 0 ? 'Vượt ngân sách!' : spentPercent >= 80 ? 'Sắp hết' : 'An toàn'}
            </div>
          </div>

          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${spentPercent}%`,
                backgroundColor: remaining < 0 ? '#EF4444' : spentPercent >= 80 ? '#F59E0B' : '#10B981',
              }}
            />
          </div>

          <div className="progress-label-row">
            <span>Đã tiêu: {formatCurrency(totalSpent)} ({spentPercent}%)</span>
            <span>Ngân sách: {formatCurrency(budget)}</span>
          </div>

          <div className="category-summary-box">
            <div className="cat-col">
              <div className="cat-title">
                <span className="cat-dot" style={{ backgroundColor: '#3B82F6' }} />
                <span>Cố Định</span>
              </div>
              <div className="cat-val">{formatCurrency(fixedPaid)}</div>
              <div className="cat-desc">Dự kiến: {formatCurrency(fixedTotal)}</div>
            </div>
            <div className="cat-divider" />
            <div className="cat-col">
              <div className="cat-title">
                <span className="cat-dot" style={{ backgroundColor: '#10B981' }} />
                <span>Linh Động</span>
              </div>
              <div className="cat-val">{formatCurrency(flexibleTotal)}</div>
              <div className="cat-desc">
                Ngày chọn: <strong style={{ color: '#10B981' }}>{formatCurrency(selectedDateTotal)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Khoản Cố Định */}
        <div className="card">
          <div className="fixed-header" onClick={() => setFixedExpanded(!fixedExpanded)}>
            <div className="fixed-title-group">
              <div className="icon-circle" style={{ backgroundColor: '#DBEAFE' }}>
                <Calendar size={18} color="#2563EB" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>
                  Khoản Cố Định Tháng Này
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Đã thanh toán {fixedExpenses.filter((f) => f.paid).length}/{fixedExpenses.length} ({formatCurrency(fixedPaid)})
                </div>
              </div>
            </div>
            {fixedExpanded ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
          </div>

          {fixedExpanded && (
            <div style={{ marginTop: '12px' }}>
              {fixedExpenses.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '13px', padding: '10px 0' }}>
                  Chưa có khoản cố định nào. Bấm nút bên dưới để thêm.
                </div>
              ) : (
                fixedExpenses.map((item) => (
                  <div key={item.id} className="fixed-item" onClick={() => handleToggleFixed(item.id)}>
                    {item.paid ? <CheckSquare size={20} color="#10B981" /> : <Square size={20} color="#94A3B8" />}
                    <div className="fixed-item-info">
                      <div className={`fixed-item-name ${item.paid ? 'paid' : ''}`}>{item.name}</div>
                      <div className={`fixed-item-status ${item.paid ? 'paid' : ''}`}>
                        {item.paid ? `✓ Đã thanh toán (${item.paidDate || 'trong tháng'})` : 'Chạm để đánh dấu đã đóng'}
                      </div>
                    </div>
                    <div className={`fixed-item-amt ${item.paid ? 'paid' : ''}`}>{formatCurrency(item.amount)}</div>
                  </div>
                ))
              )}

              <button className="manage-btn" onClick={openEditSetup}>
                <span>Chỉnh sửa danh sách cố định & ngân sách</span>
              </button>
            </div>
          )}
        </div>

        {/* Card 3: Chi Tiêu Linh Động & Xem Theo Ngày Bất Kỳ */}
        <div className="card">
          <div className="daily-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>Chi Tiêu Linh Động</span>
              <span style={{ backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>
                {dailyExpenses.length}
              </span>
            </div>

            <div className="tab-switcher">
              <button
                className={`tab-btn ${activeTab === 'day' ? 'active' : ''}`}
                onClick={() => setActiveTab('day')}
              >
                Theo ngày
              </button>
              <button
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Cả tháng
              </button>
            </div>
          </div>

          {activeTab === 'day' ? (
            <div>
              {/* THANH ĐIỀU HƯỚNG & CHỌN NGÀY BẤT KỲ */}
              <div className="date-navigator">
                <button className="date-nav-btn" onClick={handlePrevDay} title="Ngày trước">
                  <ChevronLeft size={20} />
                </button>

                <div className="date-display-btn">
                  <Calendar size={16} color="#10B981" />
                  <span>{formatDateFullVietnamese(selectedDate)}</span>
                  {/* Native date picker input overlay */}
                  <input
                    type="date"
                    className="hidden-date-picker"
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) setSelectedDate(e.target.value);
                    }}
                  />
                </div>

                <button className="date-nav-btn" onClick={handleNextDay} title="Ngày sau">
                  <ChevronRight size={20} />
                </button>

                {!isSelectedDateToday && (
                  <button className="today-jump-btn" onClick={handleJumpToToday}>
                    Hôm nay
                  </button>
                )}
              </div>

              {/* TỔNG CHI TIÊU CỦA NGÀY ĐANG CHỌN */}
              <div className="day-subtotal-box">
                <span className="day-subtotal-label">Tổng chi ngày {formatDisplayDate(selectedDate)}:</span>
                <span className="day-subtotal-val" style={{ color: selectedDateTotal > 0 ? '#EF4444' : '#10B981' }}>
                  {formatCurrency(selectedDateTotal)}
                </span>
              </div>

              {/* DANH SÁCH CHI TIÊU CỦA NGÀY NÀY */}
              {selectedDateExpenses.length === 0 ? (
                isZeroOnSelectedDate ? (
                  <div className="banner-success">
                    <Sparkles size={26} color="#10B981" style={{ margin: '0 auto' }} />
                    <div className="banner-success-title">
                      {isSelectedDateToday ? 'Hôm nay bạn không tiêu gì! 🎉' : `Ngày ${formatDisplayDate(selectedDate)} không tiêu gì! 🎉`}
                    </div>
                    <div className="banner-success-sub">
                      {isSelectedDateToday ? 'Tuyệt vời! App sẽ không nhắc bạn lúc 18h00.' : 'Đã được ghi nhận tiết kiệm 100%.'}
                    </div>
                    <button
                      style={{ background: 'transparent', border: 'none', color: '#059669', fontSize: '12px', fontWeight: '600', marginTop: '10px', textDecoration: 'underline', cursor: 'pointer' }}
                      onClick={() => handleOpenAddForDate(selectedDate)}
                    >
                      + Nếu có phát sinh khoản chi, bấm vào đây để ghi
                    </button>
                  </div>
                ) : (
                  <div className={isSelectedDateToday ? 'banner-warning' : 'empty-day-box'}>
                    {isSelectedDateToday ? (
                      <>
                        <AlertCircle size={26} color="#F59E0B" style={{ margin: '0 auto' }} />
                        <div className="banner-warning-title">Hôm nay bạn chưa nhập chi tiêu!</div>
                        <div className="banner-warning-sub">(Đúng 18h00 app sẽ thông báo nhắc nhở nếu chưa nhập)</div>
                        <div className="banner-btns">
                          <button className="btn-primary" onClick={() => handleOpenAddForDate(selectedDate)}>
                            <Plus size={16} /> Nhập chi tiêu ngay
                          </button>
                          <button className="btn-secondary" onClick={() => handleMarkZeroForDay(selectedDate)}>
                            Hôm nay ko tiêu
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="empty-day-text">Chưa ghi nhận khoản chi nào trong ngày này.</div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button className="btn-primary" style={{ padding: '8px 14px' }} onClick={() => handleOpenAddForDate(selectedDate)}>
                            <Plus size={16} /> + Ghi chi tiêu cho ngày này
                          </button>
                          <button className="btn-secondary" style={{ padding: '8px 14px' }} onClick={() => handleMarkZeroForDay(selectedDate)}>
                            Đánh dấu ko tiêu
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              ) : (
                <div>
                  {selectedDateExpenses.map((item) => {
                    const cat = FLEXIBLE_CATEGORIES.find((c) => c.id === item.categoryId) || FLEXIBLE_CATEGORIES[4];
                    return (
                      <div key={item.id} className="expense-row">
                        <div className="cat-icon-badge" style={{ backgroundColor: cat.bgColor }}>
                          {getCatIcon(cat.icon, cat.color)}
                        </div>
                        <div className="expense-info">
                          <div className="expense-name">{item.categoryName}</div>
                          <div className="expense-meta">{item.time} • {item.note || 'Không có ghi chú'}</div>
                        </div>
                        <div className="expense-amt">-{formatCurrency(item.amount)}</div>
                        <button className="trash-btn" onClick={() => handleDeleteDaily(item.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}

                  <button
                    className="manage-btn"
                    style={{ marginTop: '14px', backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', color: '#065F46' }}
                    onClick={() => handleOpenAddForDate(selectedDate)}
                  >
                    <Plus size={16} /> Thêm khoản chi khác cho ngày {formatDisplayDate(selectedDate)}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* TAB CẢ THÁNG (GOM THEO TỪNG NGÀY) */
            <div>
              {sortedDates.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '13px', padding: '24px 0' }}>
                  Chưa có khoản chi linh động nào trong tháng.
                </div>
              ) : (
                sortedDates.map((dStr) => {
                  const dayItems = groupedAllExpenses[dStr] || [];
                  const daySum = dayItems.reduce((s, it) => s + (Number(it.amount) || 0), 0);

                  return (
                    <div key={dStr} className="date-group-card">
                      <div
                        className="date-group-header"
                        onClick={() => {
                          setSelectedDate(dStr);
                          setActiveTab('day');
                        }}
                        style={{ cursor: 'pointer' }}
                        title="Bấm để xem chi tiết ngày này"
                      >
                        <div className="date-group-title">
                          📅 {formatDateFullVietnamese(dStr)}
                        </div>
                        <div className="date-group-total">
                          -{formatCurrency(daySum)}
                        </div>
                      </div>

                      <div className="date-group-content">
                        {dayItems.map((item) => {
                          const cat = FLEXIBLE_CATEGORIES.find((c) => c.id === item.categoryId) || FLEXIBLE_CATEGORIES[4];
                          return (
                            <div key={item.id} className="expense-row">
                              <div className="cat-icon-badge" style={{ backgroundColor: cat.bgColor }}>
                                {getCatIcon(cat.icon, cat.color, 16)}
                              </div>
                              <div className="expense-info">
                                <div className="expense-name" style={{ fontSize: '13px' }}>{item.categoryName}</div>
                                <div className="expense-meta">{item.time} • {item.note || 'Không ghi chú'}</div>
                              </div>
                              <div className="expense-amt" style={{ fontSize: '13px' }}>-{formatCurrency(item.amount)}</div>
                              <button className="trash-btn" onClick={() => handleDeleteDaily(item.id)}>
                                <Trash2 size={15} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fab-btn" onClick={() => handleOpenAddForDate(selectedDate)} title="Nhập chi tiêu">
        <Plus size={32} />
      </button>

      {/* MODAL: NHẬP CHI TIÊU LINH ĐỘNG (CỔNG ĐIỀN NỀN TRẮNG SÁCH TINH) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>Ghi Khoản Chi Linh Động</span>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={22} />
              </button>
            </div>

            {/* Chọn ngày chi */}
            <div className="input-group">
              <label className="input-label">Ngày chi tiêu</label>
              <input
                type="date"
                className="text-input"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>

            {/* Ô điền số tiền màu trắng */}
            <div className="input-group">
              <label className="input-label">Số tiền chi (VNĐ)</label>
              <div className="amount-input-box">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={expenseAmountStr}
                  onChange={(e) => setExpenseAmountStr(formatNumberInput(e.target.value))}
                  autoFocus
                />
                <span className="amount-currency">đ</span>
              </div>
            </div>

            {/* Các phím số nhanh màu trắng */}
            <div className="quick-pills">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q.value}
                  className="quick-pill"
                  onClick={() => {
                    const cur = parseNumber(expenseAmountStr);
                    setExpenseAmountStr(formatNumberInput(cur + q.value));
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Danh mục */}
            <div className="input-group">
              <label className="input-label">Chọn danh mục</label>
              <div className="categories-grid">
                {FLEXIBLE_CATEGORIES.map((cat) => {
                  const isSel = selectedCat.id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className={`category-choice ${isSel ? 'selected' : ''}`}
                      onClick={() => setSelectedCat(cat)}
                    >
                      <div className="cat-icon-badge" style={{ backgroundColor: cat.bgColor, marginRight: 0 }}>
                        {getCatIcon(cat.icon, cat.color, 18)}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: isSel ? cat.color : '#334155' }}>
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ghi chú ô nền trắng */}
            <div className="input-group">
              <label className="input-label">Ghi chú (Tùy chọn)</label>
              <input
                type="text"
                className="text-input"
                placeholder={selectedCat.id === 'gas' ? 'VD: Đổ 50k xăng A95...' : 'VD: Cơm trưa, cafe sáng...'}
                value={expenseNote}
                onChange={(e) => setExpenseNote(e.target.value)}
              />
            </div>

            <button className="btn-submit" onClick={handleSaveExpense}>
              <CheckCircle size={20} />
              Lưu Chi Tiêu {expenseAmountStr ? `(${expenseAmountStr} đ)` : ''}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: THIẾT LẬP THÁNG / CHỈNH SỬA NGÂN SÁCH (CỔNG ĐIỀN NỀN TRẮNG) */}
      {showSetupModal && (
        <div className="modal-fullscreen">
          <div className="modal-header">
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                {isMandatorySetup ? 'CẦN THIẾT LẬP ĐỂ SỬ DỤNG' : 'CẬP NHẬT NGÂN SÁCH'}
              </div>
              <div className="modal-title">{formatMonthTitle(currentMonthKey)}</div>
            </div>
            {!isMandatorySetup && (
              <button className="modal-close-btn" onClick={() => setShowSetupModal(false)}>
                <X size={24} />
              </button>
            )}
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {previousMonthData && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '12px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E40AF' }}>Kế thừa từ tháng trước?</div>
                  <div style={{ fontSize: '11px', color: '#3B82F6' }}>Sao chép ngân sách và các khoản cố định cũ trong 1 chạm.</div>
                </div>
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  onClick={handleCopyPrev}
                >
                  <Copy size={14} /> Sao chép
                </button>
              </div>
            )}

            {/* Bước 1: Ngân sách */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '11px', backgroundColor: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>
                  1
                </span>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>Ngân sách / Thu nhập tháng này</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px', marginLeft: '30px' }}>
                Tổng số tiền bạn dự kiến chi tiêu trong tháng.
              </div>
              <div className="amount-input-box">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="VD: 10.000.000"
                  value={setupBudgetStr}
                  onChange={(e) => setSetupBudgetStr(formatNumberInput(e.target.value))}
                />
                <span className="amount-currency">đ</span>
              </div>
            </div>

            {/* Bước 2: Cố định */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '11px', backgroundColor: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>
                  2
                </span>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>Khoản chi CỐ ĐỊNH trong tháng</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '10px', marginLeft: '30px' }}>
                Tiền phòng, điện nước, internet, trả góp, bảo hiểm...
              </div>

              <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                Gợi ý nhanh (Chạm để thêm):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {DEFAULT_FIXED_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '14px', fontSize: '12px', fontWeight: '600', color: '#334155', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                    onClick={() => {
                      if (setupFixedList.some((f) => f.name.toLowerCase() === p.name.toLowerCase())) {
                        alert('Khoản này đã có!');
                        return;
                      }
                      setSetupFixedList([...setupFixedList, { id: `fix_${Date.now()}`, name: p.name, amount: 0, paid: false }]);
                    }}
                  >
                    + {p.name}
                  </button>
                ))}
              </div>

              {setupFixedList.length > 0 && (
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px' }}>
                  {setupFixedList.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ flex: 1.2, fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{item.name}</span>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '8px', padding: '6px 10px' }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Số tiền"
                          style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', fontWeight: '700', backgroundColor: '#FFFFFF' }}
                          value={item.amount ? formatNumberInput(item.amount) : ''}
                          onChange={(e) => {
                            const val = parseNumber(e.target.value);
                            setSetupFixedList(setupFixedList.map((f) => (f.id === item.id ? { ...f, amount: val } : f)));
                          }}
                        />
                        <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '4px' }}>đ</span>
                      </div>
                      <button
                        style={{ border: 'none', background: 'transparent', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                        onClick={() => setSetupFixedList(setupFixedList.filter((f) => f.id !== item.id))}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontWeight: '700', fontSize: '13px' }}>
                    <span>Tổng cố định:</span>
                    <span style={{ color: '#2563EB' }}>
                      {formatCurrency(setupFixedList.reduce((s, it) => s + (Number(it.amount) || 0), 0))}
                    </span>
                  </div>
                </div>
              )}

              {/* Thêm khoản cố định tự đặt tên */}
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Tên khoản chi tự đặt (VD: Học phí em)"
                  className="text-input"
                  style={{ flex: 1.2, fontSize: '12px' }}
                  value={newCustomFixedName}
                  onChange={(e) => setNewCustomFixedName(e.target.value)}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Số tiền"
                  className="text-input"
                  style={{ flex: 1, fontSize: '12px' }}
                  value={newCustomFixedAmount}
                  onChange={(e) => setNewCustomFixedAmount(formatNumberInput(e.target.value))}
                />
                <button
                  style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', padding: '0 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  onClick={() => {
                    if (!newCustomFixedName.trim()) {
                      alert('Vui lòng nhập tên khoản cố định!');
                      return;
                    }
                    setSetupFixedList([
                      ...setupFixedList,
                      { id: `fix_${Date.now()}`, name: newCustomFixedName.trim(), amount: parseNumber(newCustomFixedAmount) || 0, paid: false },
                    ]);
                    setNewCustomFixedName('');
                    setNewCustomFixedAmount('');
                  }}
                >
                  Thêm
                </button>
              </div>
            </div>

            <button className="btn-submit" onClick={handleSaveSetup} style={{ marginTop: '8px' }}>
              <CheckCircle size={22} /> Hoàn Tất & Bắt Đầu Tháng Này
            </button>
          </div>
        </div>
      )}

      {/* MODAL: LỊCH SỬ CÁC THÁNG */}
      {showHistoryModal && (
        <div className="modal-fullscreen">
          <div className="modal-header">
            <div className="modal-title">Lịch Sử Chi Tiêu Các Tháng</div>
            <button className="modal-close-btn" onClick={() => setShowHistoryModal(false)}>
              <X size={24} />
            </button>
          </div>

          <div style={{ padding: '10px 16px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {historyMonths.map((mKey) => (
              <button
                key={mKey}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: mKey === selectedHistoryMonth ? '#10B981' : '#FFFFFF',
                  color: mKey === selectedHistoryMonth ? '#FFFFFF' : '#475569',
                  border: mKey === selectedHistoryMonth ? 'none' : '1px solid #CBD5E1',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => {
                  setSelectedHistoryMonth(mKey);
                  setHistoryDetails(getMonthData(mKey));
                }}
              >
                {formatMonthTitle(mKey)} {mKey === currentMonthKey ? '(Hiện tại)' : ''}
              </button>
            ))}
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {historyDetails ? (
              <>
                <div className="card">
                  <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>
                    {formatMonthTitle(selectedHistoryMonth)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Ngân sách</div>
                      <div style={{ fontSize: '14px', fontWeight: '700' }}>{formatCurrency(historyDetails.budget)}</div>
                    </div>
                    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Tổng đã chi</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#EF4444' }}>
                        {formatCurrency(
                          (historyDetails.fixedExpenses || []).filter((f) => f.paid).reduce((s, it) => s + (Number(it.amount) || 0), 0) +
                            (historyDetails.dailyExpenses || []).reduce((s, it) => s + (Number(it.amount) || 0), 0)
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Khoản Cố Định</div>
                  {(historyDetails.fixedExpenses || []).map((f) => (
                    <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                      <div>
                        <div>{f.name}</div>
                        <div style={{ fontSize: '11px', color: f.paid ? '#10B981' : '#94A3B8' }}>{f.paid ? '✓ Đã đóng' : '✗ Chưa đóng'}</div>
                      </div>
                      <div style={{ fontWeight: '700' }}>{formatCurrency(f.amount)}</div>
                    </div>
                  ))}
                </div>

                <div className="card">
                  <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
                    Khoản Chi Linh Động ({historyDetails.dailyExpenses?.length || 0})
                  </div>
                  {(historyDetails.dailyExpenses || []).map((d) => (
                    <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{d.categoryName}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{formatDisplayDate(d.date)} • {d.note || 'Không ghi chú'}</div>
                      </div>
                      <div style={{ fontWeight: '700', color: '#EF4444' }}>-{formatCurrency(d.amount)}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#94A3B8', padding: '30px' }}>Không có dữ liệu tháng này.</div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CÀI ĐẶT */}
      {showSettingsModal && (
        <div className="modal-fullscreen">
          <div className="modal-header">
            <div className="modal-title">Cài Đặt & Nhắc Nhở</div>
            <button className="modal-close-btn" onClick={() => setShowSettingsModal(false)}>
              <X size={24} />
            </button>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="icon-circle" style={{ backgroundColor: '#ECFDF5' }}>
                  <Bell size={20} color="#10B981" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>Nhắc nhở lúc 18h00 mỗi ngày</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Nhắc bạn ghi lại chi tiêu hôm nay nếu chưa nhập.</div>
                </div>
                <input
                  type="checkbox"
                  style={{ width: '20px', height: '20px', accentColor: '#10B981' }}
                  checked={settings.reminderEnabled}
                  onChange={(e) => {
                    const updated = saveSettings({ reminderEnabled: e.target.checked });
                    setSettings(updated);
                  }}
                />
              </div>

              <button
                style={{ width: '100%', marginTop: '14px', padding: '10px', backgroundColor: '#FFFFFF', color: '#065F46', border: '1.5px solid #10B981', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                onClick={testNotification}
              >
                🔔 Thử gửi thông báo ngay bây giờ
              </button>
            </div>

            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '12px', fontSize: '12px', color: '#1E40AF', lineHeight: '18px' }}>
              <strong>🔒 Hoạt động Offline & Bảo Mật:</strong> Dữ liệu được lưu trực tiếp trên trình duyệt điện thoại của bạn. Không cần mạng và không gửi thông tin tài chính đi đâu.
            </div>

            <button
              style={{ width: '100%', padding: '12px', backgroundColor: '#FFFFFF', color: '#B91C1C', border: '1.5px solid #FECACA', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }}
              onClick={() => {
                if (confirm('⚠️ Bạn có chắc muốn xóa toàn bộ dữ liệu ứng dụng?')) {
                  localStorage.clear();
                  loadData();
                  setShowSettingsModal(false);
                  alert('Đã xóa dữ liệu.');
                }
              }}
            >
              Đặt lại ứng dụng & Xóa toàn bộ dữ liệu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

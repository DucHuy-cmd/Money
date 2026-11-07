# 💰 Ứng Dụng Quản Lý Chi Tiêu Cá Nhân (Mobile App)

Ứng dụng quản lý chi tiêu cá nhân tối giản, tối ưu trải nghiệm trên điện thoại **Android** (và iOS), hoạt động **100% Offline**, bảo mật dữ liệu tuyệt đối và tích hợp **nhắc nhở tự động 18h00 mỗi ngày**.

---

## 🌟 Tính Năng Nổi Bật Theo Nhu Cầu Của Bạn

1. **Thiết lập bắt buộc đầu tháng (Onboarding & Ngày mùng 1 hàng tháng):**
   - Khi vừa vào ứng dụng lần đầu hoặc khi bước sang ngày 1 của tháng mới: App buộc người dùng phải nhập **Ngân sách tháng** và **Danh sách khoản CỐ ĐỊNH**.
   - Có nút **"Kế thừa từ tháng trước"** (1 chạm sao chép toàn bộ danh sách cố định & ngân sách cũ sang tháng mới mà không cần gõ lại).
   - Tự động lưu trữ và đóng băng dữ liệu các tháng cũ trong mục **Lịch sử**, không bao giờ bị mất.

2. **Phân chia 2 nhóm chi tiêu chính:**
   - **Khoản CỐ ĐỊNH:** Tiền phòng, tiền điện, nước, internet, trả góp, bảo hiểm, gửi về nhà... Đánh dấu tick `[x]` khi đã thanh toán trong tháng.
   - **Khoản LINH ĐỘNG:** 
     - *Tiền ăn*: Ăn sáng, trưa, tối, cafe... (thường nhập hằng ngày).
     - *Tiền xăng*: Chỉ nhập khi nào có đổ xăng thực tế (không ép buộc mỗi ngày).
     - *Mua sắm, chi tiêu phát sinh khác*.
     - Bàn phím số nhanh: các nút tắt `+20k`, `+30k`, `+50k`, `+100k`, `+200k`, `+500k` giúp ghi chép chỉ mất đúng 3 giây.

3. **Thông báo nhắc nhở tự động 18h00 mỗi ngày:**
   - Vào lúc **18:00** hàng ngày, nếu bạn chưa nhập bất kỳ khoản chi tiêu nào hôm nay, điện thoại sẽ tự động rung/chuông thông báo:
     > *"💰 Bạn ơi, 18h00 rồi! Hôm nay bạn đã chi tiêu gì chưa? Dành 5 giây ghi lại nhé!"*
   - Nếu bạn đã nhập chi tiêu trong ngày hoặc bấm nút **"Hôm nay không tiêu gì"**, ứng dụng sẽ tự động bỏ qua và không làm phiền bạn lúc 18h00.
   - Hỗ trợ nút **"Thử gửi thông báo ngay"** trong Cài đặt để kiểm tra chuông/rung trên máy.

4. **Đơn giản & Tiện lợi nhất có thể:**
   - Giao diện trực quan: hiển thị rõ **Số tiền còn lại trong tháng**, thanh tiến độ ngân sách và số tiền đã tiêu hôm nay.
   - Nút `+` to ở góc màn hình giúp mở form nhập tiền ngay lập tức.
   - Lưu trữ trực tiếp trên bộ nhớ máy bằng `@react-native-async-storage/async-storage`, không tốn chi phí thuê server, không lo rò rỉ dữ liệu tài chính.

---

## 📱 Hướng Dẫn Chạy & Dùng Ngay Trên Điện Thoại Android

### Bước 1: Cài ứng dụng Expo Go trên điện thoại
* Mở **Google Play Store (CH Play)** trên điện thoại Android, tìm và tải ứng dụng **Expo Go** (miễn phí).

### Bước 2: Khởi động app trên máy tính
Trong thư mục dự án này trên máy tính, mở terminal và gõ:
```bash
npm start
```
*(Hoặc `npx expo start`)*

### Bước 3: Quét mã QR để mở app trên điện thoại
* Terminal máy tính sẽ hiển thị một **mã QR**.
* Mở app **Expo Go** trên điện thoại Android, chọn **Scan QR code** và quét mã QR trên màn hình máy tính.
* Ứng dụng sẽ tự động tải vào điện thoại của bạn và chạy mượt mà!

*(Lưu ý: Điện thoại và máy tính nên kết nối chung một mạng Wi-Fi).*

---

## 🛠 Cấu Trúc Mã Nguồn

```
QuanLyChiTieu/
├── src/
│   ├── components/
│   │   ├── Header.js              # Thanh tiêu đề, chọn tháng, vào lịch sử/cài đặt
│   │   ├── BudgetOverviewCard.js  # Thẻ ngân sách tổng quan, tiến độ chi tiêu
│   │   ├── FixedExpensesCard.js   # Quản lý & đánh dấu các khoản Cố định
│   │   ├── DailyExpensesList.js   # Danh sách chi tiêu Linh động (Hôm nay / Cả tháng)
│   │   ├── AddExpenseModal.js     # Popup nhập nhanh chi tiêu dưới 3 giây
│   │   ├── MonthSetupModal.js     # Màn hình bắt buộc thiết lập đầu tháng / ngày mùng 1
│   │   ├── MonthHistoryModal.js   # Xem lại lịch sử các tháng trước
│   │   └── SettingsModal.js       # Bật/tắt giờ nhắc nhở 18h00 & thử thông báo
│   ├── constants/
│   │   └── categories.js          # Danh mục Cố định & Linh động (Ăn uống, Xăng, Cafe...)
│   ├── services/
│   │   ├── storage.js             # Lưu trữ dữ liệu SQLite/AsyncStorage theo tháng
│   │   └── notification.js        # Cấu hình Local Notification lúc 18h00 mỗi ngày
│   └── utils/
│       └── format.js              # Định dạng tiền tệ VNĐ, ngày tháng
├── App.js                         # Màn hình chính kết nối toàn bộ logic
├── app.json                       # Cấu hình quyền Android & Notification
└── package.json
```

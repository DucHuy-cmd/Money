export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
};

export const sendNotification = (title, body) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: './icon-192.png',
          badge: './icon-192.png',
          vibrate: [200, 100, 200],
        });
      });
    } else {
      new Notification(title, {
        body,
        icon: './icon-192.png',
      });
    }
    return true;
  } catch (e) {
    console.error('Notification error:', e);
    return false;
  }
};

export const testNotification = async () => {
  const granted = await requestNotificationPermission();
  if (!granted) {
    alert('Vui lòng cho phép quyền thông báo trên trình duyệt/điện thoại của bạn!');
    return;
  }
  sendNotification(
    '🔔 Thử nghiệm thông báo thành công!',
    'Đây là cách app sẽ nhắc bạn vào lúc 18h00 mỗi ngày nếu chưa ghi chi tiêu.'
  );
};

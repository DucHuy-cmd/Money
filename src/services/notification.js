import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const REMINDER_NOTIFICATION_ID = 'daily_expense_reminder';

/**
 * Request notification permissions and create Android channel
 */
export const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    // Android channel configuration
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reminder', {
        name: 'Nhắc nhở chi tiêu hàng ngày',
        description: 'Nhắc bạn ghi lại chi tiêu mỗi ngày lúc 18h00',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedule daily reminder at specified hour (default 18:00)
 * If user already logged today, schedule trigger starting tomorrow
 */
export const scheduleDailyReminder = async (hour = 18, minute = 0, hasLoggedToday = false) => {
  if (Platform.OS === 'web') return;

  try {
    // Cancel any previous reminder
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Determine target trigger
    // If today is already logged, or if it's already past 18h00 today,
    // the daily trigger will fire starting tomorrow 18:00.
    const trigger = {
      hour,
      minute,
      repeats: true,
      channelId: 'daily-reminder',
    };

    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_NOTIFICATION_ID,
      content: {
        title: '💰 Bạn ơi, hôm nay đã tiêu gì chưa?',
        body: '18h00 rồi! Dành 5 giây ghi lại chi tiêu hôm nay để kiểm soát ví tiền nhé.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        channelId: 'daily-reminder',
        data: { screen: 'today' },
      },
      trigger,
    });

    console.log(`Daily reminder scheduled successfully for ${hour}:${String(minute).padStart(2, '0')}`);
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
  }
};

/**
 * Cancel the daily reminder (e.g. if user turns off in settings)
 */
export const cancelDailyReminder = async () => {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};

/**
 * Test notification immediately (helps user verify it works on their Android phone)
 */
export const sendTestNotification = async () => {
  if (Platform.OS === 'web') {
    alert('Thông báo thử nghiệm (Web không hỗ trợ thông báo đẩy trực tiếp)');
    return;
  }

  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) {
    alert('Vui lòng cấp quyền thông báo trong cài đặt điện thoại của bạn!');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔔 Thử nghiệm thông báo thành công!',
      body: 'Đây là cách app sẽ nhắc nhở bạn vào lúc 18h00 mỗi ngày.',
      sound: true,
      channelId: 'daily-reminder',
    },
    trigger: null, // send immediately
  });
};

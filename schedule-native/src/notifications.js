import * as Notifications from 'expo-notifications';
import { notificationPlan } from './planner.js';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
let queue = Promise.resolve();
export function syncNotifications(events) {
  const run = async () => {
    const permission = await Notifications.getPermissionsAsync();
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    for (const item of existing) if (item.identifier.startsWith('planner-')) await Notifications.cancelScheduledNotificationAsync(item.identifier);
    if (!permission.granted) return 0;
    const next = notificationPlan(events);
    for (const { event, when, date } of next) await Notifications.scheduleNotificationAsync({
      identifier: `planner-${event.id}-${date}`,
      content: { title: event.title, body: `${date} ${event.time}`, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(when) },
    });
    return next.length;
  };
  queue = queue.catch(() => {}).then(run);
  return queue;
}
export async function requestNotifications() {
  const current = await Notifications.getPermissionsAsync();
  return current.granted ? current : Notifications.requestPermissionsAsync();
}

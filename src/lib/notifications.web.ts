// Web stub: expo-notifications isn't supported on web and its native module
// can't even be bundled for the web target, so this file is loaded instead of
// notifications.ts there (Metro's platform-specific extension resolution).

export async function ensureAndroidChannel(): Promise<void> {}

export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function scheduleDailyReminder(_hour: number, _minute: number): Promise<void> {}

export async function cancelDailyReminder(): Promise<void> {}

export async function getExpoPushToken(): Promise<string | null> {
  return null;
}

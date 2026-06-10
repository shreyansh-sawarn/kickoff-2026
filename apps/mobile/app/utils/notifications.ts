import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure how notifications behave when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ASYNC_PUSH_TOKEN_KEY = "wc26-push-token";

/**
 * Request notification permissions and register for push notifications.
 * Returns the Expo Push Token if successful, or null on failure.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === "web") {
    return null;
  }

  // 1. Check if we are running on a physical device (Expo push requires a physical device)
  if (!Device.isDevice) {
    console.warn("Must use physical device for Expo Push Notifications. Emulators will skip registration.");
    return null;
  }

  try {
    // 2. Check current permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // 3. Request permissions if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notification permissions were not granted by the user!");
      return null;
    }

    // 4. Fetch Expo Push Token
    // In newer Expo versions, projectId is automatically resolved from app.json/expo-constants if omitted.
    const tokenData = await Notifications.getExpoPushTokenAsync();
    token = tokenData.data;
    console.log("Expo Push Token successfully generated:", token);

    // Save token locally
    if (token) {
      await AsyncStorage.setItem(ASYNC_PUSH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error("Error registering for push notifications:", error);
  }

  // 5. Setup Android notification channels (critical for Android 8.0+)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#10b981", // Emerald accent color
    });
  }

  return token;
}

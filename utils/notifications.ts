import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { Medication } from './storage'

let hasLoggedPushToken = false;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function setupAndroidNotificationChannel() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#0077b6",
        });
    }
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Notification permission not granted');
        return null;
    }

    try {
        const tokenResponse = await Notifications.getExpoPushTokenAsync({
            projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
        });

        if (!hasLoggedPushToken) {
            console.log('Expo Push Token:', tokenResponse.data);
            hasLoggedPushToken = true;
        }
        return tokenResponse.data;

    } catch (error) {
        console.error('Error Getting Push Token', error);
        return null;
    }
}

export async function scheduleMedicationReminder(
    medication: Medication
): Promise<string[] | undefined> {
    if (!medication.reminderEnabled) return;

    try {
        const identifiers: string[] = [];

        const getDurationDays = (duration: string): number => {
            if (duration.includes("7")) return 7;
            if (duration.includes("14")) return 14;
            if (duration.includes("30")) return 30;
            if (duration.includes("90")) return 90;
            return 30;
        };

        const days = getDurationDays(medication.duration);
        const startDate = new Date(medication.startDate);

        for (let day = 0; day < days; day++) {
            for (const time of medication.times) {
                const [hours, minutes] = time.split(":").map(Number);

                const triggerDate = new Date(startDate);
                triggerDate.setDate(startDate.getDate() + day);
                triggerDate.setHours(hours, minutes, 0, 0);

                if (triggerDate <= new Date()) continue;

                const id = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "Medication Reminder 💊",
                        body: `Time to take ${medication.name} (${medication.dosage})`,
                        data: { medicationId: medication.id },
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: triggerDate,
                        channelId: "default",
                    }
                });

                identifiers.push(id);
            }
        }

        return identifiers;
    } catch (error) {
        console.error("Error Scheduling Medication Reminder", error);
        return undefined;
    }
}

export async function scheduleRefillReminder(
    medication: Medication
): Promise<string | undefined> {
    if (!medication.refillReminder) return;

    try {
        if (medication.currentSupply <= medication.refillAt) {
            const identifier = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Refill Reminder",
                    body: `Your ${medication.name} supply is running low. Current: ${medication.currentSupply}`,
                    data: { medicationId: medication.id, type: "refill" },
                },
                trigger: null,
            });
            return identifier;
        }
    } catch (error) {
        console.error("Error Scheduling Refill Reminder", error);
        return undefined;
    }
}

export async function cancelMedicationReminders(
    medicationId: string
): Promise<void> {
    try {
        const scheduledNotifications =
            await Notifications.getAllScheduledNotificationsAsync();

        for (const notification of scheduledNotifications) {
            const data = notification.content.data as {
                medicationId?: string;
            } | null;

            if (data?.medicationId === medicationId) {
                await Notifications.cancelScheduledNotificationAsync(
                    notification.identifier
                );
            }
        }
    } catch (error) {
        console.error("Error Cancelling Reminder", error);
    }
}

export async function updateMedicationReminders(
    medication: Medication
): Promise<void> {
    try {
        await cancelMedicationReminders(medication.id);
        await scheduleMedicationReminder(medication);
        await scheduleRefillReminder(medication);
    } catch (error) {
        console.error("Error Updating Medication Reminders", error);
    }
}
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { Medication } from './storage'

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
    let token: string | null = null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return null;
    }

    try {
        const response = await Notifications.getExpoPushTokenAsync();
        token = response.data;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#0077b6"
            })
        }
        return token;
    } catch (error) {
        console.error("Error Getting Push Token", error);
        return null;
    }
}

export async function scheduleMedicationReminder(
    medication: Medication
): Promise<string[] | undefined> {
    if (!medication.reminderEnabled) return;

    try {
        const identifiers: string[] = [];

        for (const time of medication.times) {
            const [hours, minutes] = time.split(":").map(Number);

            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Medication Reminder",
                    body: `Time To Take ${medication.name} (${medication.dosage})`,
                    data: { medicationId: medication.id },
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                    hour: hours,
                    minute: minutes,
                    repeats: true,
                },
            });

            identifiers.push(id);
        }

        return identifiers;
    } catch (error) {
        console.error("Error Scheduling Medication Reminder", error);
        return undefined;
    }
}

export async function scheduleRefillReminder(medication: Medication): Promise<string | undefined> {
    if (!medication.refillReminder) return;

    try {
        if (medication.currentSupply <= medication.refillAt) {
            const identifier = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Refill Reminder",
                    body: `Your ${medication.name} Supply Is Running Low. Current Supply: ${medication.currentSupply}`,
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
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

        for (const notification of scheduledNotifications) {
            const data = notification.content.data as {
                medicationId?: string;
            } | null;
            if (data?.medicationId === medicationId) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            }
        }
    } catch (error) {
        console.error("Error Cancelling Reminder", error);
    }
}

export async function updateMedicationReminders(medication: Medication): Promise<void> {
    try {
        await cancelMedicationReminders(medication.id);

        await scheduleMedicationReminder(medication);
        await scheduleRefillReminder(medication);
    } catch (error) {
        console.error("Error Updating Medication Reminders", error)
    }
}
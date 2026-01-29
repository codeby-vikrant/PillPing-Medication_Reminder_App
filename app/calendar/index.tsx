import React, { useState, useCallback, JSX } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  DoseHistory,
  getDoseHistory,
  getMedication,
  Medication,
  recordDose,
} from "@/utils/storage";
import { useFocusEffect } from "@react-navigation/native";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatTo12Hour = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);

  const period = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  const m = minute.toString().padStart(2, "0");

  return `${h}:${m} ${period}`;
};

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseHistory, setDoseHistory] = useState<DoseHistory[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [meds, history] = await Promise.all([
        getMedication(),
        getDoseHistory(),
      ]);

      setMedications(meds);
      setDoseHistory(history);
    } catch (error) {
      console.error("Error Loading Calendar Data", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(selectedDate);

  const renderCalendar = () => {
    const calendar: JSX.Element[] = [];
    let week: JSX.Element[] = [];
    let weekIndex = 0;

    for (let i = 0; i < firstDay; i++) {
      week.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    for (let day = 1; day <= days; day++) {
      const date = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        day,
      );
      const isToday = new Date().toDateString() === date.toDateString();
      const hasDoses = doseHistory.some(
        (dose) =>
          new Date(dose.timestamp).toDateString() === date.toDateString(),
      );
      week.push(
        <TouchableOpacity
          key={`${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${day}`}
          style={[
            styles.calendarDay,
            isToday && styles.today,
            hasDoses && styles.hasEvents,
          ]}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={[styles.dayText, isToday && styles.todayText]}>
            {day}
          </Text>
          {hasDoses && <View style={styles.eventDot} />}
        </TouchableOpacity>,
      );

      if ((firstDay + day) % 7 === 0 || day === days) {
        while (week.length < 7) {
          week.push(
            <View
              key={`empty-end-${week.length}-${weekIndex}`}
              style={styles.calendarDay}
            />,
          );
        }
        calendar.push(
          <View
            key={`week-${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${weekIndex++}`}
            style={styles.calendarWeek}
          >
            {week}
          </View>,
        );
        week = [];
      }
    }
    return calendar;
  };

  const isMedicationActiveOnDate = (medication: Medication, date: Date) => {
    const target = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime();

    const startDateObj = new Date(medication.startDate);
    const start = new Date(
      startDateObj.getFullYear(),
      startDateObj.getMonth(),
      startDateObj.getDate(),
    );

    const durationDays = parseInt(medication.duration, 10);

    const end = new Date(start);
    end.setDate(start.getDate() + durationDays - 1);

    return target >= start.getTime() && target <= end.getTime();
  };

  const renderMedicationsForDate = () => {
    const dateStr = selectedDate.toDateString();

    const dayDoses = doseHistory.filter(
      (dose) => new Date(dose.timestamp).toDateString() === dateStr,
    );

    return medications
      .filter((medication) =>
        isMedicationActiveOnDate(medication, selectedDate),
      )
      .flatMap((medication) =>
        medication.times.map((time) => {
          const taken = dayDoses.some(
            (dose) =>
              dose.medicationId === medication.id &&
              dose.time === time &&
              dose.taken,
          );

          return (
            <View
              key={`${medication.id}-${time}`}
              style={styles.medicationCard}
            >
              <View
                style={[
                  styles.medicationColor,
                  { backgroundColor: medication.color },
                ]}
              />

              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.medicationDosage}>{medication.dosage}</Text>
                <Text style={styles.medicationTime}>
                  {formatTo12Hour(time)}
                </Text>
              </View>

              {taken ? (
                <View style={styles.takenBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={"#0077b6"}
                  />
                  <Text style={styles.takenText}>Taken</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.takeDoseButton,
                    { backgroundColor: medication.color },
                  ]}
                  onPress={async () => {
                    await recordDose(
                      medication.id,
                      time,
                      true,
                      new Date().toISOString(),
                    );
                    loadData();
                  }}
                >
                  <Text style={styles.takeDoseText}>Take</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }),
      );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0077b6", "#90e0ef"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color={"#0077b6"} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>

        <View style={styles.calendarContainer}>
          <View style={styles.monthHeader}>
            <TouchableOpacity
              onPress={() =>
                setSelectedDate(
                  new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth() - 1,
                    1,
                  ),
                )
              }
            >
              <Ionicons name="chevron-back" size={24} color={"#333"} />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {selectedDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setSelectedDate(
                  new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth() + 1,
                    1,
                  ),
                )
              }
            >
              <Ionicons name="chevron-forward" size={24} color={"#333"} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayHeader}>
            {WEEKDAYS.map((day) => (
              <Text key={day} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>

          {renderCalendar()}
        </View>

        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>
            {selectedDate.toLocaleDateString("default", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderMedicationsForDate()}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 140 : 120,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 15,
  },
  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  weekdayHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    color: "#666",
    fontWeight: "500",
  },
  calendarWeek: {
    flexDirection: "row",
    marginBottom: 5,
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    color: "#333",
  },
  today: {
    backgroundColor: "#0077b6",
  },
  todayText: {
    color: "#fff",
    fontWeight: "600",
  },
  hasEvents: {
    position: "relative",
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#0077b6",
    position: "absolute",
    bottom: "15%",
  },
  scheduleContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  medicationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medicationColor: {
    width: 12,
    height: 40,
    borderRadius: 6,
    marginRight: 15,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  medicationTime: {
    fontSize: 14,
    color: "#666",
  },
  takeDoseButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  takeDoseText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  takenBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  takenText: {
    color: "#0077b6",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
});

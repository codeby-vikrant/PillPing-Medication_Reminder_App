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
} from "@/utils/storage";
import { useFocusEffect } from "@react-navigation/native";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  }, [selectedDate]);

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

    for (let i = 0; i < firstDay; i++) {
      week.push(<View key={`empty-${i}`} />);
    }

    for (let day = 1; day <= days; day++) {
      const date = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
      );
      const isToday = new Date().toDateString() === date.toDateString();
      const hasDoses = doseHistory.some(
        (dose) =>
          new Date(dose.timestamp).toDateString() === date.toDateString(),
      );
      week.push(
        <TouchableOpacity key={day}>
          <Text>{day}</Text>
          {hasDoses && <View />}
        </TouchableOpacity>,
      );

      if ((firstDay + day) % 7 === 0 || day === days) {
        calendar.push(<View key={day}>{week}</View>);
        week = [];
      }
    }
    return calendar;
  };

  return (
    <View>
      <LinearGradient
        colors={["#0077b6", "#90e0ef"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      ></LinearGradient>
      <View>
        <View>
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={28} color={"#0077b6"} />
          </TouchableOpacity>
        </View>
        <Text>Calendar</Text>
      </View>

      <View>
        <View>
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={24} color={"#333"} />
          </TouchableOpacity>
          <Text>
            {selectedDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </Text>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={24} color={"#333"} />
          </TouchableOpacity>
        </View>
        <View>
          {WEEKDAYS.map((day) => (
            <Text key={day}>{day}</Text>
          ))}
        </View>
        <View>
          <Text>
            {selectedDate.toLocaleDateString("default", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <ScrollView></ScrollView>
        </View>
      </View>
    </View>
  );
}

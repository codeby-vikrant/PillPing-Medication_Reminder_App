import React, { useState, useCallback } from "react";
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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());

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

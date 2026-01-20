import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
  Platform,
  Alert,
} from "react-native";

const FREQUENCIES = [
  {
    id: "1",
    label: "Once Daily",
    icon: "sunny-outline" as const,
    times: ["09:00"],
  },
  {
    id: "2",
    label: "Twice Daily",
    icon: "sync-outline" as const,
    times: ["09:00", "21:00"],
  },
  {
    id: "3",
    label: "Three Times Daily",
    icon: "time-outline" as const,
    times: ["09:00", "15:00", "21:00"],
  },
  {
    id: "4",
    label: "Four Times Daily",
    icon: "repeat-outline" as const,
    times: ["09:00", "13:00", "17:00", "21:00"],
  },
  {
    id: "5",
    label: "As Needed",
    icon: "calendar-outline" as const,
    times: [],
  },
];

export default function AddMedicationScreen() {
  const renderFrequencyOptions = () => {
    return <View></View>;
  };

  return (
    <View>
      <LinearGradient
        colors={["#0077b6", "#90e0ef"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View>
        <View>
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={28} color={"#0077b6"} />
          </TouchableOpacity>
          <Text>New Medication</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <View>
              <TextInput
                placeholder="Medication Name"
                placeholderTextColor={"#999"}
              />
            </View>
            <View>
              <TextInput
                placeholder="Dosage (e.g., 500mg)"
                placeholderTextColor={"#999"}
              />
            </View>
            <View>
              <Text>How Often?</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

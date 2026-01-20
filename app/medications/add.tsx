import { Ionicons } from "@expo/vector-icons";
import { Label } from "@react-navigation/elements";
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
import DateTimePicker from "@react-native-community/datetimepicker";

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

const DURATIONS = [
  { id: "1", Label: "7 Days", value: 7 },
  { id: "2", label: "14 Days", value: 14 },
  { id: "3", label: "30 Days", value: 30 },
  { id: "4", label: "90 Days", value: 90 },
  { id: "5", label: "Ongoing", value: -1 },
];

export default function AddMedicationScreen() {
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    startDate: new Date(),
    times: ["9:00"],
    notes: "",
    reminderEnabled: true,
    refillReminder: false,
    currentSupply: "",
    refillAt: "",
  });

  const renderFrequencyOptions = () => {
    return (
      <View>
        {FREQUENCIES.map((freq) => (
          <TouchableOpacity key={freq.id}>
            <View>
              <Ionicons name={freq.icon} size={24} />
              <Text>{freq.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderDurationOptions = () => {
    return (
      <View>
        {DURATIONS.map((dur) => (
          <TouchableOpacity key={dur.id}>
            <View>
              <Text>{dur.value > 0 ? dur.value : "∞"}</Text>
              <Text>{dur.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
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
              {renderFrequencyOptions()}
              <Text>For How Long?</Text>
              {renderDurationOptions()}
              <TouchableOpacity>
                <View>
                  <Ionicons name="calendar" size={20} color={"#0077b6"} />
                </View>
                <Text>Starts {}</Text>
              </TouchableOpacity>
              <DateTimePicker mode="date" value={form.startDate} />
              <DateTimePicker
                mode="time"
                value={(() => {
                  const [hours, minutes] = form.times[0].split(":").map(Number);
                  const date = new Date();
                  date.setHours(hours, minutes, 0, 0);
                  return date;
                })()}
              />
            </View>
          </View>
          <View>
            <View>
              <View>
                <View>
                  <View>
                    <Ionicons name="notifications" color={"#0077b6"} />
                  </View>
                  <View>
                    <Text>Reminders</Text>
                    <Text>
                      {"Get Notified When It's Time To Take Your Medication"}
                    </Text>
                  </View>
                </View>
                <Switch
                  thumbColor={"#fff"}
                  trackColor={{ false: "#ddd", true: "#0077b6" }}
                />
              </View>
            </View>
          </View>
          <View>
            <View>
              <TextInput
                placeholder="Add Notes Or Special Instructions..."
                placeholderTextColor={"#999"}
              />
            </View>
          </View>
        </ScrollView>
        <View>
          <TouchableOpacity>
            <LinearGradient
              colors={["#0077b6", "#90e0ef"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0 }}
            >
              <Text>
                Add Medications
                {
                  // isSubmitting ? "Adding" : "Add Medications"
                }
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

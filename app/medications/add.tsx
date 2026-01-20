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
import DateTimePicker from "@react-native-community/datetimepicker";

const { width } = Dimensions.get("window");

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
  { id: "1", label: "7 Days", value: 7 },
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

  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");

  const renderFrequencyOptions = () => {
    return (
      <View style={styles.optionsGrid}>
        {FREQUENCIES.map((freq) => (
          <TouchableOpacity
            key={freq.id}
            style={[
              styles.optionsCard,
              selectedFrequency === freq.label && styles.selectedOptionsCard,
            ]}
          >
            <View
              style={[
                styles.optionsIcon,
                selectedFrequency === freq.label && styles.selectedOptionsIcon,
              ]}
            >
              <Ionicons
                name={freq.icon}
                size={24}
                color={selectedFrequency === freq.label ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.optionsLabel,
                  selectedFrequency === freq.label &&
                    styles.selectedOptionsLabel,
                ]}
              >
                {freq.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderDurationOptions = () => {
    return (
      <View style={styles.optionsGrid}>
        {DURATIONS.map((dur) => (
          <TouchableOpacity
            key={dur.id}
            style={[
              styles.optionsCard,
              selectedDuration === dur.label && styles.selectedOptionsCard,
            ]}
          >
            <Text
              style={[
                styles.durationNumber,
                selectedDuration === dur.label && styles.selectedDurationNumber,
              ]}
            >
              {dur.value > 0 ? dur.value : "∞"}
            </Text>
            <Text
              style={[
                styles.optionsLabel,
                selectedDuration === dur.label && styles.selectedOptionsLabel,
              ]}
            >
              {dur.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0077b6", "#90e0ef"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={"#0077b6"} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Medication</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={styles.formContentContainer}
        >
          <View style={styles.section}>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Medication Name"
                placeholderTextColor={"#999"}
                style={[styles.mainInput, errors.name && styles.inputError]}
                value={form.name}
                onChangeText={(text) => {
                  setForm({ ...form, name: text });
                  if (errors.name) {
                    setErrors({ ...errors, name: "" });
                  }
                }}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Dosage (e.g., 500mg)"
                placeholderTextColor={"#999"}
                style={[styles.mainInput, errors.name && styles.inputError]}
                value={form.dosage}
                onChangeText={(text) => {
                  setForm({ ...form, dosage: text });
                  if (errors.dosage) {
                    setErrors({ ...errors, dosage: "" });
                  }
                }}
              />
              {errors.dosage && (
                <Text style={styles.errorText}>{errors.dosage}</Text>
              )}
            </View>
            <View style={styles.container}>
              <Text style={styles.sectionTitle}>How Often?</Text>
              {errors.frequency && (
                <Text style={styles.errorText}>{errors.frequency}</Text>
              )}
              {renderFrequencyOptions()}
              <Text style={styles.sectionTitle}>For How Long?</Text>
              {errors.duration && (
                <Text style={styles.errorText}>{errors.duration}</Text>
              )}
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
    width: 35,
    height: 35,
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
  formContentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 15,
    marginTop: 10,
  },
  mainInput: {
    fontSize: 20,
    color: "#333",
    padding: 15,
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputError: {
    borderColor: "#FF5252",
  },
  errorText: {
    color: "#FF5252",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  optionsCard: {
    width: (width - 60) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    margin: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOptionsCard: {
    backgroundColor: "#0077b6",
    borderColor: "#0077b6",
  },
  optionsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  selectedOptionsIcon: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  optionsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  selectedOptionsLabel: {
    color: "#fff",
  },
  durationNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0077b6",
    marginBottom: 5,
  },
  selectedDurationNumber: {
    color: "#fff",
  },
});

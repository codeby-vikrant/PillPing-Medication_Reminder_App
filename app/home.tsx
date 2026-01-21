import {
  DoseHistory,
  getMedication,
  getTodaysDoses,
  Medication,
} from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Modal,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

const width = Dimensions.get("window").width;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const QUICK_ACTIONS = [
  {
    icon: "add-circle-outline" as const,
    label: "Add \nMedication",
    route: "/medications/add" as const,
    color: "#2E7D32",
    gradient: ["#66BB6A", "#43A047"] as [string, string],
  },
  {
    icon: "calendar-outline" as const,
    label: "Calendar \nView",
    route: "/calendar" as const,
    color: "#1976D2",
    gradient: ["#2196F3", "#1976D2"] as [string, string],
  },
  {
    icon: "time-outline" as const,
    label: "History \nLog",
    route: "/history" as const,
    color: "#C2185B",
    gradient: ["#E91E63", "#C2185B"] as [string, string],
  },
  {
    icon: "medical-outline" as const,
    label: "Refill \nTracker",
    route: "/refills" as const,
    color: "#E64A19",
    gradient: ["#FF5722", "#E64A19"] as [string, string],
  },
];

interface CircularProgressProps {
  progress: number;
  totalDoses: number;
  completedDoses: number;
}

function CircularProgress({
  progress,
  totalDoses,
  completedDoses,
}: CircularProgressProps) {
  const animationValue = useRef(new Animated.Value(0)).current;
  const size = width * 0.55;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [animationValue, progress]);

  const strokeDashoffset = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
        <Text style={styles.progressLabel}>
          {completedDoses} of {totalDoses} Doses
        </Text>
      </View>
      <Svg width={size} height={size} style={styles.progressRing}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#fff"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [todaysMedications, setTodaysMedications] = useState<Medication[]>([]);
  const [completedDoses, setCompletedDoses] = useState(0);
  const [doseHistory, setDoseHistory] = useState<DoseHistory[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);

  const loadMedications = useCallback(async () => {
    try {
      const [allMedications, todaysDoses] = await Promise.all([
        getMedication(),
        getTodaysDoses(),
      ]);

      setDoseHistory(todaysDoses);
      setMedications(allMedications);

      const today = new Date();

      const todaysMeds = allMedications.filter((med) => {
        const startDate = new Date(med.startDate);
        const durationsDays = parseInt(med.duration.split(" ")[0]);

        if (
          durationsDays === -1 ||
          (today >= startDate &&
            today <=
              new Date(
                startDate.getTime() + durationsDays * 24 * 60 * 60 * 1000,
              ))
        ) {
          return true;
        } else {
          return false;
        }
      });
      setTodaysMedications(todaysMeds);

      const completed = todaysDoses.filter((dose) => dose.taken).length;
      setCompletedDoses(completed);
    } catch (error) {
      console.error("Error Loading Medications", error);
    }
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <LinearGradient colors={["#0077b6", "#90e0ef"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Daily Progress</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>3</Text>
                </View>
              }
            </TouchableOpacity>
          </View>
          <CircularProgress progress={50} totalDoses={10} completedDoses={5} />
        </View>
      </LinearGradient>
      <View style={styles.content}>
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <Link href={"/medications/add"} key={action.label} asChild>
                <TouchableOpacity style={styles.quickActionsButton}>
                  <LinearGradient
                    colors={action.gradient}
                    style={styles.quickActionsGradient}
                  >
                    <View style={styles.quickActionsContent}>
                      <View style={styles.quickActionsIcons}>
                        <Ionicons name={action.icon} size={24} color="#fff" />
                      </View>
                      <Text style={styles.quickActionsLabel}>
                        {action.label}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{"Today's Schedule"}</Text>
          <Link href="/calendar" asChild>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </Link>
        </View>
        {true ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>
              No Medications Scheduled For Today.
            </Text>
            <Link href="/medications/add">
              <TouchableOpacity style={styles.addMedicationsButton}>
                <Text style={styles.addMedicationsButtonText}>
                  Add Medications
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : (
          [].map((medications) => {
            // const taken
            return (
              <View style={styles.doseCard}>
                <View
                  style={[
                    styles.doseBadge,
                    // { backgroundColor: medications.color },
                  ]}
                >
                  <Ionicons name="medical" size={24} />
                </View>
                <View style={styles.doseInfo}>
                  <View>
                    <Text style={styles.medicineName}>name</Text>
                    <Text style={styles.dosageInfo}>dosage</Text>
                  </View>
                  <View style={styles.doseTime}>
                    <Ionicons name="time-outline" size={16} color="#ccc" />
                    <Text style={styles.timeText}>time</Text>
                  </View>
                </View>
                {true ? (
                  <View style={styles.takeDoseButton}>
                    <Ionicons name="checkmark-circle-outline" size={24} />
                    <Text style={styles.takeDoseText}>Taken</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.takeDoseButton}>
                    <Text style={styles.takeDoseText}>Take</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </View>
      <Modal visible={false} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notification</Text>
            <TouchableOpacity style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {[].map((medication) => (
            <View style={styles.notificationItem}>
              <View style={styles.notificationIcon}>
                <Ionicons name="medical" size={24} />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>medication name</Text>
                <Text style={styles.notificationMessage}>
                  medication dosage
                </Text>
                <Text style={styles.notificationTime}>medication time</Text>
              </View>
            </View>
          ))}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    marginLeft: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff5252",
    borderRadius: 10,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#0077b6",
    minWidth: 20,
  },
  notificationCount: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  progressTextContainer: {
    position: "absolute",
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercentage: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
  },
  progressLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "bold",
  },
  progressDetails: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "bold",
  },
  progressRing: {
    transform: [{ rotate: "-90deg" }],
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 5,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 15,
  },
  quickActionsButton: {
    width: (width - 52) / 2,
    height: 110,
    borderRadius: 16,
    overflow: "hidden",
  },
  quickActionsGradient: {
    flex: 1,
    padding: 15,
  },
  quickActionsContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  quickActionsIcons: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionsLabel: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAllButton: {
    color: "#0077b6",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 20,
  },
  addMedicationsButton: {
    backgroundColor: "#0077b6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addMedicationsButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  doseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  doseBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  doseInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  dosageInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  doseTime: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: 5,
    color: "#666",
    fontSize: 14,
  },
  takeDoseButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginLeft: 10,
  },
  takeDoseText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
});

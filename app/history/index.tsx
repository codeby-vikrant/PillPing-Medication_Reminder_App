import {
  clearAllData,
  DoseHistory,
  getDoseHistory,
  getMedication,
  Medication,
} from "@/utils/storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert } from "react-native";

type EnrinchedDoseHistory = DoseHistory & { medication?: Medication };

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<EnrinchedDoseHistory[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "taken" | "missed"
  >("all");

  const loadHistory = useCallback(async () => {
    try {
      const [doseHistory, medications] = await Promise.all([
        getDoseHistory(),
        getMedication(),
      ]);

      const enrinchedHistory = doseHistory.map((dose) => ({
        ...dose,
        medication: medications.find((med) => med.id === dose.medicationId),
      }));

      setHistory(enrinchedHistory);
    } catch (error) {
      console.error("Error Loading History", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  const groupHistoryByDate = () => {
    const grouped = history.reduce(
      (acc, dose) => {
        const date = new Date(dose.timestamp).toDateString();

        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(dose);
        return acc;
      },
      {} as Record<string, EnrinchedDoseHistory[]>,
    );

    return Object.entries(grouped).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
    );
  };

  const filteredHistory = history.filter((dose) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "taken") return dose.taken;
    if (selectedFilter === "missed") return !dose.taken;
    return true;
  });

  const groupedHistory = groupHistoryByDate();

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "Are You Sure You Want To Clear All Medications Data? This Action Cannot Be Undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              await loadHistory();
              Alert.alert("Success", "All Data Has Been Cleared Successfully");
            } catch (error) {
              console.error("Error Clearing Data", error);
              Alert.alert("Error", "Failed To Clear Data. Please Try Again");
            }
          },
        },
      ],
    );
  };
}

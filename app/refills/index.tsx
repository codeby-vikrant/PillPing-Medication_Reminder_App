import { getMedication, Medication, updateMedication } from "@/utils/storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert } from "react-native";

export default function RefillTrackerScreen() {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);

  const loadMedications = useCallback(async () => {
    try {
      const allMedications = await getMedication();
      setMedications(allMedications);
    } catch (error) {
      console.error("Error loading medications", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [loadMedications]),
  );

  const handleRefill = async (medication: Medication) => {
    try {
      const updatedMedication = {
        ...medication,
        currentSupply: medication.totalSupply,
        lastRefillDate: new Date().toISOString(),
      };

      await updateMedication(updatedMedication);
      await loadMedications();

      Alert.alert(
        "Refill Recorded",
        `${medication.name} has been refilled to ${medication.totalSupply} units`,
      );
    } catch (error) {
      console.error("Error Recording Refill", error);
      Alert.alert("Error, Failed To Record Refill. Please Try Again");
    }
  };
}

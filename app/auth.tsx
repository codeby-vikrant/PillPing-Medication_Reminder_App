import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function AuthScreen() {
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState("");

  return (
    <LinearGradient colors={["#90e0ef", "#0077b6"]}>
      <View>
        <View>
          <Ionicons name="medical" size={80} color={"#fff"} />
        </View>
        <Text>PillPing</Text>
        <Text>A Simple Reminder For Every Pill</Text>
        <View>
          <Text>Welcome Back!</Text>
          <Text>
            {" "}
            {hasBiometrics
              ? "Access your medications securely using Face ID, Touch ID, or PIN"
              : "Enter Your PIN To Continue"}
          </Text>
          <TouchableOpacity>
            <Ionicons
              name={hasBiometrics ? "finger-print-outline" : "keypad-outline"}
              size={24}
              color={"#fff"}
            />
            <Text>
              {isAuthenticating
                ? "Verifying..."
                : hasBiometrics
                  ? "Authenticate"
                  : "Enter PIN"}
            </Text>
          </TouchableOpacity>
          {error && (
            <View>
              <Ionicons name="alert-circle" size={20} color={"#f44336"} />
              <Text>{error}</Text>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

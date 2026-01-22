import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#fff" },
          animation: "slide_from_right",
          header: () => null,
          navigationBarHidden: true,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="/medications/add"
          options={{
            headerShown: false,
            headerBackTitle: "",
            title: "",
          }}
        />
        <Stack.Screen
          name="/refills/index"
          options={{ headerShown: false, headerBackTitle: "", title: "" }}
        />
      </Stack>
      <Stack.Screen
        name="/calendar/index"
        options={{
          headerShown: false,
          headerBackTitle: "",
          title: "",
        }}
      />
      <Stack.Screen
        name="/history/index"
        options={{
          headerShown: false,
          headerBackTitle: "",
          title: "",
        }}
      />
    </>
  );
}

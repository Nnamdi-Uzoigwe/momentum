import { FloatingTabBar } from "@/components/FloatingTabBar";
import { useOnboarding } from "@/lib/onboarding";
import { Redirect, Tabs } from "expo-router";

export default function TabsLayout() {
  const { done } = useOnboarding();

  if (!done) return <Redirect href="/welcome" />;

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="progress" options={{ title: "Progress" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

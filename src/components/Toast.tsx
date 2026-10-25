import { AppText } from "@/components/AppText";
import { Burst } from "@/components/Burst";
import type { ToastInput } from "@/lib/celebrations";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Toast({ message, icon, big }: ToastInput) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeInUp.duration(260)}
      exiting={FadeOutUp.duration(200)}
      pointerEvents="none"
      style={[styles.wrap, { top: insets.top + 8 }]}
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
          <Feather name={icon} size={18} color={colors.accent} />
          <Burst
            trigger={1}
            count={big ? 16 : 8}
            radius={big ? 72 : 36}
            size={big ? 8 : 6}
          />
        </View>
        <AppText variant="bodyStrong" style={styles.text}>
          {message}
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 60,
    elevation: 60,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 18,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flexShrink: 1 },
});

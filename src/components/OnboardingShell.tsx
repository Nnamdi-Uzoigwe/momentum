import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  step: number;
  total?: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  footer: ReactNode;
  children: ReactNode;
};

export function OnboardingShell({
  step,
  total = 3,
  title,
  subtitle,
  onBack,
  footer,
  children,
}: Props) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={[
                styles.circle,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Feather name="chevron-left" size={22} color={colors.text} />
            </Pressable>
          ) : (
            <View style={styles.circle} />
          )}

          <View style={styles.dots}>
            {Array.from({ length: total }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: i + 1 === step ? 24 : 8,
                    backgroundColor:
                      i + 1 <= step ? colors.accent : colors.border,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.circle} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleBlock}>
            <AppText variant="title">{title}</AppText>
            {subtitle ? (
              <AppText variant="body" muted>
                {subtitle}
              </AppText>
            ) : null}
          </View>
          {children}
        </ScrollView>

        <View style={styles.footer}>{footer}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
  },
  dots: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 24 },
  titleBlock: { gap: 8 },
  footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
});

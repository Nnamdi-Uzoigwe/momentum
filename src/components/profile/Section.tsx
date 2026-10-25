import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function Section({ title, subtitle, children }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.head}>
        <AppText variant="heading">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" muted>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    gap: 14,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },
  head: { gap: 2 },
});

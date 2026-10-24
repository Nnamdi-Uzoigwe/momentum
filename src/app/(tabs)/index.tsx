import { AppText } from "@/components/AppText";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/theme";
import { StyleSheet, View } from "react-native";

export default function TodayScreen() {
  const { colors } = useTheme();
  return (
    <Screen>
      <View>
        <AppText variant="caption" muted>
          Good morning
        </AppText>
        <AppText variant="display">Today</AppText>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <AppText variant="heading">Your habits will live here</AppText>
        <AppText variant="body" muted>
          Tap the + button to add your first one.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
});

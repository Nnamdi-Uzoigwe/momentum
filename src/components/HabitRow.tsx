import { AppText } from "@/components/AppText";
import { CheckCircle } from "@/components/CheckCircle";
import type { TodayItem } from "@/db/habits";
import { describeRule } from "@/lib/schedule";
import { useTheme } from "@/theme";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

type Props = {
  item: TodayItem;
  onToggle: (habitId: string) => void;
};

export function HabitRow({ item, onToggle }: Props) {
  const { colors } = useTheme();
  const { habit, done, streak } = item;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (done) Haptics.selectionAsync();
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle(habit.id);
  };

  const streakLabel = `${streak.current}${streak.unit === "week" ? "w" : ""}`;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 90 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 260 });
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={habit.name}
        style={[
          styles.row,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.iconBox,
            { backgroundColor: done ? colors.surfaceAlt : colors.accentSoft },
          ]}
        >
          <Feather
            name={habit.icon as keyof typeof Feather.glyphMap}
            size={22}
            color={done ? colors.textMuted : colors.accent}
          />
        </View>

        <View style={styles.text}>
          <AppText variant="bodyStrong" muted={done} numberOfLines={1}>
            {habit.name}
          </AppText>
          <AppText variant="caption" muted numberOfLines={1}>
            {describeRule(habit.rule)}
          </AppText>
        </View>

        {streak.current > 0 ? (
          <View style={[styles.streak, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="flame" size={14} color={colors.accent} />
            <AppText variant="label" color={colors.accentDeep}>
              {streakLabel}
            </AppText>
          </View>
        ) : null}

        <CheckCircle done={done} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: 2 },
  streak: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
});

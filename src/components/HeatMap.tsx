import { AppText } from "@/components/AppText";
import { parseDateKey } from "@/lib/dates";
import type { HeatmapCell } from "@/lib/stats";
import { useTheme } from "@/theme";
import type { HabitTone } from "@/theme/habitColors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from "react-native";

type Props = {
  columns: HeatmapCell[][];
  tone: HabitTone;
  frozen: Set<string>;
  onPressDay: (key: string) => void;
};

const LABEL_W = 14;
const LABEL_GAP = 8;
const GAP = 4;
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function monthOf(key: string) {
  return parseDateKey(key).getMonth();
}

function monthName(key: string) {
  return parseDateKey(key).toLocaleDateString("en-US", { month: "short" });
}

export function Heatmap({ columns, tone, frozen, onPressDay }: Props) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  const weeks = columns.length;
  const cell =
    width > 0
      ? Math.floor((width - LABEL_W - LABEL_GAP - GAP * (weeks - 1)) / weeks)
      : 0;

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(e.nativeEvent.layout.width);

  const showMonth = (c: number) => {
    const month = monthOf(columns[c][0].key);
    if (c === 0) {
      return columns.length < 2 || monthOf(columns[1][0].key) === month;
    }
    return monthOf(columns[c - 1][0].key) !== month;
  };

  const isFrozen = (c: HeatmapCell) =>
    c.state === "missed" && frozen.has(c.key);

  const styleFor = (c: HeatmapCell): ViewStyle => {
    const base: ViewStyle = {
      width: cell,
      height: cell,
      borderRadius: Math.max(4, cell * 0.3),
      alignItems: "center",
      justifyContent: "center",
    };
    let style: ViewStyle;
    switch (c.state) {
      case "done":
        style = { ...base, backgroundColor: tone.solid };
        break;
      case "missed":
        style = {
          ...base,
          backgroundColor: isFrozen(c) ? tone.soft : `${colors.error}33`,
        };
        break;
      case "today":
        style = { ...base, backgroundColor: tone.soft };
        break;
      case "off":
        style = { ...base, backgroundColor: colors.surfaceAlt };
        break;
      case "before":
        style = {
          ...base,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        };
        break;
      default:
        style = { ...base, opacity: 0 };
    }
    if (c.isToday) {
      style = {
        ...style,
        borderWidth: 2,
        borderColor: c.state === "today" ? tone.solid : colors.text,
      };
    }
    return style;
  };

  return (
    <View onLayout={onLayout}>
      {cell > 0 ? (
        <>
          <View
            style={[
              styles.monthRow,
              { paddingLeft: LABEL_W + LABEL_GAP, gap: GAP },
            ]}
          >
            {columns.map((col, c) => (
              <View key={col[0].key} style={{ width: cell, height: 16 }}>
                {showMonth(c) ? (
                  <AppText
                    variant="label"
                    muted
                    numberOfLines={1}
                    style={styles.monthText}
                  >
                    {monthName(col[0].key)}
                  </AppText>
                ) : null}
              </View>
            ))}
          </View>

          <View style={styles.body}>
            <View style={{ width: LABEL_W, marginRight: LABEL_GAP, gap: GAP }}>
              {DAY_LABELS.map((label, i) => (
                <View
                  key={i}
                  style={{ height: cell, justifyContent: "center" }}
                >
                  <AppText variant="label" muted style={styles.dayLabel}>
                    {label}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={[styles.grid, { gap: GAP }]}>
              {columns.map((col) => (
                <View key={col[0].key} style={{ gap: GAP }}>
                  {col.map((c) => (
                    <Pressable
                      key={c.key}
                      disabled={!c.canToggle}
                      onPress={() => onPressDay(c.key)}
                      accessibilityRole="button"
                      accessibilityLabel={`${c.key}, ${isFrozen(c) ? "frozen" : c.state}`}
                      style={styleFor(c)}
                    >
                      {isFrozen(c) ? (
                        <Ionicons
                          name="snow"
                          size={Math.max(8, Math.round(cell * 0.6))}
                          color={tone.solid}
                        />
                      ) : null}
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: tone.solid }]}
              />
              <AppText variant="label" muted>
                Done
              </AppText>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: `${colors.error}33` },
                ]}
              />
              <AppText variant="label" muted>
                Missed
              </AppText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: tone.soft }]}>
                <Ionicons name="snow" size={9} color={tone.solid} />
              </View>
              <AppText variant="label" muted>
                Frozen
              </AppText>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: colors.surfaceAlt },
                ]}
              />
              <AppText variant="label" muted>
                Not scheduled
              </AppText>
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  monthRow: { flexDirection: "row", marginBottom: 6 },
  monthText: { position: "absolute", left: 0, width: 48 },
  body: { flexDirection: "row" },
  grid: { flexDirection: "row" },
  dayLabel: { textAlign: "center" },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 14,
    flexWrap: "wrap",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});

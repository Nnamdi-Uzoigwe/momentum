import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetModal,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { forwardRef, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Option = {
  key: "habit" | "goal";
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
};

const OPTIONS: Option[] = [
  {
    key: "habit",
    icon: "repeat",
    title: "New habit",
    subtitle: "Something small you repeat",
  },
  {
    key: "goal",
    icon: "flag",
    title: "New goal",
    subtitle: "A bigger outcome to work toward",
  },
];

export const AddSheet = forwardRef<BottomSheetModal>((_, ref) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
      />
    ),
    [],
  );

  const onSelect = (key: Option["key"]) => {
    Haptics.selectionAsync();
    dismiss();
    router.push(key === "habit" ? "/habit/edit" : "/goal/edit");
  };

  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 44 }}
    >
      <BottomSheetView
        style={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        <AppText variant="title">Create something</AppText>
        <AppText variant="body" muted style={styles.subtitle}>
          Start small. One tap a day adds up.
        </AppText>

        {OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View
              style={[styles.iconBox, { backgroundColor: colors.accentSoft }]}
            >
              <Feather name={option.icon} size={22} color={colors.accent} />
            </View>
            <View style={styles.rowText}>
              <AppText variant="bodyStrong">{option.title}</AppText>
              <AppText variant="caption" muted>
                {option.subtitle}
              </AppText>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
        ))}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

AddSheet.displayName = "AddSheet";

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  subtitle: { marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1, gap: 2 },
});

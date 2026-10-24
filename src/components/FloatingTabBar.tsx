// import { AddSheet } from "@/components/AddSheet";
// import { AppText } from "@/components/AppText";
// import { useTheme } from "@/theme";
// import { Feather } from "@expo/vector-icons";
// import type { BottomSheetModal } from "@gorhom/bottom-sheet";
// import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
// import * as Haptics from "expo-haptics";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRef } from "react";
// import { Pressable, StyleSheet, View } from "react-native";
// import Animated, {
//     useAnimatedStyle,
//     useSharedValue,
//     withSpring,
// } from "react-native-reanimated";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
//   index: "sun",
//   progress: "bar-chart-2",
//   profile: "user",
// };

// export function FloatingTabBar({
//   state,
//   descriptors,
//   navigation,
// }: BottomTabBarProps) {
//   const { colors } = useTheme();
//   const insets = useSafeAreaInsets();
//   const sheetRef = useRef<BottomSheetModal>(null);

//   const scale = useSharedValue(1);
//   const plusStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));

//   return (
//     <>
//       <View
//         pointerEvents="box-none"
//         style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 4 }]}
//       >
//         <View
//           style={[
//             styles.bar,
//             {
//               backgroundColor: colors.surface,
//               borderColor: colors.border,
//               shadowColor: colors.shadow,
//             },
//           ]}
//         >
//           {state.routes.map((route, index) => {
//             const focused = state.index === index;
//             const label = descriptors[route.key].options.title ?? route.name;

//             const onPress = () => {
//               const event = navigation.emit({
//                 type: "tabPress",
//                 target: route.key,
//                 canPreventDefault: true,
//               });
//               if (!focused && !event.defaultPrevented) {
//                 Haptics.selectionAsync();
//                 navigation.navigate(route.name);
//               }
//             };

//             return (
//               <Pressable
//                 key={route.key}
//                 onPress={onPress}
//                 accessibilityRole="button"
//                 accessibilityState={{ selected: focused }}
//                 style={[
//                   styles.tab,
//                   {
//                     backgroundColor: focused
//                       ? colors.accentSoft
//                       : "transparent",
//                   },
//                 ]}
//               >
//                 <Feather
//                   name={ICONS[route.name] ?? "circle"}
//                   size={22}
//                   color={focused ? colors.accent : colors.textMuted}
//                 />
//                 <AppText
//                   variant="label"
//                   color={focused ? colors.accentDeep : colors.textMuted}
//                 >
//                   {label}
//                 </AppText>
//               </Pressable>
//             );
//           })}
//         </View>

//         <Animated.View
//           style={[styles.plusShadow, { shadowColor: colors.accent }, plusStyle]}
//         >
//           <Pressable
//             accessibilityRole="button"
//             accessibilityLabel="Create new habit or goal"
//             onPressIn={() => {
//               scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
//             }}
//             onPressOut={() => {
//               scale.value = withSpring(1, { damping: 12, stiffness: 260 });
//             }}
//             onPress={() => {
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//               sheetRef.current?.present();
//             }}
//           >
//             <LinearGradient
//               colors={[colors.gradientStart, colors.gradientEnd]}
//               start={{ x: 0.1, y: 0 }}
//               end={{ x: 0.9, y: 1 }}
//               style={styles.plus}
//             >
//               <Feather name="plus" size={30} color={colors.onAccent} />
//             </LinearGradient>
//           </Pressable>
//         </Animated.View>
//       </View>

//       <AddSheet ref={sheetRef} />
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   wrap: {
//     position: "absolute",
//     left: 16,
//     right: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   bar: {
//     flex: 1,
//     height: 68,
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 6,
//     gap: 4,
//     borderRadius: 34,
//     borderWidth: StyleSheet.hairlineWidth,
//     shadowOpacity: 0.14,
//     shadowRadius: 18,
//     shadowOffset: { width: 0, height: 8 },
//     elevation: 8,
//   },
//   tab: {
//     flex: 1,
//     height: "100%",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 2,
//     borderRadius: 28,
//   },
//   plusShadow: {
//     shadowOpacity: 0.4,
//     shadowRadius: 14,
//     shadowOffset: { width: 0, height: 6 },
//     elevation: 8,
//     borderRadius: 34,
//   },
//   plus: {
//     width: 68,
//     height: 68,
//     borderRadius: 34,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

import { AddSheet } from "@/components/AddSheet";
import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import type { Tabs } from "expo-router";
import { useRef, type ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Derived from Expo Router's own Tabs so the types always match
type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  index: "sun",
  progress: "bar-chart-2",
  profile: "user",
};

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: TabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  const scale = useSharedValue(1);
  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <>
      <View
        pointerEvents="box-none"
        style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 4 }]}
      >
        <View
          style={[
            styles.bar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const label = descriptors[route.key].options.title ?? route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                Haptics.selectionAsync();
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
                style={[
                  styles.tab,
                  {
                    backgroundColor: focused
                      ? colors.accentSoft
                      : "transparent",
                  },
                ]}
              >
                <Feather
                  name={ICONS[route.name] ?? "circle"}
                  size={22}
                  color={focused ? colors.accent : colors.textMuted}
                />
                <AppText
                  variant="label"
                  color={focused ? colors.accentDeep : colors.textMuted}
                >
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <Animated.View
          style={[styles.plusShadow, { shadowColor: colors.accent }, plusStyle]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create new habit or goal"
            onPressIn={() => {
              scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
            }}
            onPressOut={() => {
              scale.value = withSpring(1, { damping: 12, stiffness: 260 });
            }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              sheetRef.current?.present();
            }}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.plus}
            >
              <Feather name="plus" size={30} color={colors.onAccent} />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>

      <AddSheet ref={sheetRef} />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bar: {
    flex: 1,
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    gap: 4,
    borderRadius: 34,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  tab: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderRadius: 28,
  },
  plusShadow: {
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderRadius: 34,
  },
  plus: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
});

import { Burst } from "@/components/Burst";
import { useTheme } from "@/theme";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK_LENGTH = 20;

type Props = { done: boolean; size?: number };

export function CheckCircle({ done, size = 34 }: Props) {
  const { colors } = useTheme();
  const fill = useSharedValue(done ? 1 : 0);
  const pop = useSharedValue(1);
  const mounted = useRef(false);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    fill.value = withTiming(done ? 1 : 0, { duration: 220 });
    if (mounted.current && done) {
      pop.value = withSequence(
        withTiming(1.2, { duration: 100 }),
        withSpring(1, { damping: 10, stiffness: 260 }),
      );
      setBurst((b) => b + 1);
    }
    mounted.current = true;
  }, [done, fill, pop]);

  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    opacity: fill.value,
    transform: [{ scale: 0.5 + 0.5 * fill.value }],
  }));

  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LENGTH * (1 - fill.value),
  }));

  const radius = size / 2;

  return (
    <Animated.View style={[{ width: size, height: size }, popStyle]}>
      <View
        style={[
          styles.ring,
          { borderRadius: radius, borderColor: `${colors.textMuted}66` },
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: radius, backgroundColor: colors.success },
          fillStyle,
        ]}
      />
      <Svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <AnimatedPath
          d="M9.5 16.5 L14 21 L22.5 11.5"
          stroke={colors.onAccent}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={CHECK_LENGTH}
          fill="none"
          animatedProps={checkProps}
        />
      </Svg>
      <Burst trigger={burst} count={8} radius={size * 0.9} size={5} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ring: { ...StyleSheet.absoluteFill, borderWidth: 2 },
});

import { useEffect, useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";

type Spec = {
  x: number;
  size: number;
  round: boolean;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  phase: number;
  spin: number;
};

function Piece({ spec, height }: { spec: Spec; height: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      spec.delay,
      withTiming(1, { duration: spec.duration, easing: Easing.linear }),
    );
  }, [spec, t]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.8 ? 1 : (1 - t.value) / 0.2,
    transform: [
      { translateX: spec.x + Math.sin(t.value * 7 + spec.phase) * spec.drift },
      { translateY: -40 + t.value * (height + 80) },
      { rotate: `${t.value * spec.spin}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          width: spec.size,
          height: spec.round ? spec.size : spec.size * 1.6,
          borderRadius: spec.round ? spec.size / 2 : 2,
          backgroundColor: spec.color,
        },
        style,
      ]}
    />
  );
}

export function Confetti({
  count,
  colors,
}: {
  count: number;
  colors: string[];
}) {
  const { width, height } = useWindowDimensions();

  const specs = useMemo<Spec[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        size: 6 + Math.random() * 6,
        round: Math.random() > 0.5,
        color: colors[i % colors.length],
        delay: Math.random() * 700,
        duration: 2300 + Math.random() * 1400,
        drift: 10 + Math.random() * 24,
        phase: Math.random() * 6,
        spin: 240 + Math.random() * 480,
      })),
    [count, width, colors],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {specs.map((spec, i) => (
        <Piece key={i} spec={spec} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: "absolute", left: 0, top: 0 },
});

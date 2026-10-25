import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export const FESTIVE = ["#3DDC8A", "#FFC53D", "#FF7B6E", "#7FD6C2", "#F472B6"];

type ParticleProps = {
  index: number;
  count: number;
  radius: number;
  size: number;
  color: string;
  trigger: number;
};

function Particle({
  index,
  count,
  radius,
  size,
  color,
  trigger,
}: ParticleProps) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) return;
    t.value = 0;
    t.value = withTiming(1, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
    });
  }, [trigger, t]);

  const angle = (index / count) * Math.PI * 2 + (index % 2 === 0 ? 0 : 0.25);
  const distance = radius * (0.65 + (index % 3) * 0.18);

  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : 1 - t.value,
    transform: [
      { translateX: Math.cos(angle) * distance * t.value },
      { translateY: Math.sin(angle) * distance * t.value },
      { scale: 1 - 0.4 * t.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

type Props = {
  trigger: number; // increase the number to fire the burst; 0 means idle
  count?: number;
  radius?: number;
  size?: number;
  colors?: string[];
};

// Place inside a parent: the burst radiates from the parent's center
export function Burst({
  trigger,
  count = 8,
  radius = 28,
  size = 5,
  colors = FESTIVE,
}: Props) {
  return (
    <View pointerEvents="none" style={styles.origin}>
      {Array.from({ length: count }, (_, i) => (
        <Particle
          key={i}
          index={i}
          count={count}
          radius={radius}
          size={size}
          color={colors[i % colors.length]}
          trigger={trigger}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  origin: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 0,
    height: 0,
  },
  particle: { position: "absolute", left: 0, top: 0 },
});

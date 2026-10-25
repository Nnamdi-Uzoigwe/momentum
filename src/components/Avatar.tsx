import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type Props = { name: string | null; size?: number };

export function Avatar({ name, size = 52 }: Props) {
  const { colors } = useTheme();
  const trimmed = name?.trim();
  const initial = trimmed ? Array.from(trimmed)[0].toUpperCase() : null;

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {initial ? (
        <AppText
          variant="heading"
          color={colors.onAccent}
          style={{ fontSize: size * 0.42, lineHeight: size * 0.54 }}
        >
          {initial}
        </AppText>
      ) : (
        <Feather name="user" size={size * 0.45} color={colors.onAccent} />
      )}
    </LinearGradient>
  );
}

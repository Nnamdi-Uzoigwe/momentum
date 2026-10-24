import { useTheme } from "@/theme";
import { StyleSheet, Text, type TextProps } from "react-native";

type Variant =
  | "display"
  | "title"
  | "heading"
  | "body"
  | "bodyStrong"
  | "label"
  | "caption";

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
  color?: string;
};

export function AppText({
  variant = "body",
  muted,
  color,
  style,
  ...rest
}: Props) {
  const { colors } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        styles[variant],
        { color: color ?? (muted ? colors.textMuted : colors.text) },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: "Urbanist_800ExtraBold",
    fontSize: 40,
    lineHeight: 46,
  },
  title: { fontFamily: "Urbanist_700Bold", fontSize: 28, lineHeight: 34 },
  heading: { fontFamily: "Urbanist_700Bold", fontSize: 18, lineHeight: 24 },
  body: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: "Inter_600SemiBold", fontSize: 15, lineHeight: 22 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 12, lineHeight: 16 },
  caption: { fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 18 },
});

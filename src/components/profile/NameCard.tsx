import { Avatar } from "@/components/Avatar";
import { Section } from "@/components/profile/Section";
import { useUserName } from "@/hooks/useUserName";
import { useTheme } from "@/theme";
import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

export function NameCard() {
  const { colors } = useTheme();
  const { name, save } = useUserName();
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(name ?? "");
  }, [name]);

  const commit = () => {
    save(value).catch((e) => console.error("Failed to save name", e));
  };

  return (
    <Section title="Your name" subtitle="Used to greet you on the Today screen">
      <View style={styles.row}>
        <Avatar name={value.trim() || null} size={48} />
        <TextInput
          value={value}
          onChangeText={setValue}
          onEndEditing={commit}
          onSubmitEditing={commit}
          placeholder="Add your name"
          placeholderTextColor={colors.textMuted}
          maxLength={24}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceAlt,
              color: colors.text,
            },
          ]}
        />
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 16,
    fontFamily: "Inter_500Medium",
    fontSize: 16,
  },
});

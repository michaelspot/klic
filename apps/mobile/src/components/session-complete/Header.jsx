import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { useTranslation } from "@/hooks/useTranslation";

export function Header({ onBack }) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        paddingTop: insets.top + 20,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: isDark ? "#000" : "#fff",
      }}
    >
      <TouchableOpacity
        onPress={onBack}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: isDark ? "#1A1A1A" : "#F0F0F0",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowLeft size={24} color={isDark ? "#fff" : "#000"} />
      </TouchableOpacity>

      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            fontSize: 24,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#fff" : "#000",
          }}
        >
          {t('sessionComplete')}
        </Text>
      </View>

      <View style={{ width: 44 }} />
    </View>
  );
}

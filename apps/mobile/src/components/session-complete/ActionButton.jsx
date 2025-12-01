import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
} from "@expo-google-fonts/inter";

export function ActionButton({
  icon: IconComponent,
  title,
  subtitle,
  onPress,
  isPremiumFeature = false,
  backgroundColor,
  style,
  isLoading = false,
}) {
  const { isDark } = useTheme();
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  const bgColor = backgroundColor || (isDark ? "#1A1A1A" : "#F9F9F9");

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: bgColor,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          opacity: isLoading ? 0.7 : 1,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: "#FF6B35", // Couleur rouge-orangé
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <IconComponent size={24} color="#fff" />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#fff" : "#000",
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#CCCCCC" : "#666",
              marginTop: 4,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Crown } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "@/hooks/useTranslation";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
} from "@expo-google-fonts/inter";

export function PremiumUpsell({ isPremium, onPress }) {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
  });

  if (isPremium || !fontsLoaded) {
    return null;
  }

  return (
    <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
      <View
        style={{
          backgroundColor: isDark ? "#1A1A1A" : "#F9F9F9",
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: isDark ? "#2A2A2A" : "#EFEFEF",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Crown size={24} color="#FF9500" />
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#fff" : "#000",
              marginLeft: 8,
            }}
          >
            {t('upgradeToPremiumShort')}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: isDark ? "#A0A0A0" : "#666",
            marginBottom: 16,
            lineHeight: 20,
          }}
        >
          {t('premiumDescription')}
        </Text>

        <TouchableOpacity
          onPress={onPress}
          style={{
            backgroundColor: "#FF9500",
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: "center",
          }}
          activeOpacity={0.8}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {t('freeTrial')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

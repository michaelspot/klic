import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { useFonts, Inter_500Medium } from "@expo-google-fonts/inter";
import { useTranslation } from "../../hooks/useTranslation";

export function Watermark({ containerWidth, containerHeight }) {
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
  });
  const { t } = useTranslation();

  if (!fontsLoaded) {
    return null;
  }

  const width = containerWidth || 400;
  const height = containerHeight || 600;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: width,
        height: height,
        pointerEvents: "none",
        justifyContent: "flex-end",
        alignItems: "flex-end",
        paddingRight: 12,
        paddingBottom: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          paddingHorizontal: 8,
          paddingVertical: 6,
          borderRadius: 12,
          gap: 6,
        }}
      >
        <Image
          source={require("../../../assets/images/icon.png")}
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
          }}
        />
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: 11,
            fontFamily: "Inter_500Medium",
            letterSpacing: 0.3,
          }}
        >
          {t('madeInKlic')}
        </Text>
      </View>
    </View>
  );
}

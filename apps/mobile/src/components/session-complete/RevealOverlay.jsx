import React from "react";
import { Text } from "react-native";
import Animated from "react-native-reanimated";
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { useTranslation } from "../../hooks/useTranslation";

export function RevealOverlay({ revealOverlayStyle }) {
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });
  const { t } = useTranslation();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        },
        revealOverlayStyle,
      ]}
    >
      <Text
        style={{
          fontSize: 28,
          fontFamily: "Inter_600SemiBold",
          color: "#333",
          textAlign: "center",
        }}
      >
        {t('shakeToRevealTitle')}
      </Text>
    </Animated.View>
  );
}
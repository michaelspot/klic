import React from "react";
import { View, Text } from "react-native";

export function CountdownOverlay({ countdown }) {
  if (!countdown) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <View
        style={{
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 120,
            fontFamily: "Inter_700Bold",
            textShadow: "0px 2px 8px rgba(0,0,0,0.8)",
          }}
        >
          {countdown}
        </Text>
      </View>
    </View>
  );
}

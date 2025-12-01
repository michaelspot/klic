import React from "react";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

export function LoadingView() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar style="light" />
      <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
        Chargement...
      </Text>
    </View>
  );
}

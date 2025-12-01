import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";

export function PermissionsView({ 
  requestPermission, 
  title = "Accès requis",
  description,
  buttonText = "Continuer",
  onSkip,
  skipText = "Plus tard"
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
      }}
    >
      <StatusBar style="light" />
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 25,
          paddingHorizontal: 30,
          paddingVertical: 24,
          alignItems: "center",
          maxWidth: 320,
          width: "100%",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontFamily: "Inter_600SemiBold",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          {title}
        </Text>
        
        {description && (
          <Text
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              textAlign: "center",
              marginBottom: 20,
              lineHeight: 20,
            }}
          >
            {description}
          </Text>
        )}

        <TouchableOpacity
          onPress={requestPermission}
          style={{
            backgroundColor: "#fff",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 25,
            marginBottom: onSkip ? 12 : 0,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#000",
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {buttonText}
          </Text>
        </TouchableOpacity>

        {onSkip && (
          <TouchableOpacity
            onPress={onSkip}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
                fontFamily: "Inter_400Regular",
              }}
            >
              {skipText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft, Save } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useTranslation } from "../../hooks/useTranslation";

export default function Header({ onSave, isDark, insets, isEditMode }) {
  const router = useRouter();
  const { t } = useTranslation();
  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  return (
    <View
      style={{
        paddingTop: insets.top + 20,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "#1A1A1A" : "#E5E5E5",
      }}
    >
      <TouchableOpacity
        onPress={() => {
          handleHapticFeedback();
          router.back();
        }}
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
            fontSize: 20,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#fff" : "#000",
          }}
        >
          {isEditMode ? t('editTemplate') : t('createTemplate')}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onSave}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: "#007AFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Save size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

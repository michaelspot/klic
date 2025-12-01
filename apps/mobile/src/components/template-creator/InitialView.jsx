import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Plus } from "lucide-react-native";
import { useTranslation } from "../../hooks/useTranslation";

export default function InitialView({
  templateName,
  setTemplateName,
  onSelectImage,
  isDark,
}) {
  const { t } = useTranslation();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#fff" : "#000",
            marginBottom: 8,
          }}
        >
          {t('templateName')}
        </Text>
        <TextInput
          style={{
            backgroundColor: isDark ? "#1A1A1A" : "#F5F5F5",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            fontFamily: "Inter_400Regular",
            color: isDark ? "#fff" : "#000",
            borderWidth: 1,
            borderColor: isDark ? "#333" : "#E5E5E5",
          }}
          placeholder={t('templateNamePlaceholder')}
          placeholderTextColor={isDark ? "#666" : "#999"}
          value={templateName}
          onChangeText={setTemplateName}
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#fff" : "#000",
            marginBottom: 8,
          }}
        >
          {t('backgroundImage')}
        </Text>
        <TouchableOpacity
          onPress={onSelectImage}
          style={{
            backgroundColor: isDark ? "#1A1A1A" : "#F5F5F5",
            borderRadius: 12,
            borderWidth: 2,
            borderColor: isDark ? "#333" : "#E5E5E5",
            borderStyle: "dashed",
            height: 200,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Plus size={32} color={isDark ? "#666" : "#999"} />
            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#666" : "#999",
              }}
            >
              {t('selectImage')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

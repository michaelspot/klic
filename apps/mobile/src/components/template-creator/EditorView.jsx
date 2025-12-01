import React from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { Info, Plus, Minus } from "lucide-react-native";
import ImageContainer from "./ImageContainer";
import * as Haptics from "expo-haptics";
import { useTranslation } from "../../hooks/useTranslation";

const handleHapticFeedback = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export default function EditorView({
  templateName,
  setTemplateName,
  onAddSlot,
  onGenerateSlotsFromColors,
  onChangeImage,
  isDark,
  autoDetectedSlots,
  slotExpansion,
  setSlotExpansion,
  ...imageContainerProps
}) {
  const { t } = useTranslation();
  
  const showInfoAlert = () => {
    handleHapticFeedback();
    Alert.alert(
      t('help'),
      t('helpMessage'),
      [{ text: t('ok') }],
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
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

      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#fff" : "#000",
            }}
          >
            {t('slots')}
          </Text>
          <TouchableOpacity
            onPress={showInfoAlert}
            style={{
              marginLeft: 8,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: isDark ? "#333" : "#E5E5E5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Info size={12} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={onAddSlot}
            style={{
              backgroundColor: "#007AFF",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Plus size={14} color="#fff" />
            <Text
              style={{
                color: "#fff",
                fontSize: 12,
                fontFamily: "Inter_600SemiBold",
                marginLeft: 4,
              }}
            >
              {t('addSlot')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onGenerateSlotsFromColors}
            style={{
              backgroundColor: "#FF9500",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Plus size={14} color="#fff" />
            <Text
              style={{
                color: "#fff",
                fontSize: 12,
                fontFamily: "Inter_600SemiBold",
                marginLeft: 4,
              }}
            >
              {t('colorSlots')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ImageContainer isDark={isDark} {...imageContainerProps} />
      
      {/* Slider d'expansion des slots auto-détectés */}
      {autoDetectedSlots && autoDetectedSlots.length > 0 && (
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 16,
            backgroundColor: isDark ? "#1A1A1A" : "#F5F5F5",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#333" : "#E5E5E5",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#fff" : "#000",
              }}
            >
              {t('expandSlots')}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#999" : "#666",
              }}
            >
              {slotExpansion}px
            </Text>
          </View>
          
          {/* Contrôle d'expansion avec boutons */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                handleHapticFeedback();
                setSlotExpansion(Math.max(0, slotExpansion - 1));
              }}
              disabled={slotExpansion === 0}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: slotExpansion === 0 ? (isDark ? "#222" : "#F0F0F0") : "#FF9500",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Minus size={20} color={slotExpansion === 0 ? (isDark ? "#444" : "#CCC") : "#fff"} />
            </TouchableOpacity>
            
            {/* Barre de progression */}
            <View
              style={{
                flex: 1,
                height: 8,
                backgroundColor: isDark ? "#333" : "#E5E5E5",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${(slotExpansion / 30) * 100}%`,
                  height: "100%",
                  backgroundColor: "#FF9500",
                }}
              />
            </View>
            
            <TouchableOpacity
              onPress={() => {
                handleHapticFeedback();
                setSlotExpansion(Math.min(30, slotExpansion + 1));
              }}
              disabled={slotExpansion === 30}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: slotExpansion === 30 ? (isDark ? "#222" : "#F0F0F0") : "#FF9500",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={20} color={slotExpansion === 30 ? (isDark ? "#444" : "#CCC") : "#fff"} />
            </TouchableOpacity>
          </View>
          
          {/* Labels min/max */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
              paddingHorizontal: 40,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#666" : "#999",
              }}
            >
              0px
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#666" : "#999",
              }}
            >
              30px
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

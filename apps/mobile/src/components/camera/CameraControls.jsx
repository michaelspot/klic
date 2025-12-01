import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Settings, Images, RotateCcw, Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "../../hooks/useTranslation";
import { getTemplateName } from "../../utils/i18n";

export function CameraControls({
  sessionSettings,
  appSettings,
  onToggleFacing,
  onStartCapture,
  onOpenMemeSheet,
  onHapticFeedback,
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  
  // Obtenir le nom traduit du template
  const templateDisplayName = sessionSettings.template?.id 
    ? getTemplateName(sessionSettings.template.id)
    : t('noneTemplate');

  const openSettings = () => {
    onHapticFeedback();
    router.push("/(tabs)/settings");
  };

  const openGallery = () => {
    onHapticFeedback();
    router.push("/(tabs)/gallery");
  };

  const openTemplateLibrary = () => {
    onHapticFeedback();
    router.push("/(tabs)/template-library");
  };

  return (
    <>
      {/* Top controls */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 20,
          left: 20,
          right: 20,
          height: 100, // Augmenté pour inclure le template
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          zIndex: 100,
        }}
      >
        <TouchableOpacity
          onPress={openSettings}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          <BlurView
            intensity={40}
            tint="dark"
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          >
            <Settings size={24} color="#fff" />
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openTemplateLibrary}
          style={{ alignItems: "center" }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 24,
              fontFamily: "Inter_700Bold",
              textAlign: "center",
              textShadow: "0px 1px 3px rgba(0,0,0,0.3)",
              marginBottom: 4,
            }}
          >
            {sessionSettings.currentPhoto + 1}/{appSettings.photoCount}
          </Text>
          <Text
            style={{
              color: "#fff",
              fontSize: 11,
              fontFamily: "Inter_600SemiBold",
              textAlign: "center",
              textShadow: "0px 1px 3px rgba(0,0,0,0.3)",
              opacity: 0.8,
            }}
          >
            {templateDisplayName}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openGallery}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          <BlurView
            intensity={40}
            tint="dark"
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          >
            <Images size={24} color="#fff" />
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Bottom controls */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 15,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 30,
          zIndex: 100,
        }}
      >
        <TouchableOpacity
          onPress={onToggleFacing}
          style={{
            position: "absolute",
            left: 50,
            width: 56,
            height: 56,
            borderRadius: 28,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          <BlurView
            intensity={40}
            tint="dark"
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          >
            <RotateCcw size={26} color="#fff" />
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onStartCapture}
          disabled={sessionSettings.isCapturing}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: sessionSettings.isCapturing ? "#ccc" : "#fff",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
          activeOpacity={0.9}
        />

        <TouchableOpacity
          onPress={onOpenMemeSheet}
          activeOpacity={0.7}
          style={{
            position: "absolute",
            right: 50,
            width: 56,
            height: 56,
            borderRadius: 28,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.2)",
            zIndex: 1000,
            elevation: 1000,
          }}
        >
          <BlurView
            intensity={40}
            tint="dark"
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          >
            <Plus size={26} color="#fff" />
          </BlurView>
        </TouchableOpacity>
      </View>
    </>
  );
}

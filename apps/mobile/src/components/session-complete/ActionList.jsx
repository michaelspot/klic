import React from "react";
import { View, Text } from "react-native";
import { Download, Share, RotateCcw } from "lucide-react-native";
import { ActionButton } from "@/components/session-complete/ActionButton";
import { useTheme } from "@/hooks/useTheme";
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { useTranslation } from "@/hooks/useTranslation";

export function ActionList({ onSave, onShare, onNewSession, isSaving = false, isSharing = false }) {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <Text
        style={{
          fontSize: 20,
          fontFamily: "Inter_600SemiBold",
          color: isDark ? "#fff" : "#000",
          marginBottom: 16,
        }}
      >
        {t('whatDoYouWantToDo')}
      </Text>

      <ActionButton
        icon={Download}
        title={t('saveToGallery')}
        subtitle={t('savePhotoDescription')}
        onPress={onSave}
        isLoading={isSaving}
      />

      <ActionButton
        icon={Share}
        title={t('shareYourCreation')}
        subtitle={t('sharePhotoDescription')}
        onPress={onShare}
        isLoading={isSharing}
      />

      <ActionButton
        icon={RotateCcw}
        title={t('newSession')}
        subtitle={t('startNewSession')}
        onPress={onNewSession}
      />
    </View>
  );
}

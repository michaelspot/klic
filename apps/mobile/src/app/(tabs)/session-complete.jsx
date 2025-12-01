import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, ScrollView, Alert, TouchableOpacity, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { GestureDetector } from "react-native-gesture-handler";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
} from "@expo-google-fonts/inter";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import useSwipeBack from "@/utils/useSwipeBack";
import { useSessionCompleteData } from "@/hooks/useSessionCompleteData";
import { usePhotoReveal } from "@/hooks/usePhotoReveal";
import { useTranslation } from "@/hooks/useTranslation";
import { Header } from "@/components/session-complete/Header";
import { TemplateCollagePreview } from "@/components/session-complete/TemplateCollagePreview";
import { PhotoCarousel } from "@/components/session-complete/PhotoCarousel";
import { ActionList } from "@/components/session-complete/ActionList";
import { PremiumUpsell } from "@/components/session-complete/PremiumUpsell";
import {
  saveSessionPhotos,
  shareSessionPhotos,
  handleTemplateSessionAction,
  savePhotoToGallery,
  sharePhoto,
} from "@/utils/shareAndSave";

export default function SessionComplete() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const collageRef = useRef(null);

  const {
    isPremium,
    sessionPhotos,
    selectedTemplate,
    shakeToRevealEnabled,
    sessionId: currentSessionId,
    isLoading,
  } = useSessionCompleteData();

  const {
    isRevealed,
    revealOverlayStyle,
    handleManualReveal,
    resetReveal,
    triggerShake,
  } = usePhotoReveal(shakeToRevealEnabled);

  const [lastSessionId, setLastSessionId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [photoOffsets, setPhotoOffsets] = useState({});
  const [hasAutoSaved, setHasAutoSaved] = useState(false);
  const [carouselActiveIndex, setCarouselActiveIndex] = useState(0);

  // Réinitialiser les transformations à CHAQUE FOIS qu'on arrive sur cette page
  useFocusEffect(
    useCallback(() => {
      console.log('📍 Page session-complete affichée - Réinitialisation des transformations');
      console.log('   SessionId actuel:', currentSessionId);
      console.log('   Dernier sessionId:', lastSessionId);
      
      // Si c'est une nouvelle session (ou la première fois), réinitialiser
      if (!lastSessionId || currentSessionId !== lastSessionId) {
        console.log('   ✅ Réinitialisation appliquée');
        setPhotoOffsets({});
        setHasAutoSaved(false); // Réinitialiser le flag auto-save pour la nouvelle session
        setCarouselActiveIndex(0); // Réinitialiser l'index du carrousel
        
        // Réinitialiser le reveal si activé
        if (shakeToRevealEnabled) {
          resetReveal();
        }
        
        setLastSessionId(currentSessionId);
      } else {
        console.log('   ⏭️ Même session - pas de réinitialisation');
      }
    }, [currentSessionId, lastSessionId, shakeToRevealEnabled, resetReveal])
  );

  // Auto-save de la photo finale si autoSave est activé
  useEffect(() => {
    const autoSaveFinalPhoto = async () => {
      // Ne sauvegarder qu'une seule fois par session
      if (hasAutoSaved || isLoading || !sessionPhotos || sessionPhotos.length === 0) {
        return;
      }

      try {
        // Vérifier si autoSave est activé
        const settingsData = await AsyncStorage.getItem('thismoment_settings');
        if (!settingsData) return;
        
        const settings = JSON.parse(settingsData);
        if (!settings.autoSave) {
          return;
        }

        setHasAutoSaved(true);

        // Attendre un peu pour que le collage soit rendu (si template)
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (selectedTemplate && selectedTemplate.slots && selectedTemplate.slots.length > 0) {
          // Si on a un template, sauvegarder le collage (silencieux pour auto-save)
          await handleTemplateSessionAction(
            sessionPhotos,
            selectedTemplate,
            'save',
            collageRef,
            true // silent = true
          );
        } else {
          // Sinon, sauvegarder toutes les photos de la session (silencieux pour auto-save)
          await saveSessionPhotos(sessionPhotos, true); // silent = true
        }
      } catch (error) {
        // Erreur silencieuse pour ne pas perturber l'utilisateur
      }
    };

    autoSaveFinalPhoto();
  }, [hasAutoSaved, isLoading, sessionPhotos, selectedTemplate, collageRef]);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
  });

  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBack = () => {
    handleHapticFeedback();
    router.push("/(tabs)/camera/");
  };

  const { swipeGesture } = useSwipeBack(handleBack);

  const navigateToGallery = () => {
    handleHapticFeedback();
    router.push("/(tabs)/gallery");
  };

  const saveToGallery = async () => {
    handleHapticFeedback();
    setIsSaving(true);

    try {
      // Si on a un template avec slots, gérer la sauvegarde du composite
      if (selectedTemplate && selectedTemplate.slots && selectedTemplate.slots.length > 0) {
        await handleTemplateSessionAction(
          sessionPhotos,
          selectedTemplate,
          "save",
          collageRef,
        );
      } else {
        // Carrousel : sauvegarder uniquement la photo active
        if (sessionPhotos[carouselActiveIndex]) {
          await savePhotoToGallery(
            sessionPhotos[carouselActiveIndex].uri,
            sessionPhotos[carouselActiveIndex]
          );
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const sharePhotos = async () => {
    handleHapticFeedback();
    setIsSharing(true);

    try {
      // Si on a un template avec slots, gérer le partage du composite
      if (selectedTemplate && selectedTemplate.slots && selectedTemplate.slots.length > 0) {
        await handleTemplateSessionAction(
          sessionPhotos,
          selectedTemplate,
          "share",
          collageRef,
        );
      } else {
        // Carrousel : partager uniquement la photo active
        if (sessionPhotos[carouselActiveIndex]) {
          await sharePhoto(
            sessionPhotos[carouselActiveIndex].uri,
            sessionPhotos[carouselActiveIndex]
          );
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  const startNewSession = () => {
    handleHapticFeedback();
    router.push("/(tabs)/camera/");
  };

  const navigateToPremium = () => {
    handleHapticFeedback();
    router.push("/(tabs)/premium");
  };

  if (!fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }} />
    );
  }

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Header onBack={handleBack} />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Afficher carrousel si pas de template, sinon afficher le collage */}
          {!selectedTemplate || !selectedTemplate.slots || selectedTemplate.slots.length === 0 ? (
            <PhotoCarousel 
              sessionPhotos={sessionPhotos} 
              onActiveIndexChange={setCarouselActiveIndex}
            />
          ) : (
            <TemplateCollagePreview
            key={`template-${currentSessionId}`}
            ref={collageRef}
            sessionId={currentSessionId}
            sessionPhotos={sessionPhotos}
            selectedTemplate={selectedTemplate}
            isPremium={isPremium}
            shakeToRevealEnabled={shakeToRevealEnabled}
            isRevealed={isRevealed}
            onManualReveal={handleManualReveal}
            revealOverlayStyle={revealOverlayStyle}
            photoOffsets={photoOffsets}
            onPhotoOffsetChange={(index, data) => {
              setPhotoOffsets(prev => ({
                ...prev,
                [index]: data
              }));
            }}
          />
          )}

          {/* Message pour indiquer les fonctionnalités de manipulation des photos */}
          {selectedTemplate && selectedTemplate.slots && selectedTemplate.slots.length > 0 && (
            <View style={{ paddingHorizontal: 24, paddingVertical: 8, marginTop: 8 }}>
              <View style={{ 
                backgroundColor: isDark ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 193, 7, 0.4)',
                padding: 10,
              }}>
                <Text style={{ 
                  color: isDark ? '#FFC107' : '#F57C00',
                  fontSize: 11,
                  fontFamily: 'Inter_600SemiBold',
                  textAlign: 'center',
                  lineHeight: 15,
                }}>
                  {t('betaFeatureMessage')}
                </Text>
              </View>
            </View>
          )}

          <ActionList
            onSave={saveToGallery}
            onShare={sharePhotos}
            onNewSession={startNewSession}
            isSaving={isSaving}
            isSharing={isSharing}
          />
          <PremiumUpsell isPremium={isPremium} onPress={navigateToPremium} />
        </ScrollView>
      </View>
    </GestureDetector>
  );
}

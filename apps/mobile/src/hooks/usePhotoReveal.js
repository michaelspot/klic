import { useState, useEffect, useCallback } from "react";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useProgressiveShakeReveal } from "@/hooks/useShakeDetection";

export function usePhotoReveal(shakeToRevealEnabled) {
  const [isRevealed, setIsRevealed] = useState(false);
  const revealOpacity = useSharedValue(0.9);

  // Fonction appelée à chaque étape de secousse pour réduire l'opacité
  const handleShakeStep = useCallback(
    (newOpacity) => {
      console.log(`Réduction opacité: ${newOpacity}`);

      // Mettre à jour l'opacité avec animation fluide
      revealOpacity.value = withTiming(newOpacity, { duration: 200 });

      // Si l'opacité atteint 0, considérer comme révélé
      if (newOpacity <= 0) {
        console.log("Photo complètement révélée par secousse!");

        // Retour haptique final pour simuler l'effet Polaroid
        setTimeout(async () => {
          try {
            const savedSettings = await AsyncStorage.getItem("thismoment_settings");
            let hapticEnabled = true;
            if (savedSettings) {
              const settings = JSON.parse(savedSettings);
              hapticEnabled = settings.hapticFeedback !== false;
            }
            if (hapticEnabled) {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await new Promise((resolve) => setTimeout(resolve, 100));
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          } catch (error) {
            console.error("Erreur retour haptique:", error);
          }
        }, 100);

        setIsRevealed(true);
      }
    },
    [revealOpacity],
  );

  // Hook de détection de secousse progressive
  const {
    triggerShake,
    resetOpacity,
    getCurrentOpacity,
    startDetection,
    stopDetection,
  } = useProgressiveShakeReveal(
    handleShakeStep,
    0.8, // Seuil sensible pour détecter les mouvements
    0.1, // Réduction de 10% à chaque secousse
  );

  // Activer/désactiver la détection selon l'état
  useEffect(() => {
    if (shakeToRevealEnabled && !isRevealed) {
      console.log("🟢 Activation de la détection de secousse");
      startDetection();
    } else {
      console.log("🔴 Désactivation de la détection de secousse");
      stopDetection();
    }

    // Nettoyer à la destruction
    return () => {
      stopDetection();
    };
  }, [shakeToRevealEnabled, isRevealed, startDetection, stopDetection]);

  // Fonction pour révéler manuellement (tap pour tester)
  const handleManualReveal = useCallback(() => {
    if (shakeToRevealEnabled && !isRevealed) {
      console.log("🧪 Test manuel du mode debug");
      triggerShake();
    }
  }, [shakeToRevealEnabled, isRevealed, triggerShake]);

  const revealOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: revealOpacity.value,
    };
  }, []);

  const resetReveal = useCallback(() => {
    setIsRevealed(false);
    revealOpacity.value = 0.9;
    resetOpacity();
    console.log("Révélation réinitialisée");
  }, [revealOpacity, resetOpacity]);

  // Initialiser l'overlay quand le mode shake est activé
  useEffect(() => {
    if (shakeToRevealEnabled && !isRevealed) {
      revealOpacity.value = 0.9;
      resetOpacity();
    }
  }, [shakeToRevealEnabled, isRevealed, revealOpacity, resetOpacity]);

  return {
    isRevealed,
    revealOverlayStyle,
    handleManualReveal,
    resetReveal,
    triggerShake, // Exposer pour les tests
  };
}

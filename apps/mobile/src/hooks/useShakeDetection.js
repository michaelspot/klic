import { useEffect, useRef, useCallback } from "react";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Accelerometer } from "expo-sensors";

// Hook pour détecter les secousses et réduire l'opacité à chaque mouvement
export function useProgressiveShakeReveal(
  onShakeStep,
  threshold = 1.0, // Seuil sensible pour détecter les mouvements
  stepReduction = 0.05, // 5% de réduction par secousse (ralenti pour dévoilement plus progressif)
) {
  const currentOpacity = useRef(1.0);
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const subscription = useRef(null);
  const isActive = useRef(false);

  const detectShake = useCallback(
    (accelerometerData) => {
      if (!isActive.current || currentOpacity.current <= 0) return;

      const { x = 0, y = 0, z = 0 } = accelerometerData;

      // Calculer la différence d'accélération depuis la dernière mesure
      const deltaX = Math.abs(x - lastAcceleration.current.x);
      const deltaY = Math.abs(y - lastAcceleration.current.y);
      const deltaZ = Math.abs(z - lastAcceleration.current.z);

      // Calculer la magnitude du mouvement
      const magnitude = Math.sqrt(
        deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ,
      );

      // Mettre à jour la dernière accélération
      lastAcceleration.current = { x, y, z };

      // Si la magnitude dépasse le seuil, réduire l'opacité
      if (magnitude > threshold) {
        // Réduire l'opacité
        currentOpacity.current = Math.max(
          0,
          currentOpacity.current - stepReduction,
        );

        console.log(
          `🎯 MOUVEMENT DÉTECTÉ! Magnitude: ${magnitude.toFixed(2)} (seuil: ${threshold}), Opacité: ${currentOpacity.current.toFixed(2)}`,
        );

        // Retour haptique pour confirmer la détection (vérifier le paramètre)
        AsyncStorage.getItem("thismoment_settings").then((savedSettings) => {
          let hapticEnabled = true;
          if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            hapticEnabled = settings.hapticFeedback !== false;
          }
          if (hapticEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }).catch(() => {});

        // Appeler le callback avec la nouvelle opacité
        onShakeStep(currentOpacity.current);
      }
    },
    [onShakeStep, threshold, stepReduction],
  );

  // Fonction pour démarrer l'accéléromètre réel
  const startRealAccelerometer = useCallback(() => {
    console.log("🎮 Démarrage de l'accéléromètre réel");

    // Configurer la fréquence de mise à jour (en ms)
    Accelerometer.setUpdateInterval(100);

    // S'abonner aux données de l'accéléromètre
    const subscription = Accelerometer.addListener(detectShake);

    return () => {
      subscription.remove();
    };
  }, [detectShake]);

  // Fonction pour activer la détection
  const startDetection = useCallback(() => {
    if (isActive.current) return;

    console.log("🚀 Activation de la détection de mouvement");
    isActive.current = true;

    // Démarrer l'accéléromètre réel
    const cleanup = startRealAccelerometer();

    // Stocker le cleanup
    subscription.current = { remove: cleanup };

    return cleanup;
  }, [startRealAccelerometer]);

  // Fonction pour arrêter la détection
  const stopDetection = useCallback(() => {
    if (!isActive.current) return;

    console.log("🛑 Arrêt de la détection de mouvement");
    isActive.current = false;

    if (subscription.current) {
      subscription.current.remove();
      subscription.current = null;
    }
  }, []);

  // Fonction pour déclencher manuellement une secousse (pour les tests)
  const triggerShake = useCallback(() => {
    if (currentOpacity.current <= 0) return;

    console.log("🧪 Déclenchement manuel d'une secousse");

    // Simuler une secousse détectable
    const mockAcceleration = {
      x: 2.0, // Assez fort pour dépasser le seuil
      y: 11.0, // Gravité + mouvement
      z: 1.5,
    };

    detectShake(mockAcceleration);
  }, [detectShake]);

  // Fonction pour réinitialiser l'opacité
  const resetOpacity = useCallback(() => {
    currentOpacity.current = 1.0;
    console.log("🔄 Opacité réinitialisée à 1.0");
  }, []);

  // Fonction pour obtenir l'opacité actuelle
  const getCurrentOpacity = useCallback(() => {
    return currentOpacity.current;
  }, []);

  // Nettoyer à la destruction du composant
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    triggerShake,
    resetOpacity,
    getCurrentOpacity,
    startDetection,
    stopDetection,
    isActive: () => isActive.current,
  };
}

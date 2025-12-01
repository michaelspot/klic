import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Hook global pour gérer le retour haptique dans toute l'application
 * Vérifie toujours le paramètre depuis AsyncStorage en temps réel
 */
export function useHapticFeedback() {
  const triggerHaptic = async (
    intensity = Haptics.ImpactFeedbackStyle.Light,
  ) => {
    try {
      // Toujours vérifier le paramètre depuis AsyncStorage pour s'assurer qu'il est à jour
      const savedSettings = await AsyncStorage.getItem("thismoment_settings");
      let currentHapticSetting = true; // Valeur par défaut

      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        currentHapticSetting = settings.hapticFeedback !== false; // Par défaut activé
      }

      if (currentHapticSetting) {
        await Haptics.impactAsync(intensity);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du retour haptique:",
        error,
      );
      // En cas d'erreur, ne pas déclencher le retour haptique
    }
  };

  const triggerLightHaptic = () => triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
  const triggerMediumHaptic = () => triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
  const triggerHeavyHaptic = () => triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);

  return {
    triggerHaptic,
    triggerLightHaptic,
    triggerMediumHaptic,
    triggerHeavyHaptic,
  };
}

export default useHapticFeedback;
import { useCallback } from 'react';
import { useRevenueCat } from '../hooks/useRevenueCat';
import { useTestPremium } from '../hooks/useTestPremium';

/**
 * Hook simplifié pour vérifier si l'utilisateur a un abonnement premium
 * Utilisable dans toute l'app
 * Combine le statut RevenueCat et le statut de test
 */
export function usePremium() {
  const { isPremium: isRevenueCatPremium, isLoading: revenueCatLoading } = useRevenueCat();
  const { isTestPremium, isLoading: testPremiumLoading } = useTestPremium();

  // L'utilisateur est premium si RevenueCat OU le mode test est activé
  const isPremium = isRevenueCatPremium || isTestPremium;
  const loading = revenueCatLoading || testPremiumLoading;

  // Debug logs
  console.log('🔍 usePremium:', {
    isRevenueCatPremium,
    isTestPremium,
    isPremium,
    loading
  });

  // Fonction pour vérifier si une fonctionnalité premium est disponible
  const checkPremiumFeature = useCallback((featureName) => {
    return isPremium;
  }, [isPremium]);

  // Fonction pour obtenir les détails de l'abonnement
  const getSubscriptionDetails = useCallback(() => {
    if (!isPremium) {
      return null;
    }

    return {
      isActive: isPremium,
      type: 'subscription',
    };
  }, [isPremium]);

  // Liste des fonctionnalités premium
  const premiumFeatures = {
    noWatermark: checkPremiumFeature('no_watermark'),
    customTemplates: checkPremiumFeature('custom_templates'),
    premiumTemplates: checkPremiumFeature('premium_templates'),
    advancedTimers: checkPremiumFeature('advanced_timers'),
    autoMode: checkPremiumFeature('auto_mode'),
    premiumThemes: checkPremiumFeature('premium_themes'),
  };

  return {
    isPremium: isPremium || false,
    loading,
    features: premiumFeatures,
    subscriptionDetails: getSubscriptionDetails(),
    checkFeature: checkPremiumFeature,
  };
}

export default usePremium;
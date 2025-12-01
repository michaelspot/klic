import { useState, useEffect } from 'react';
import {
  initializeRevenueCat,
  getOfferings,
  purchasePackage,
  checkPremiumStatus,
  restorePurchases,
  getCurrentSubscription,
} from '../utils/revenuecat';

export function useRevenueCat() {
  const [isPremium, setIsPremium] = useState(false);
  const [offerings, setOfferings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  // Initialiser RevenueCat au montage
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      
      try {
        // Initialiser RevenueCat
        const initialized = await initializeRevenueCat();
        
        if (!initialized) {
          setIsLoading(false);
          return;
        }
        
        // Vérifier le statut premium
        const premium = await checkPremiumStatus();
        setIsPremium(premium);
        
        // Récupérer l'abonnement actuel si premium
        if (premium) {
          const subscription = await getCurrentSubscription();
          setCurrentSubscription(subscription);
        }
        
        // Charger les offres
        const offers = await getOfferings();
        setOfferings(offers);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation RevenueCat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Fonction pour acheter un package
  const purchase = async (packageToPurchase) => {
    setIsPurchasing(true);
    
    try {
      const result = await purchasePackage(packageToPurchase);
      
      if (result.success) {
        // Mettre à jour le statut premium
        const premium = await checkPremiumStatus();
        setIsPremium(premium);
        
        // Mettre à jour l'abonnement actuel
        if (premium) {
          const subscription = await getCurrentSubscription();
          setCurrentSubscription(subscription);
        }
        
        return { success: true };
      } else if (result.cancelled) {
        return { success: false, cancelled: true };
      } else {
        return { success: false, error: result.error };
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  // Fonction pour restaurer les achats
  const restore = async () => {
    setIsLoading(true);
    
    try {
      const result = await restorePurchases();
      
      if (result.success) {
        // Mettre à jour le statut premium
        const premium = await checkPremiumStatus();
        setIsPremium(premium);
        
        // Mettre à jour l'abonnement actuel
        if (premium) {
          const subscription = await getCurrentSubscription();
          setCurrentSubscription(subscription);
        }
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isPremium,
    offerings,
    isLoading,
    isPurchasing,
    currentSubscription,
    purchase,
    restore,
  };
}

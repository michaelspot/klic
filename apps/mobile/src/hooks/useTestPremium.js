import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TEST_PREMIUM_KEY = '@test_premium_status';

/**
 * Hook pour gérer le statut premium de test
 * Permet de tester l'interface premium sans passer par RevenueCat
 */
export function useTestPremium() {
  const [isTestPremium, setIsTestPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadTestPremiumStatus = useCallback(async () => {
    try {
      const value = await AsyncStorage.getItem(TEST_PREMIUM_KEY);
      setIsTestPremium(value === 'true');
    } catch (error) {
      console.error('Erreur lors du chargement du statut premium de test:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger le statut au montage
  useEffect(() => {
    loadTestPremiumStatus();
  }, [loadTestPremiumStatus]);
  
  // Recharger périodiquement pour détecter les changements
  useEffect(() => {
    const interval = setInterval(() => {
      loadTestPremiumStatus();
    }, 1000); // Vérifier chaque seconde
    
    return () => clearInterval(interval);
  }, [loadTestPremiumStatus]);

  const toggleTestPremium = async () => {
    try {
      const newValue = !isTestPremium;
      await AsyncStorage.setItem(TEST_PREMIUM_KEY, newValue.toString());
      setIsTestPremium(newValue);
      return newValue;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du statut premium de test:', error);
      return isTestPremium;
    }
  };

  return {
    isTestPremium,
    isLoading,
    toggleTestPremium,
  };
}

import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Platform } from 'react-native';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useSubscriptionStore = create((set, get) => ({
  status: null,
  loading: true,
  subscriptionData: null,
  sessionId: null,
  setStatus: (status) => set({ status }),
  setLoading: (loading) => set({ loading }),
  setSubscriptionData: (data) => set({ subscriptionData: data }),
  setSessionId: (sessionId) => set({ sessionId }),
  
  checkSubscription: async (sessionId = null) => {
    try {
      // Utiliser le sessionId fourni ou celui stocké
      const targetSessionId = sessionId || get().sessionId;
      
      const response = await fetch('/api/get-subscription-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId: targetSessionId 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to check subscription status');
      }
      
      const data = await response.json();
      
      const isActive = data.status === 'active' || data.status === 'trialing';
      
      set({ 
        status: isActive, 
        loading: false, 
        subscriptionData: data 
      });
      
      // Sauvegarder le statut localement
      if (isActive) {
        await AsyncStorage.setItem('thismoment_premium_status', JSON.stringify({
          isActive: true,
          data: data,
          lastCheck: new Date().toISOString()
        }));
      }
      
      return data;
    } catch (error) {
      console.error('Error checking subscription:', error);
      set({ loading: false });
      return null;
    }
  },
  
  loadCachedStatus: async () => {
    try {
      const cached = await AsyncStorage.getItem('thismoment_premium_status');
      if (cached) {
        const { isActive, data, lastCheck } = JSON.parse(cached);
        
        // Vérifier si le cache n'est pas trop ancien (24h)
        const cacheAge = new Date() - new Date(lastCheck);
        const maxAge = 24 * 60 * 60 * 1000; // 24 heures
        
        if (cacheAge < maxAge) {
          set({ 
            status: isActive, 
            subscriptionData: data, 
            loading: false 
          });
          return;
        }
      }
      
      // Si pas de cache valide, vérifier en ligne
      get().checkSubscription();
    } catch (error) {
      console.error('Error loading cached status:', error);
      get().checkSubscription();
    }
  },
}));

export function useStripeSubscription() {
  const { 
    status, 
    loading, 
    subscriptionData, 
    sessionId,
    checkSubscription, 
    loadCachedStatus,
    setSessionId 
  } = useSubscriptionStore();
  const router = useRouter();

  const initiateSubscription = React.useCallback(async (plan = 'monthly') => {
    try {
      const response = await fetch('/api/stripe-checkout-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: plan,
          redirectURL: process.env.EXPO_PUBLIC_APP_URL || 'https://localhost:3000',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get checkout link');
      }

      const { url } = await response.json();
      
      if (url) {
        if (Platform.OS === 'web') {
          // Pour le web, ouvrir dans une popup
          const popup = window.open(url, "_blank", "popup,width=600,height=700");
          
          const checkClosed = setInterval(() => {
            try {
              if (popup.closed || (popup.location && popup.location.href.includes(process.env.EXPO_PUBLIC_APP_URL))) {
                clearInterval(checkClosed);
                popup.close();
                // Extraire sessionId de l'URL si disponible
                if (popup.location && popup.location.href.includes('session_id=')) {
                  const urlParams = new URLSearchParams(popup.location.search);
                  const sessionId = urlParams.get('session_id');
                  if (sessionId) {
                    setSessionId(sessionId);
                    checkSubscription(sessionId);
                  }
                }
              }
            } catch (e) {
              // Cross-origin error is expected
            }
          }, 1000);
        } else {
          // Pour mobile, utiliser WebView
          router.push({
            pathname: '/stripe-payment',
            params: { checkoutUrl: url },
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Erreur', 'Impossible de démarrer le processus de paiement. Veuillez réessayer.', [
        { text: 'OK' },
      ]);
    }
  }, [router, checkSubscription, setSessionId]);

  const restorePurchases = React.useCallback(async () => {
    // Pour Stripe, on peut vérifier avec une session sauvegardée
    const savedSessionId = await AsyncStorage.getItem('thismoment_stripe_session_id');
    if (savedSessionId) {
      return checkSubscription(savedSessionId);
    }
    
    Alert.alert(
      'Restauration',
      'Pour restaurer vos achats Stripe, vous devez vous reconnecter via le processus de paiement.',
      [{ text: 'OK' }]
    );
    return null;
  }, [checkSubscription]);

  React.useEffect(() => {
    loadCachedStatus();
  }, []);

  // Vérifier périodiquement le statut si on a un sessionId
  React.useEffect(() => {
    if (sessionId && status === null) {
      const interval = setInterval(() => {
        checkSubscription(sessionId);
      }, 5000); // Vérifier toutes les 5 secondes
      
      return () => clearInterval(interval);
    }
  }, [sessionId, status, checkSubscription]);

  return {
    isSubscribed: status,
    isPremium: status, // Alias pour compatibilité
    loading,
    subscriptionData,
    initiateSubscription,
    restorePurchases,
    checkSubscription,
    setSessionId,
  };
}

export default useStripeSubscription;
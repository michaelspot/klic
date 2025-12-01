import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform, View, Text } from "react-native";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useStripeSubscription from "../utils/useStripeSubscription";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function StripePayment() {
  const { checkoutUrl } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { checkSubscription, setSessionId } = useStripeSubscription();

  useEffect(() => {
    if (Platform.OS === "web") {
      if (checkoutUrl) {
        const popup = window.open(checkoutUrl, "_blank", "popup,width=600,height=700");
        
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
                  AsyncStorage.setItem('thismoment_stripe_session_id', sessionId);
                  checkSubscription(sessionId);
                }
              }
              
              router.back();
            }
          } catch (e) {
            // Cross-origin error is expected when checking popup location
          }
        }, 1000);
      } else {
        router.back();
      }
    }
  }, [checkoutUrl, router, checkSubscription, setSessionId]);

  const handleWebViewClose = async (url) => {
    // Vérifier si l'URL contient un session_id de Stripe
    if (url && url.includes('session_id=')) {
      try {
        const urlObj = new URL(url);
        const sessionId = urlObj.searchParams.get('session_id');
        
        if (sessionId) {
          console.log('Session Stripe détectée:', sessionId);
          setSessionId(sessionId);
          await AsyncStorage.setItem('thismoment_stripe_session_id', sessionId);
          
          // Vérifier le statut de paiement
          await checkSubscription(sessionId);
        }
      } catch (error) {
        console.error('Erreur parsing URL:', error);
      }
    }
    
    router.back();
  };

  const handleShouldStartLoadWithRequest = (request) => {
    const url = request.url;
    
    // Si l'URL contient notre domaine d'app ou des paramètres de succès/échec
    if (
      url.includes(process.env.EXPO_PUBLIC_APP_URL) ||
      url.includes('status=success') ||
      url.includes('status=cancelled') ||
      url.includes('session_id=')
    ) {
      handleWebViewClose(url);
      return false;
    }
    
    return true;
  };

  const handleNavigationStateChange = (navState) => {
    const url = navState.url;
    
    if (
      url.includes(process.env.EXPO_PUBLIC_APP_URL) ||
      url.includes('status=success') ||
      url.includes('status=cancelled') ||
      url.includes('session_id=')
    ) {
      handleWebViewClose(url);
    }
  };

  if (Platform.OS === "web") {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#000', 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingTop: insets.top 
      }}>
        <StatusBar style="light" />
        <Text style={{ color: '#fff', fontSize: 16 }}>
          Ouverture de la page de paiement...
        </Text>
      </View>
    );
  }

  if (!checkoutUrl) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#000', 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingTop: insets.top 
      }}>
        <StatusBar style="light" />
        <Text style={{ color: '#fff', fontSize: 16 }}>
          Erreur: URL de paiement manquante
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <WebView
        source={{ uri: checkoutUrl }}
        style={{ flex: 1 }}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={{ 
            flex: 1, 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#fff'
          }}>
            <Text style={{ fontSize: 16, color: '#333' }}>
              Chargement du paiement...
            </Text>
          </View>
        )}
      />
    </View>
  );
}
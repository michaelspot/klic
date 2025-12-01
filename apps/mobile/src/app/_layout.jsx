import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as MediaLibrary from "expo-media-library";
import { initializeRevenueCat } from "../utils/revenuecat";
import { PermissionsView } from "../components/camera/PermissionsView";

console.log('🌟🌟🌟 [APP] Starting app initialization... 🌟🌟🌟');

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.error('[APP] Error preventing splash screen auto-hide:', error);
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const [showPhotoPermission, setShowPhotoPermission] = useState(false);

  useEffect(() => {
    console.log('🎬 [APP] RootLayout mounted');
    
    // Check media library permissions at startup
    const checkPermissions = async () => {
      try {
        const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
        
        // If we haven't asked yet (undetermined) and we can ask, show our custom UI
        if (status === 'undetermined' && canAskAgain) {
          setShowPhotoPermission(true);
        } else {
          if (status === 'granted') {
            console.log('✅ [APP] Media library permission already granted');
          } else {
            console.log('⚠️ [APP] Media library permission status:', status);
          }
        }
      } catch (error) {
        console.error('❌ [APP] Error checking media library permission:', error);
      }
    };
    
    checkPermissions();
    
    // Initialize RevenueCat
    const initRC = async () => {
      console.log('💰 [APP] Initializing RevenueCat...');
      const initialized = await initializeRevenueCat();
      if (initialized) {
        console.log('✅ [APP] RevenueCat initialized successfully');
      } else {
        console.error('❌ [APP] Failed to initialize RevenueCat');
      }
    };
    
    initRC();
    
    // Hide splash screen after a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      console.log('👋 [APP] Hiding splash screen...');
      SplashScreen.hideAsync()
        .then(() => {
          console.log('✅ [APP] Splash screen hidden successfully');
        })
        .catch((error) => {
          console.error('❌ [APP] Error hiding splash screen:', error);
        });
    }, 100);

    return () => {
      console.log('🔚 [APP] RootLayout unmounting');
      clearTimeout(timer);
    };
  }, []);

  console.log('🎨 [APP] Rendering RootLayout');

  if (showPhotoPermission) {
    return (
      <PermissionsView 
        title="Accès photos requis"
        description="L'application a besoin d'accéder à votre bibliothèque de photos pour vous permettre de sélectionner et d'importer des images existantes dans vos créations."
        buttonText="Continuer"
        requestPermission={async () => {
          setShowPhotoPermission(false);
          try {
            await MediaLibrary.requestPermissionsAsync();
          } catch(e) { console.error(e); }
        }}
        onSkip={() => setShowPhotoPermission(false)}
        skipText="Plus tard"
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="stripe-payment" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

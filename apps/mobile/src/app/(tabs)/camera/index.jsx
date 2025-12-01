import React, { useRef, useCallback, useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView } from "expo-camera";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
} from "react-native-reanimated";
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useCameraState } from "../../../hooks/useCameraState";
import { calculateCameraLayout } from "../../../utils/cameraLayout";
import { LoadingView } from "../../../components/camera/LoadingView";
import { PermissionsView } from "../../../components/camera/PermissionsView";
import { CameraCropOverlay } from "../../../components/camera/CameraCropOverlay";
import { CameraControls } from "../../../components/camera/CameraControls";
import { CountdownOverlay } from "../../../components/camera/CountdownOverlay";
import { PreviewUI } from "../../../components/camera/PreviewUI";
import { DraggableMeme } from "../../../components/camera/DraggableMeme";
import { MemeSheet } from "../../../components/camera/MemeSheet";
import { CameraGrid } from "../../../components/camera/CameraGrid";

export default function Camera() {
  console.log('📷📷📷 [APP] Camera component rendering... 📷📷📷');
  
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);

  const { width: screenWidth } = Dimensions.get("window");

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  console.log('🔤 [APP] Camera - Fonts loaded:', fontsLoaded);

  const cameraLayout = calculateCameraLayout(insets);
  
  const {
    permission,
    requestPermission,
    appSettings,
    cameraSettings,
    toggleFacing,
    sessionSettings,
    countdown,
    startCountdown,
    showPreview,
    currentPhotoUri,
    autoValidationCountdown,
    validatePhoto,
    retakePhoto,
    handleHapticFeedback,
    loadSettings,
  } = useCameraState(cameraRef, cameraLayout);
  const memeSheetRef = useRef(null);
  const [memeSheetKey, setMemeSheetKey] = useState(0);

  const [memeElements, setMemeElements] = useState([]);
  const [selectedMeme, setSelectedMeme] = useState(null);

  // Réinitialiser le MemeSheet quand la caméra change de facing
  useEffect(() => {
    console.log("📷 Facing caméra changé:", cameraSettings.facing);
    // Forcer le remontage du MemeSheet pour éviter qu'il reste bloqué
    setMemeSheetKey(prev => prev + 1);
  }, [cameraSettings.facing]);

  // Triple-tap detection pour basculer le mode épuré
  const [tapCount, setTapCount] = useState(0);
  const tapTimer = useRef(null);

  // Fonction pour basculer le mode épuré
  const toggleCleanMode = useCallback(async () => {
    try {
      const currentSettings = await AsyncStorage.getItem("thismoment_settings");
      const settings = currentSettings ? JSON.parse(currentSettings) : {};

      const newCleanMode = !appSettings.cleanMode;
      const updatedSettings = {
        ...settings,
        cleanMode: newCleanMode,
      };

      await AsyncStorage.setItem(
        "thismoment_settings",
        JSON.stringify(updatedSettings),
      );

      // Forcer le rechargement immédiat des paramètres
      await loadSettings();

      handleHapticFeedback();
      console.log("Mode épuré basculé:", newCleanMode ? "Activé" : "Désactivé");
    } catch (error) {
      console.error("Erreur lors du basculement du mode épuré:", error);
    }
  }, [appSettings.cleanMode, handleHapticFeedback, loadSettings]);

  // Gestion des triple-taps
  const handleTripleTap = useCallback(() => {
    setTapCount((prevCount) => {
      const newCount = prevCount + 1;

      // Nettoyer le timer précédent
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
      }

      if (newCount === 3) {
        // Triple-tap détecté
        toggleCleanMode();
        return 0; // Reset
      } else {
        // Démarrer un timer pour reset après 500ms
        tapTimer.current = setTimeout(() => {
          setTapCount(0);
        }, 500);
        return newCount;
      }
    });
  }, [toggleCleanMode]);

  const handlePresentMemeSheet = useCallback(() => {
    handleHapticFeedback();
    
    // S'assurer que le sheet existe
    if (!memeSheetRef.current) {
      console.error("❌ MemeSheet ref n'est pas disponible");
      // Forcer le remontage du sheet
      setMemeSheetKey(prev => prev + 1);
      setTimeout(() => {
        memeSheetRef.current?.present();
      }, 200);
      return;
    }
    
    // Ouvrir directement
    try {
      memeSheetRef.current.present();
      console.log("✅ MemeSheet ouvert");
    } catch (error) {
      console.error("❌ Erreur lors de l'ouverture du MemeSheet:", error);
      // Forcer le remontage du sheet en changeant la clé
      setMemeSheetKey(prev => prev + 1);
      setTimeout(() => {
        memeSheetRef.current?.present();
      }, 200);
    }
  }, [handleHapticFeedback]);

  const addMemeToPreview = useCallback(
    (memeUrl) => {
      console.log("🎯 addMemeToPreview appelé avec URL:", memeUrl);
      handleHapticFeedback();
      
      if (!memeUrl) {
        console.error("❌ URL du meme est vide!");
        return;
      }
      
      const newMeme = {
        id: Date.now().toString(),
        url: memeUrl,
        x: cameraLayout.cameraWidth / 2 - 40,
        y: cameraLayout.cameraHeight / 2 - 40,
        width: 80,
        height: 80,
        scale: 1,
      };
      console.log("✅ Nouveau meme créé:", newMeme);
      
      setMemeElements((prev) => {
        const updated = [...prev, newMeme];
        console.log(`✨ Memes mis à jour: ${prev.length} -> ${updated.length} memes`);
        return updated;
      });
      
      memeSheetRef.current?.dismiss();
    },
    [handleHapticFeedback, cameraLayout],
  );

  const updateMemePosition = useCallback((memeId, x, y, scale) => {
    setMemeElements((prev) =>
      prev.map((meme) =>
        meme.id === memeId ? { ...meme, x, y, scale } : meme,
      ),
    );
  }, []);

  const removeMeme = useCallback(
    (memeId) => {
      handleHapticFeedback();
      setMemeElements((prev) =>
        prev.filter((meme) => meme.id !== memeId),
      );
      setSelectedMeme(null);
    },
    [handleHapticFeedback],
  );

  // Reset memes when photo changes
  const resetMemes = useCallback(() => {
    setMemeElements([]);
  }, []);

  // Reset memes when retaking or validating photo
  const handleRetakePhoto = useCallback(() => {
    retakePhoto();
    resetMemes();
  }, [retakePhoto, resetMemes]);

  const handleValidatePhoto = useCallback((compositeUri) => {
    // Si un URI composite est fourni (image avec memes fusionnés), l'utiliser
    // Sinon, passer les memes pour qu'ils soient sauvegardés séparément
    validatePhoto(compositeUri || memeElements);
    resetMemes();
  }, [validatePhoto, resetMemes, memeElements]);


  if (!fontsLoaded) {
    return <LoadingView />;
  }

  if (!permission) {
    return <LoadingView />;
  }

  if (!permission.granted) {
    return (
      <PermissionsView 
        requestPermission={requestPermission} 
        title="Accès caméra requis"
        description="L'application a besoin d'accéder à votre appareil photo pour vous permettre de prendre des photos directement dans l'application."
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <StatusBar style="light" />
          <CameraView
            ref={cameraRef}
            style={{
              flex: 1,
              transform: appSettings.mirror ? [{ scaleX: -1 }] : [],
            }}
            facing={cameraSettings.facing}
            flash={cameraSettings.flash}
            zoom={cameraSettings.zoom}
          />

          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "box-none",
            }}
          >
            {!showPreview && !countdown && (
              <>
                <CameraCropOverlay
                  topCrop={cameraLayout.topCrop}
                  bottomCrop={cameraLayout.bottomCrop}
                />

                {/* Grille de caméra si activée */}
                {appSettings.grid && <CameraGrid cameraLayout={cameraLayout} />}

                {/* Zone de détection triple-tap - seulement en mode épuré */}
                {appSettings.cleanMode && (
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 50,
                    }}
                    onPress={handleTripleTap}
                    activeOpacity={1}
                  />
                )}

                {/* Memes overlay sur la vue caméra live - masqué en mode épuré */}
                {!appSettings.cleanMode && (
                  <View
                    style={{
                      position: "absolute",
                      top: cameraLayout.cameraTop,
                      left: (screenWidth - cameraLayout.cameraWidth) / 2,
                      width: cameraLayout.cameraWidth,
                      height: cameraLayout.cameraHeight,
                    }}
                  >
                    {/* Background touchable to deselect memes + zone de détection triple-tap en mode normal */}
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        zIndex: 1,
                      }}
                      onPress={(event) => {
                        setSelectedMeme(null);
                        handleTripleTap();
                      }}
                      activeOpacity={1}
                    />
                    {memeElements.map((meme) => {
                      console.log("🎨 Rendu du meme:", meme.id, meme.url);
                      return (
                        <DraggableMeme
                          key={meme.id}
                          meme={meme}
                          isSelected={selectedMeme === meme.id}
                          onSelect={setSelectedMeme}
                          onUpdatePosition={updateMemePosition}
                          onRemove={removeMeme}
                          onHapticFeedback={handleHapticFeedback}
                          cameraLayout={cameraLayout}
                        />
                      );
                    })}
                  </View>
                )}

                {/* Contrôles de caméra - masqués en mode épuré */}
                {!appSettings.cleanMode && (
                  <CameraControls
                    sessionSettings={sessionSettings}
                    appSettings={appSettings}
                    onToggleFacing={toggleFacing}
                    onStartCapture={startCountdown}
                    onOpenMemeSheet={handlePresentMemeSheet}
                    onHapticFeedback={handleHapticFeedback}
                  />
                )}

                {/* Bouton de déclenchement simple pour le mode épuré */}
                {appSettings.cleanMode && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: insets.bottom + 15,
                      left: 0,
                      right: 0,
                      alignItems: "center",
                      zIndex: 100,
                    }}
                  >
                    <TouchableOpacity
                      onPress={startCountdown}
                      disabled={sessionSettings.isCapturing}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        backgroundColor: sessionSettings.isCapturing
                          ? "#ccc"
                          : "#fff",
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 8,
                      }}
                      activeOpacity={0.9}
                    />
                  </View>
                )}
              </>
            )}

            <CountdownOverlay countdown={countdown} />

            {showPreview && (
              <PreviewUI
                photoUri={currentPhotoUri}
                cameraLayout={cameraLayout}
                cameraSettings={cameraSettings}
                appSettings={appSettings}
                countdown={autoValidationCountdown}
                onRetake={handleRetakePhoto}
                onValidate={handleValidatePhoto}
                memeElements={memeElements}
                selectedMeme={selectedMeme}
                onSelectMeme={setSelectedMeme}
                onUpdateMemePosition={updateMemePosition}
                onRemoveMeme={removeMeme}
                onHapticFeedback={handleHapticFeedback}
              />
            )}
          </View>
        </View>
        
        <MemeSheet key={memeSheetKey} ref={memeSheetRef} onMemeSelect={addMemeToPreview} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { savePermanentPhoto } from "../utils/permanentStorage";
import { savePhotoToGallery } from "../utils/shareAndSave";
import * as ImageManipulator from "expo-image-manipulator";
import { Dimensions } from "react-native";
import { getPredefinedTemplate } from "../utils/predefinedTemplates";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const initialAppSettings = {
  timer: 3,
  photoCount: 4,
  photoboothMode: false, // Nouveau paramètre
  cleanMode: false, // Mode épuré - nouveau paramètre
  shakeToReveal: false, // Paramètre pour secouer pour révéler
  flash: false,
  grid: false,
  mirror: false,
  autoSave: true,
  hapticFeedback: true,
  language: "FR",
};

export function useCameraState(cameraRef, cameraLayout = null) {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [appSettings, setAppSettings] = useState(initialAppSettings);
  const [cameraSettings, setCameraSettings] = useState({
    facing: "back",
    flash: "off",
    zoom: 0,
  });
  const [sessionSettings, setSessionSettings] = useState({
    currentPhoto: 0,
    isCapturing: false,
    template: null,
    currentTemplate: "Aucun template", // Nom du template actuel
  });
  const [countdown, setCountdown] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentPhotoUri, setCurrentPhotoUri] = useState(null);
  const [autoValidationTimer, setAutoValidationTimer] = useState(null);
  const [autoValidationCountdown, setAutoValidationCountdown] = useState(10);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("thismoment_settings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        // Synchroniser avec les nouveaux paramètres
        setAppSettings((prev) => ({
          ...prev,
          ...settings,
          timer: settings.timer !== undefined ? settings.timer : prev.timer,
          photoCount:
            settings.photoCount !== undefined
              ? settings.photoCount
              : prev.photoCount,
        }));
        setCameraSettings((prev) => ({
          ...prev,
          flash: settings.flash ? "on" : "off",
        }));
      }

      // Charger le template sélectionné
      const savedTemplate = await AsyncStorage.getItem(
        "thismoment_selected_template",
      );
      if (savedTemplate) {
        let templateData = JSON.parse(savedTemplate);
        
        // Migration: Si l'ancien template par défaut "polaroid-letters" est sauvegardé,
        // le remplacer par le nouveau template par défaut "collage-4-vertical"
        if (templateData.id === "polaroid-letters") {
          console.log("Migration du template polaroid-letters vers collage-4-vertical");
          const newDefaultTemplate = getPredefinedTemplate("collage-4-vertical");
          if (newDefaultTemplate) {
            templateData = newDefaultTemplate;
            // Sauvegarder le nouveau template
            await AsyncStorage.setItem(
              "thismoment_selected_template",
              JSON.stringify(newDefaultTemplate),
            );
          }
        }
        
        // Si c'est un template prédéfini, recharger depuis PREDEFINED_TEMPLATES
        // pour obtenir le backgroundImage (require) qui ne peut pas être sérialisé
        if (templateData.isPredefined) {
          const predefinedTemplate = getPredefinedTemplate(templateData.id);
          if (predefinedTemplate) {
            templateData = predefinedTemplate;
          }
        }
        
        console.log("Template chargé:", templateData);

        // Si le template a des slots, ajuster le photoCount pour correspondre
        const templatePhotoCount = templateData.slots
          ? templateData.slots.length
          : templateData.photoCount;

        if (templatePhotoCount && templatePhotoCount > 0) {
          console.log(
            "Ajustement du photoCount selon le template:",
            templatePhotoCount,
          );
          setAppSettings((prev) => ({
            ...prev,
            photoCount: templatePhotoCount,
          }));

          // Sauvegarder le nouveau photoCount dans les paramètres
          const currentSettings = await AsyncStorage.getItem(
            "thismoment_settings",
          );
          const settingsToSave = currentSettings
            ? JSON.parse(currentSettings)
            : {};
          settingsToSave.photoCount = templatePhotoCount;
          await AsyncStorage.setItem(
            "thismoment_settings",
            JSON.stringify(settingsToSave),
          );
        }

        setSessionSettings((prev) => ({
          ...prev,
          currentTemplate: templateData.name,
          template: templateData,
        }));
      } else {
        // Pas de template sélectionné - utiliser le template par défaut "collage-4-vertical"
        const defaultTemplate = getPredefinedTemplate("collage-4-vertical");
        if (defaultTemplate) {
          console.log("Chargement du template par défaut:", defaultTemplate.name);
          
          // Ajuster le photoCount selon le template par défaut
          const templatePhotoCount = defaultTemplate.photoCount;
          setAppSettings((prev) => ({
            ...prev,
            photoCount: templatePhotoCount,
          }));
          
          // Sauvegarder le template par défaut
          await AsyncStorage.setItem(
            "thismoment_selected_template",
            JSON.stringify(defaultTemplate),
          );
          
          // Sauvegarder le photoCount dans les paramètres
          const currentSettings = await AsyncStorage.getItem(
            "thismoment_settings",
          );
          const settingsToSave = currentSettings
            ? JSON.parse(currentSettings)
            : {};
          settingsToSave.photoCount = templatePhotoCount;
          await AsyncStorage.setItem(
            "thismoment_settings",
            JSON.stringify(settingsToSave),
          );
          
          setSessionSettings((prev) => ({
            ...prev,
            currentTemplate: defaultTemplate.name,
            template: defaultTemplate,
          }));
        } else {
          // Fallback si le template par défaut n'est pas trouvé
          setSessionSettings((prev) => ({
            ...prev,
            currentTemplate: "Aucun template",
            template: null,
          }));
        }
      }

      // Réinitialiser les photos de session au début
      await AsyncStorage.removeItem("thismoment_session_photos");
      console.log("Session photos cleared");
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, []),
  );

  const handleHapticFeedback = useCallback(() => {
    if (appSettings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [appSettings.hapticFeedback]);

  const toggleFacing = useCallback(() => {
    handleHapticFeedback();
    setCameraSettings((prev) => ({
      ...prev,
      facing: prev.facing === "back" ? "front" : "back",
    }));
  }, [handleHapticFeedback]);

  // Modifier validatePhoto pour accepter les memes et l'URI composite
  const validatePhoto = useCallback(
    async (compositeUriOrMemes = []) => {
      // Arrêter l'auto-validation
      if (autoValidationTimer) {
        clearInterval(autoValidationTimer);
        setAutoValidationTimer(null);
      }

      if (currentPhotoUri) {
        // Déterminer si on a reçu un URI composite ou un tableau de memes
        let compositeUri = null;
        let memeElements = [];
        
        if (typeof compositeUriOrMemes === 'string') {
          // C'est un URI d'image composite (avec memes fusionnés)
          compositeUri = compositeUriOrMemes;
          console.log('📸 Utilisation de l\'image composite capturée:', compositeUri);
        } else if (Array.isArray(compositeUriOrMemes)) {
          // C'est un tableau de memes
          memeElements = compositeUriOrMemes;
        }
        
        // Sauvegarder dans la galerie générale avec les paramètres de caméra et miroir
        const photoData = await savePermanentPhoto(
          compositeUri || currentPhotoUri, // Utiliser l'image composite si disponible
          memeElements,
          cameraSettings, // Passer les paramètres de la caméra (facing, etc.)
          appSettings.mirror, // Passer le setting miroir
          compositeUri !== null, // Indiquer si on utilise déjà une image composite
        );

        // Auto-save dans la galerie du téléphone si activé
        if (appSettings.autoSave && photoData) {
          try {
            await savePhotoToGallery(photoData.uri, photoData, true); // silent = true
          } catch (error) {
            // Erreur silencieuse pour ne pas perturber l'utilisateur
          }
        }

        // Sauvegarder aussi dans les photos de session
        if (photoData) {
          try {
            const existingSessionPhotos = await AsyncStorage.getItem(
              "thismoment_session_photos",
            );
            const sessionPhotos = existingSessionPhotos
              ? JSON.parse(existingSessionPhotos)
              : [];
            sessionPhotos.push(photoData);
            await AsyncStorage.setItem(
              "thismoment_session_photos",
              JSON.stringify(sessionPhotos),
            );
            console.log("Photo ajoutée à la session:", photoData.id);
          } catch (error) {
            console.error("Error saving to session photos:", error);
          }
        }

        if (appSettings.hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      }

      setShowPreview(false);
      setCurrentPhotoUri(null);
      setAutoValidationCountdown(10); // Reset du compteur

      const nextPhoto = sessionSettings.currentPhoto + 1;
      if (nextPhoto >= appSettings.photoCount) {
        // Fin de session - désactiver le mode épuré pour la prochaine session
        if (appSettings.cleanMode) {
          try {
            const currentSettings = await AsyncStorage.getItem(
              "thismoment_settings",
            );
            const settings = currentSettings ? JSON.parse(currentSettings) : {};
            const updatedSettings = {
              ...settings,
              cleanMode: false,
            };
            await AsyncStorage.setItem(
              "thismoment_settings",
              JSON.stringify(updatedSettings),
            );
            console.log(
              "Mode épuré désactivé automatiquement en fin de session",
            );
          } catch (error) {
            console.error(
              "Erreur lors de la désactivation du mode épuré:",
              error,
            );
          }
        }

        setSessionSettings({
          currentPhoto: 0,
          isCapturing: false,
          template: null,
        });
        router.push("/(tabs)/session-complete");
      } else {
        setSessionSettings((prev) => ({
          ...prev,
          currentPhoto: nextPhoto,
          isCapturing: false,
        }));
      }
    },
    [
      autoValidationTimer,
      currentPhotoUri,
      sessionSettings.currentPhoto,
      appSettings.photoCount,
      appSettings.hapticFeedback,
      appSettings.mirror,
      appSettings.cleanMode,
      cameraSettings,
      router,
    ],
  );

  const captureAndShowPreview = useCallback(async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.8,
        base64: false,
        flash: cameraSettings.flash,
      });
      if (photo) {
        console.log('📸 Photo capturée:', {
          width: photo.width,
          height: photo.height,
          uri: photo.uri
        });

        // Cropper la photo pour correspondre EXACTEMENT au cadre visible
        const photoWidth = photo.width;
        const photoHeight = photo.height;
        
        // Si cameraLayout est fourni, utiliser sa position exacte
        if (cameraLayout) {
          // Calculer le ratio entre la photo et l'écran
          const screenToPhotoRatioX = photoWidth / screenWidth;
          const screenToPhotoRatioY = photoHeight / screenHeight;
          
          // Calculer la position et taille du crop en pixels de la photo
          // en utilisant la position exacte du cadre à l'écran
          const cropX = (screenWidth - cameraLayout.cameraWidth) / 2 * screenToPhotoRatioX;
          const cropY = cameraLayout.cameraTop * screenToPhotoRatioY;
          const cropWidth = cameraLayout.cameraWidth * screenToPhotoRatioX;
          const cropHeight = cameraLayout.cameraHeight * screenToPhotoRatioY;
          
          console.log('✂️ Crop basé sur cameraLayout:', {
            screenWidth,
            screenHeight,
            cameraTop: cameraLayout.cameraTop,
            cameraWidth: cameraLayout.cameraWidth,
            cameraHeight: cameraLayout.cameraHeight,
            ratioX: screenToPhotoRatioX,
            ratioY: screenToPhotoRatioY,
            cropX: Math.round(cropX),
            cropY: Math.round(cropY),
            cropWidth: Math.round(cropWidth),
            cropHeight: Math.round(cropHeight)
          });
          
          // Appliquer le crop
          const croppedPhoto = await ImageManipulator.manipulateAsync(
            photo.uri,
            [
              {
                crop: {
                  originX: Math.round(cropX),
                  originY: Math.round(cropY),
                  width: Math.round(cropWidth),
                  height: Math.round(cropHeight),
                }
              }
            ],
            {
              compress: 0.9,
              format: ImageManipulator.SaveFormat.JPEG,
            }
          );
          
          console.log('✅ Photo croppée avec cameraLayout:', croppedPhoto.uri);
          
          if (appSettings.hapticFeedback)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setCurrentPhotoUri(croppedPhoto.uri);
          setShowPreview(true);
          setAutoValidationCountdown(10);
        } else {
          // Fallback: crop centré 4:3 si pas de cameraLayout
          const targetRatio = 4 / 3;
          let cropWidth, cropHeight, cropX, cropY;
          
          cropHeight = photoHeight;
          cropWidth = cropHeight / targetRatio;
          
          if (cropWidth > photoWidth) {
            cropWidth = photoWidth;
            cropHeight = cropWidth * targetRatio;
          }
          
          cropX = (photoWidth - cropWidth) / 2;
          cropY = (photoHeight - cropHeight) / 2;
          
          console.log('✂️ Crop centré 4:3 (fallback):', {
            cropX: Math.round(cropX),
            cropY: Math.round(cropY),
            cropWidth: Math.round(cropWidth),
            cropHeight: Math.round(cropHeight)
          });
          
          const croppedPhoto = await ImageManipulator.manipulateAsync(
            photo.uri,
            [
              {
                crop: {
                  originX: Math.round(cropX),
                  originY: Math.round(cropY),
                  width: Math.round(cropWidth),
                  height: Math.round(cropHeight),
                }
              }
            ],
            {
              compress: 0.9,
              format: ImageManipulator.SaveFormat.JPEG,
            }
          );
          
          console.log('✅ Photo croppée (fallback):', croppedPhoto.uri);
          
          if (appSettings.hapticFeedback)
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setCurrentPhotoUri(croppedPhoto.uri);
          setShowPreview(true);
          setAutoValidationCountdown(10);
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      setSessionSettings((prev) => ({ ...prev, isCapturing: false }));
    }
  }, [cameraRef, cameraSettings.flash, appSettings.hapticFeedback, cameraLayout]);

  // Correctif pour l'auto-validation : créer l'effet séparément et le nettoyer correctement
  useEffect(() => {
    let timer = null;

    if (showPreview && !autoValidationTimer) {
      console.log(
        "Démarrage de l'auto-validation, compteur:",
        autoValidationCountdown,
      );
      timer = setInterval(() => {
        setAutoValidationCountdown((prev) => {
          console.log("Auto-validation countdown:", prev);
          if (prev <= 1) {
            console.log("Auto-validation déclenchée");
            // Planifier l'exécution de validatePhoto pour éviter les conflits d'état
            setTimeout(() => {
              validatePhoto();
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setAutoValidationTimer(timer);
    }

    return () => {
      if (timer) {
        console.log("Nettoyage du timer d'auto-validation");
        clearInterval(timer);
      }
    };
  }, [showPreview]); // Seulement dépendant de showPreview pour éviter les recréations infinies

  // Effet séparé pour nettoyer le timer quand showPreview devient false
  useEffect(() => {
    if (!showPreview && autoValidationTimer) {
      console.log("showPreview false, nettoyage du timer");
      clearInterval(autoValidationTimer);
      setAutoValidationTimer(null);
      setAutoValidationCountdown(10);
    }
  }, [showPreview, autoValidationTimer]);

  const startCountdown = useCallback(() => {
    if (sessionSettings.isCapturing) return;
    handleHapticFeedback();
    setSessionSettings((prev) => ({ ...prev, isCapturing: true }));
    if (appSettings.timer === 0) {
      captureAndShowPreview();
      return;
    }
    let count = appSettings.timer;
    setCountdown(count);
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        if (appSettings.hapticFeedback)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        setCountdown(null);
        clearInterval(countdownInterval);
        captureAndShowPreview();
      }
    }, 1000);
  }, [
    sessionSettings.isCapturing,
    handleHapticFeedback,
    appSettings.timer,
    appSettings.hapticFeedback,
    captureAndShowPreview,
  ]);

  // Effet pour gérer le mode photobooth automatique
  useEffect(() => {
    // Si on vient de valider une photo et qu'on n'est pas en preview
    // et que le mode photobooth est activé et qu'on n'est pas en train de capturer
    // et qu'il reste encore des photos à prendre
    if (
      !showPreview &&
      appSettings.photoboothMode &&
      !sessionSettings.isCapturing &&
      sessionSettings.currentPhoto > 0 && // On a au moins pris une photo
      sessionSettings.currentPhoto < appSettings.photoCount
    ) {
      console.log(
        "Mode photobooth activé, démarrage automatique de la photo suivante",
      );
      // Délai court pour permettre à l'UI de se mettre à jour
      const timer = setTimeout(() => {
        startCountdown();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    showPreview,
    appSettings.photoboothMode,
    sessionSettings.isCapturing,
    sessionSettings.currentPhoto,
    appSettings.photoCount,
    startCountdown,
  ]);

  const retakePhoto = useCallback(() => {
    handleHapticFeedback();
    if (autoValidationTimer) {
      clearInterval(autoValidationTimer);
      setAutoValidationTimer(null);
    }
    setShowPreview(false);
    setCurrentPhotoUri(null);
    setAutoValidationCountdown(10); // Reset du compteur
    setSessionSettings((prev) => ({ ...prev, isCapturing: false }));
  }, [handleHapticFeedback, autoValidationTimer]);

  // Fonction pour changer le nombre de photos et gérer les templates
  const updatePhotoCount = useCallback(
    async (newPhotoCount) => {
      try {
        // Mettre à jour les paramètres
        setAppSettings((prev) => ({
          ...prev,
          photoCount: newPhotoCount,
        }));

        // Sauvegarder dans AsyncStorage
        const currentSettings = await AsyncStorage.getItem(
          "thismoment_settings",
        );
        const settingsToSave = currentSettings
          ? JSON.parse(currentSettings)
          : {};
        settingsToSave.photoCount = newPhotoCount;
        await AsyncStorage.setItem(
          "thismoment_settings",
          JSON.stringify(settingsToSave),
        );

        // Vérifier si on a un template actuel
        const currentTemplate = sessionSettings.template;
        if (currentTemplate && currentTemplate.slots) {
          const templatePhotoCount = currentTemplate.slots.length;

          // Si le nouveau nombre ne correspond plus au template, enlever le template
          if (newPhotoCount !== templatePhotoCount) {
            console.log(
              `PhotoCount changé de ${templatePhotoCount} à ${newPhotoCount}, suppression du template`,
            );

            // Enlever le template sélectionné
            await AsyncStorage.removeItem("thismoment_selected_template");

            // Mettre à jour les session settings
            setSessionSettings((prev) => ({
              ...prev,
              currentTemplate: "Aucun template",
              template: null,
            }));

            console.log("Template supprimé car photoCount ne correspond plus");
          }
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour du photoCount:", error);
      }
    },
    [sessionSettings.template],
  );

  return {
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
    updatePhotoCount, // Nouvelle fonction exportée
    loadSettings, // Exposer loadSettings pour forcer le rechargement
  };
}

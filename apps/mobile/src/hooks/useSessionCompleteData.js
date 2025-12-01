import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePremium } from "@/utils/usePremium";

export function useSessionCompleteData() {
  const { isPremium } = usePremium();
  
  const [data, setData] = useState({
    isPremium: false,
    sessionPhotos: [],
    selectedTemplate: null,
    shakeToRevealEnabled: false,
    sessionId: null,
    isLoading: true,
  });

  const loadSessionData = useCallback(async () => {
    setData((d) => ({ ...d, isLoading: true }));
    try {
      const savedSettings = await AsyncStorage.getItem("thismoment_settings");
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      const shakeEnabled = settings.shakeToReveal || false;

      const templateData = await AsyncStorage.getItem(
        "thismoment_selected_template",
      );
      if (!templateData) {
        setData((d) => ({
          ...d,
          isPremium: isPremium,
          isLoading: false,
          shakeToRevealEnabled: shakeEnabled,
        }));
        return;
      }

      const template = JSON.parse(templateData);
      let fullTemplate = template;

      // Si c'est un template personnalisé, charger depuis le stockage
      if (template.isCustom) {
        const customTemplatesData = await AsyncStorage.getItem(
          "thismoment_custom_templates",
        );
        if (customTemplatesData) {
          const customTemplates = JSON.parse(customTemplatesData);
          fullTemplate =
            customTemplates.find((t) => t.id === template.id) || template;
        }
      } else {
        // Si c'est un template prédéfini, charger depuis PREDEFINED_TEMPLATES
        const { getPredefinedTemplate } = require('../utils/predefinedTemplates');
        const predefinedTemplate = getPredefinedTemplate(template.id);
        if (predefinedTemplate) {
          fullTemplate = predefinedTemplate;
        }
      }

      const sessionData = await AsyncStorage.getItem(
        "thismoment_session_photos",
      );
      let photos = [];
      if (sessionData) {
        photos = JSON.parse(sessionData);
      } else {
        const allPhotosData = await AsyncStorage.getItem("thismoment_photos");
        if (allPhotosData) {
          const allPhotos = JSON.parse(allPhotosData);
          const photoCount =
            fullTemplate.photoCount || fullTemplate.slots?.length || 4;
          photos = allPhotos.slice(-photoCount).reverse();
        }
      }

      const newSessionId =
        photos.length > 0 ? photos[photos.length - 1].id : Date.now();

      console.log('📊 Session data loaded:', {
        photosCount: photos.length,
        templateId: fullTemplate?.id,
        templateName: fullTemplate?.name,
        hasSlots: !!fullTemplate?.slots,
        slotsCount: fullTemplate?.slots?.length
      });
      
      setData({
        isPremium: isPremium,
        sessionPhotos: photos,
        selectedTemplate: fullTemplate,
        shakeToRevealEnabled: shakeEnabled,
        sessionId: newSessionId,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading session data:", error);
      setData((d) => ({ ...d, isLoading: false }));
    }
  }, [isPremium]);

  useFocusEffect(
    useCallback(() => {
      loadSessionData();
    }, [loadSessionData]),
  );

  return data;
}

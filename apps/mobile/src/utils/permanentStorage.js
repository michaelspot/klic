import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Sauvegarde une image de façon permanente avec ImageManipulator
 * @param {string} originalUri - URI temporaire de l'image
 * @param {string} prefix - Préfixe pour identifier le type d'image
 * @returns {string} - URI permanente de l'image sauvegardée
 */
export const savePermanentImage = async (originalUri, prefix = "img") => {
  try {
    console.log("Sauvegarde permanente de l'image:", { originalUri, prefix });

    // Utiliser ImageManipulator pour créer une copie permanente
    const result = await ImageManipulator.manipulateAsync(
      originalUri,
      [], // Pas de transformation, juste copier
      {
        compress: 0.9, // Compression légère pour économiser l'espace
        format: ImageManipulator.SaveFormat.JPEG,
        base64: false,
      },
    );

    console.log("Image sauvegardée de façon permanente:", result.uri);
    return result.uri;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde permanente de l'image:", error);
    throw error;
  }
};

/**
 * Sauvegarde une photo prise par l'appareil photo dans la galerie
 * @param {string} photoUri - URI de la photo (peut être l'image composite avec memes fusionnés)
 * @param {Array} memeElements - Memes à sauvegarder avec la photo (pour affichage en overlay si pas fusionnés)
 * @param {Object} cameraSettings - Paramètres de la caméra (facing, etc.)
 * @param {boolean} mirrorEnabled - Si l'effet miroir est activé dans les paramètres
 * @param {boolean} isComposite - Si l'URI est déjà une image composite avec memes fusionnés
 * @returns {Object} - Données de la photo sauvegardée
 */
export const savePermanentPhoto = async (
  photoUri,
  memeElements = [],
  cameraSettings = {},
  mirrorEnabled = false,
  isComposite = false,
) => {
  try {
    console.log("Sauvegarde permanente de la photo:", {
      photoUri,
      memes: memeElements.length,
      cameraSettings,
      mirrorEnabled,
      isComposite,
    });

    // Sauvegarder la photo de façon permanente
    // Si c'est déjà une image composite (avec memes fusionnés), on la sauvegarde telle quelle
    const permanentPhotoUri = await savePermanentImage(photoUri, "photo");

    // Sauvegarder les memes de façon permanente s'ils existent ET si ce n'est pas déjà une image composite
    const permanentMemes = [];
    if (!isComposite) {
      for (const meme of memeElements) {
        if (meme.url) {
          try {
            const permanentMemeUri = await savePermanentImage(
              meme.url,
              "meme",
            );
            permanentMemes.push({
              ...meme,
              url: permanentMemeUri, // Remplacer par l'URI permanente
            });
          } catch (error) {
            console.error("Erreur sauvegarde meme:", error);
            // En cas d'erreur, garder l'URI originale
            permanentMemes.push(meme);
          }
        } else {
          permanentMemes.push(meme);
        }
      }
    }

    const timestamp = Date.now();
    
    const photoData = {
      id: `photo_${timestamp}`,
      uri: permanentPhotoUri, // URI permanente
      timestamp,
      favorite: false,
      hasWatermark: true,
      memes: permanentMemes, // Memes avec URIs permanentes (vide si image composite)
      isComposite: isComposite, // Indiquer si les memes sont déjà fusionnés
      // Sauvegarder les paramètres de caméra pour un affichage cohérent
      cameraSettings: {
        facing: cameraSettings.facing,
        mirrorEnabled: mirrorEnabled,
      },
    };

    // Sauvegarder dans la galerie générale
    const existingPhotos = await AsyncStorage.getItem("thismoment_photos");
    const photos = existingPhotos ? JSON.parse(existingPhotos) : [];
    photos.unshift(photoData);
    await AsyncStorage.setItem("thismoment_photos", JSON.stringify(photos));

    console.log("Photo sauvegardée avec succès:", photoData.id);
    return photoData;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la photo:", error);
    throw error;
  }
};

/**
 * Sauvegarde un template avec image de fond permanente
 * @param {Object} templateData - Données du template
 * @returns {Object} - Template avec URI permanente
 */
export const savePermanentTemplate = async (templateData) => {
  try {
    console.log("Sauvegarde permanente du template:", templateData.name);

    let finalTemplate = { ...templateData };

    // Sauvegarder l'image de fond de façon permanente si elle existe
    if (templateData.backgroundImage) {
      console.log("Sauvegarde de l'image de fond du template...");
      const permanentBackgroundUri = await savePermanentImage(
        templateData.backgroundImage,
        "template-bg",
      );

      finalTemplate.backgroundImage = permanentBackgroundUri;
      finalTemplate.preview = permanentBackgroundUri; // Utiliser la même image pour la preview
      console.log("Image de fond sauvegardée:", permanentBackgroundUri);
    }

    // Charger les templates existants
    const existingTemplatesData = await AsyncStorage.getItem(
      "thismoment_custom_templates",
    );
    let templates = [];

    if (existingTemplatesData) {
      templates = JSON.parse(existingTemplatesData);
    }

    // Vérifier si le template existe déjà
    const existingIndex = templates.findIndex((t) => t.id === finalTemplate.id);

    if (existingIndex >= 0) {
      // Mettre à jour le template existant
      templates[existingIndex] = finalTemplate;
      console.log("Template mis à jour:", finalTemplate.id);
    } else {
      // Ajouter le nouveau template
      templates.push(finalTemplate);
      console.log("Nouveau template ajouté:", finalTemplate.id);
    }

    // Sauvegarder la liste mise à jour
    await AsyncStorage.setItem(
      "thismoment_custom_templates",
      JSON.stringify(templates),
    );
    console.log("Templates sauvegardés avec succès");

    return finalTemplate;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du template:", error);
    throw error;
  }
};

/**
 * Nettoyer les images temporaires (optionnel, pour éviter l'accumulation)
 * Cette fonction peut être appelée périodiquement pour nettoyer les fichiers temporaires
 */
export const cleanupTemporaryFiles = async () => {
  // Cette fonction pourrait être implémentée plus tard si nécessaire
  // pour nettoyer les fichiers temporaires qui ne sont plus utilisés
  console.log(
    "Nettoyage des fichiers temporaires (à implémenter si nécessaire)",
  );
};

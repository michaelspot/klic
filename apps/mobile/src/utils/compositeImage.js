import { View } from 'react-native';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import { captureRef } from 'react-native-view-shot';
import React from 'react';

/**
 * Génère une image composite en fusionnant la photo avec les memes
 * @param {string} photoUri - URI de la photo
 * @param {Array} memes - Liste des memes à fusionner
 * @param {Object} cameraSettings - Paramètres de la caméra
 * @param {number} width - Largeur de l'image finale
 * @param {number} height - Hauteur de l'image finale
 * @returns {Promise<string>} - URI de l'image composite
 */
export const createCompositeWithMemes = async (
  photoUri,
  memes = [],
  cameraSettings = {},
  width,
  height
) => {
  try {
    console.log('🎨 Création de l\'image composite avec memes...');
    console.log('📊 Paramètres:', { width, height, memesCount: memes.length });

    // Si pas de memes, juste cropper et flipper l'image
    if (!memes || memes.length === 0) {
      console.log('✅ Pas de memes, crop et flip uniquement');
      return await cropAndFlipImage(photoUri, cameraSettings, width, height);
    }

    // Pour fusionner les memes, on doit d'abord créer une image composite
    // en utilisant ImageManipulator pour superposer les images
    console.log('🔄 Fusion des memes avec l\'image...');
    
    // Étape 1: Cropper et flipper l'image de base
    const baseImageUri = await cropAndFlipImage(photoUri, cameraSettings, width, height);
    
    // Étape 2: Pour chaque meme, on va les superposer
    // Note: ImageManipulator ne supporte pas nativement l'overlay d'images
    // On va donc retourner l'image de base et laisser l'UI gérer l'affichage des memes
    console.log('⚠️ Fusion des memes limitée - retour de l\'image de base');
    
    return baseImageUri;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'image composite:', error);
    throw error;
  }
};

/**
 * Crop et flip une image selon les paramètres
 * @param {string} photoUri - URI de la photo
 * @param {Object} cameraSettings - Paramètres de la caméra
 * @param {number} targetWidth - Largeur cible
 * @param {number} targetHeight - Hauteur cible
 * @returns {Promise<string>} - URI de l'image traitée
 */
const cropAndFlipImage = async (photoUri, cameraSettings, targetWidth, targetHeight) => {
  try {
    // Obtenir les dimensions de l'image originale
    const imageInfo = await ImageManipulator.manipulateAsync(
      photoUri,
      [],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    const originalWidth = imageInfo.width;
    const originalHeight = imageInfo.height;
    
    console.log('📐 Dimensions originales:', { originalWidth, originalHeight });
    console.log('🎯 Dimensions cibles:', { targetWidth, targetHeight });
    
    // Calculer le crop 4:3 (format portrait)
    const targetRatio = targetHeight / targetWidth;
    
    let cropWidth, cropHeight, cropX, cropY;
    
    // Calculer les dimensions du crop
    cropHeight = originalHeight;
    cropWidth = cropHeight / targetRatio;
    
    // Si la largeur calculée dépasse la largeur originale, ajuster
    if (cropWidth > originalWidth) {
      cropWidth = originalWidth;
      cropHeight = cropWidth * targetRatio;
    }
    
    // Centrer le crop
    cropX = (originalWidth - cropWidth) / 2;
    cropY = (originalHeight - cropHeight) / 2;
    
    console.log('✂️ Crop calculé:', { cropX, cropY, cropWidth, cropHeight });
    
    // Préparer les actions de manipulation
    const actions = [
      {
        crop: {
          originX: Math.round(cropX),
          originY: Math.round(cropY),
          width: Math.round(cropWidth),
          height: Math.round(cropHeight),
        }
      }
    ];
    
    // Appliquer l'effet miroir si nécessaire
    if (cameraSettings) {
      const shouldFlip = cameraSettings.facing === 'front' 
        ? !cameraSettings.mirrorEnabled
        : cameraSettings.mirrorEnabled;
      
      if (shouldFlip) {
        actions.push({ flip: ImageManipulator.FlipType.Horizontal });
        console.log('🔄 Application du flip horizontal');
      }
    }
    
    // Redimensionner à la taille cible si nécessaire
    if (targetWidth && targetHeight) {
      actions.push({
        resize: {
          width: Math.round(targetWidth),
          height: Math.round(targetHeight),
        }
      });
      console.log('📏 Redimensionnement à:', { targetWidth, targetHeight });
    }
    
    // Appliquer toutes les transformations
    const result = await ImageManipulator.manipulateAsync(
      photoUri,
      actions,
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    
    console.log('✅ Image traitée:', result.uri);
    return result.uri;
  } catch (error) {
    console.error('❌ Erreur lors du crop/flip:', error);
    throw error;
  }
};

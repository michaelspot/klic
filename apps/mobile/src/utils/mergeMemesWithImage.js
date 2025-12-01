import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Skia, makeImageFromEncoded } from '@shopify/react-native-skia';

/**
 * Fusionne les memes avec l'image de base en créant une image composite
 * @param {string} baseImageUri - URI de l'image de base (déjà croppée et flippée)
 * @param {Array} memes - Liste des memes à fusionner
 * @param {number} width - Largeur de l'image finale
 * @param {number} height - Hauteur de l'image finale
 * @returns {Promise<string>} - URI de l'image composite
 */
export const mergeMemesWithImage = async (baseImageUri, memes, width, height) => {
  try {
    console.log('🎨 Fusion des memes avec l\'image de base...');
    console.log('📊 Paramètres:', { width, height, memesCount: memes.length });

    if (!memes || memes.length === 0) {
      console.log('✅ Pas de memes à fusionner');
      return baseImageUri;
    }

    // Créer une surface Skia
    const surface = Skia.Surface.Make(width, height);
    if (!surface) {
      console.error('❌ Impossible de créer la surface Skia');
      return baseImageUri;
    }

    const canvas = surface.getCanvas();

    // Charger l'image de base
    const baseImageData = await FileSystem.readAsStringAsync(baseImageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const baseImage = makeImageFromEncoded(
      Skia.Data.fromBase64(baseImageData)
    );

    if (!baseImage) {
      console.error('❌ Impossible de charger l\'image de base');
      return baseImageUri;
    }

    // Dessiner l'image de base
    const srcRect = Skia.XYWHRect(0, 0, baseImage.width(), baseImage.height());
    const destRect = Skia.XYWHRect(0, 0, width, height);
    canvas.drawImageRect(baseImage, srcRect, destRect);

    // Dessiner chaque meme
    for (const meme of memes) {
      try {
        // Charger le meme
        const memeImageData = await FileSystem.readAsStringAsync(meme.url, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const memeImage = makeImageFromEncoded(
          Skia.Data.fromBase64(memeImageData)
        );

        if (!memeImage) {
          console.warn('⚠️ Impossible de charger le meme:', meme.id);
          continue;
        }

        // Calculer les dimensions et position du meme
        const memeWidth = meme.width * (meme.scale || 1);
        const memeHeight = meme.height * (meme.scale || 1);

        // Dessiner le meme
        const memeSrcRect = Skia.XYWHRect(
          0,
          0,
          memeImage.width(),
          memeImage.height()
        );
        const memeDestRect = Skia.XYWHRect(
          meme.x,
          meme.y,
          memeWidth,
          memeHeight
        );
        canvas.drawImageRect(memeImage, memeSrcRect, memeDestRect);

        console.log('✅ Meme fusionné:', meme.id);
      } catch (error) {
        console.error('❌ Erreur lors de la fusion du meme:', meme.id, error);
      }
    }

    // Obtenir l'image résultante
    const snapshot = surface.makeImageSnapshot();
    if (!snapshot) {
      console.error('❌ Impossible de créer le snapshot');
      return baseImageUri;
    }

    // Encoder en PNG
    const pngData = snapshot.encodeToBase64();
    if (!pngData) {
      console.error('❌ Impossible d\'encoder l\'image');
      return baseImageUri;
    }

    // Sauvegarder dans un fichier temporaire
    const tempUri = `${FileSystem.cacheDirectory}composite_${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(tempUri, pngData, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('✅ Image composite créée:', tempUri);
    return tempUri;
  } catch (error) {
    console.error('❌ Erreur lors de la fusion des memes:', error);
    return baseImageUri;
  }
};

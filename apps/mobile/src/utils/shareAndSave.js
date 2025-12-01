import { Alert, Share, Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t } from './i18n';

/**
 * Génère une image composite 4:3 avec l'effet miroir appliqué
 * @param {string} photoUri - URI de la photo originale
 * @param {Object} photo - Objet photo avec métadonnées (memes, cameraSettings, etc.)
 * @param {string} compositeUri - URI optionnelle d'une image composite déjà générée (avec memes fusionnés)
 * @returns {Promise<string>} - URI de l'image composite générée
 */
export const generateCompositeImage = async (photoUri, photo = null, compositeUri = null) => {
  // Si une image composite est déjà fournie (avec memes fusionnés), l'utiliser directement
  if (compositeUri) {
    console.log('✅ Utilisation de l\'image composite fournie:', compositeUri);
    return compositeUri;
  }
  try {
    console.log('🎨 Génération de l\'image composite 4:3...');
    
    // Obtenir les dimensions de l'image originale
    const imageInfo = await ImageManipulator.manipulateAsync(
      photoUri,
      [],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    const originalWidth = imageInfo.width;
    const originalHeight = imageInfo.height;
    
    console.log('📐 Dimensions originales:', { originalWidth, originalHeight });
    
    // Calculer le crop 4:3 (format portrait)
    const targetRatio = 4 / 3; // hauteur / largeur (portrait)
    
    let cropWidth, cropHeight, cropX, cropY;
    
    // Calculer les dimensions du crop 4:3
    cropHeight = originalHeight;
    cropWidth = cropHeight * (3 / 4);
    
    // Si la largeur calculée dépasse la largeur originale, ajuster
    if (cropWidth > originalWidth) {
      cropWidth = originalWidth;
      cropHeight = cropWidth * (4 / 3);
    }
    
    // Centrer le crop
    cropX = (originalWidth - cropWidth) / 2;
    cropY = (originalHeight - cropHeight) / 2;
    
    console.log('✂️ Crop 4:3:', { 
      cropX: Math.round(cropX), 
      cropY: Math.round(cropY), 
      cropWidth: Math.round(cropWidth), 
      cropHeight: Math.round(cropHeight) 
    });
    
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
    if (photo?.cameraSettings) {
      const shouldFlip = photo.cameraSettings.facing === 'front' 
        ? !photo.cameraSettings.mirrorEnabled  // Caméra avant: flip si miroir désactivé
        : photo.cameraSettings.mirrorEnabled;  // Caméra arrière: flip si miroir activé
      
      if (shouldFlip) {
        actions.push({ flip: ImageManipulator.FlipType.Horizontal });
        console.log('🔄 Application du flip horizontal');
      }
    }
    
    // Appliquer le crop et le flip
    const croppedImage = await ImageManipulator.manipulateAsync(
      photoUri,
      actions,
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    
    console.log('✅ Image 4:3 générée:', croppedImage.uri);
    
    if (photo?.memes && photo.memes.length > 0) {
      console.log(`💡 ${photo.memes.length} meme(s) seront affichés en overlay dans l'interface`);
    }
    
    return croppedImage.uri;
  } catch (error) {
    console.error('❌ Erreur lors de la génération de l\'image composite:', error);
    // En cas d'erreur, retourner l'URI originale
    return photoUri;
  }
};

/**
 * Sauvegarde une photo dans la galerie de l'utilisateur
 * @param {string} photoUri - URI de la photo à sauvegarder
 * @param {Object} photo - Objet photo complet avec métadonnées
 * @param {boolean} silent - Si true, ne pas afficher l'alerte de succès
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
export const savePhotoToGallery = async (photoUri, photo = null, silent = false) => {
  try {
    // Demander la permission d'accès à la galerie
    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        t('permissionRequired'),
        t('permissionRequiredMessage'),
        [
          { text: t('openSettings'), onPress: openAppSettings },
          { text: t('cancel'), style: 'cancel' }
        ]
      );
      return false;
    }

    // Si l'image est déjà composite (memes fusionnés), l'utiliser directement
    // Sinon, générer l'image composite 4:3 avec crop et effet miroir
    let finalUri = photoUri;
    
    if (photo?.isComposite) {
      console.log('✅ Image déjà composite, utilisation directe');
      finalUri = photoUri;
    } else {
      console.log('🎨 Génération de l\'image composite 4:3...');
      finalUri = await generateCompositeImage(photoUri, photo);
    }
    
    console.log('💾 Sauvegarde de l\'image:', finalUri);

    // Optimiser l'image pour la sauvegarde
    const optimizedImage = await ImageManipulator.manipulateAsync(
      finalUri,
      [], // Pas de transformation supplémentaire, juste compression
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Sauvegarder directement dans la galerie
    const asset = await MediaLibrary.createAssetAsync(optimizedImage.uri);
    
    if (asset) {
      console.log('Photo sauvegardée avec succès dans la galerie');
      
      // N'afficher l'alerte que si ce n'est pas un auto-save
      if (!silent) {
        Alert.alert(
          t('success'),
          t('photoSaved'),
          [{ text: t('ok') }]
        );
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    
    Alert.alert(
      t('saveError'),
      t('saveErrorMessage'),
      [
        { text: t('openSettings'), onPress: openAppSettings },
        { text: t('close'), style: 'cancel' }
      ]
    );
    return false;
  }
};

/**
 * Partage une photo via le système de partage
 * @param {string} photoUri - URI de la photo à partager
 * @param {Object} photo - Objet photo complet avec métadonnées
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
export const sharePhoto = async (photoUri, photo = null) => {
  try {
    // Si l'image est déjà composite (memes fusionnés), l'utiliser directement
    // Sinon, générer l'image composite 4:3 avec crop et effet miroir
    let finalUri = photoUri;
    
    if (photo?.isComposite) {
      console.log('✅ Image déjà composite, utilisation directe');
      finalUri = photoUri;
    } else {
      console.log('🎨 Génération de l\'image composite 4:3...');
      finalUri = await generateCompositeImage(photoUri, photo);
    }
    
    console.log('📤 Partage de l\'image:', finalUri);
    
    // Optimiser l'image pour le partage
    const optimizedImage = await ImageManipulator.manipulateAsync(
      finalUri,
      [], // Pas de transformation supplémentaire, juste compression
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const shareOptions = {
      url: optimizedImage.uri,
      title: t('sharePhotoName'),
      message: `${t('photoTakenWith')}${photo ? ` le ${new Date(photo.timestamp).toLocaleDateString('fr-FR')}` : ''}`,
    };

    const result = await Share.share(shareOptions);
    
    if (result.action === Share.sharedAction) {
      console.log('Photo partagée avec succès');
      return true;
    } else if (result.action === Share.dismissedAction) {
      console.log('Partage annulé');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors du partage:', error);
    Alert.alert(
      t('shareError'),
      t('shareErrorMessage')
    );
    return false;
  }
};

/**
 * Partage plusieurs photos de session
 * @param {Array} sessionPhotos - Array des photos de la session
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
export const shareSessionPhotos = async (sessionPhotos) => {
  try {
    if (!sessionPhotos || sessionPhotos.length === 0) {
      Alert.alert(t('noPhotos'), t('noPhotosToShare'));
      return false;
    }

    // Si une seule photo, partager directement
    if (sessionPhotos.length === 1) {
      return await sharePhoto(sessionPhotos[0].uri, sessionPhotos[0]);
    }

    // Pour plusieurs photos, créer un message avec liste
    const photosList = sessionPhotos
      .map((photo, index) => `• Photo ${index + 1}`)
      .join('\n');

    const message = `${t('sessionWith')} ${sessionPhotos.length} ${t('photos')}:\n\n${photosList}\n\n${t('individualShareRequired')}`;

    // Proposer les options à l'utilisateur
    Alert.alert(
      t('shareSession'),
      message,
      [
        {
          text: t('shareFirst'),
          onPress: () => sharePhoto(sessionPhotos[0].uri, sessionPhotos[0])
        },
        {
          text: t('viewAllPhotos'),
          onPress: () => showSessionPhotosOptions(sessionPhotos)
        },
        { text: t('cancel'), style: 'cancel' }
      ]
    );

    return true;
  } catch (error) {
    console.error('Erreur lors du partage de session:', error);
    Alert.alert(
      t('shareError'),
      t('shareErrorMessage')
    );
    return false;
  }
};

/**
 * Sauvegarde toutes les photos d'une session
 * @param {Array} sessionPhotos - Array des photos de la session
 * @param {boolean} silent - Si true, ne pas afficher les alertes
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
export const saveSessionPhotos = async (sessionPhotos, silent = false) => {
  try {
    if (!sessionPhotos || sessionPhotos.length === 0) {
      if (!silent) {
        Alert.alert(t('noPhotos'), t('noPhotosToSave'));
      }
      return false;
    }

    // Si une seule photo, sauvegarder directement
    if (sessionPhotos.length === 1) {
      return await savePhotoToGallery(sessionPhotos[0].uri, sessionPhotos[0], silent);
    }

    // Si silent, sauvegarder toutes les photos sans afficher d'alerte
    if (silent) {
      for (const photo of sessionPhotos) {
        await savePhotoToGallery(photo.uri, photo, true);
      }
      return true;
    }

    // Pour plusieurs photos, expliquer le processus
    const photosList = sessionPhotos
      .map((photo, index) => `• Photo ${index + 1}`)
      .join('\n');

    const message = `Session avec ${sessionPhotos.length} ${t('photos')}:\n\n${photosList}\n\n${t('saveInstructions')}`;

    Alert.alert(
      t('saveSession'),
      message,
      [
        {
          text: t('shareFirst'),
          onPress: () => sharePhoto(sessionPhotos[0].uri, sessionPhotos[0])
        },
        {
          text: t('viewAllPhotos'),
          onPress: () => showSessionPhotosOptions(sessionPhotos)
        },
        { text: t('understood'), style: 'cancel' }
      ]
    );

    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de session:', error);
    Alert.alert(
      t('saveError'),
      t('shareErrorMessage')
    );
    return false;
  }
};

/**
 * Affiche les options pour chaque photo de la session
 * @param {Array} sessionPhotos - Array des photos de la session
 */
const showSessionPhotosOptions = (sessionPhotos) => {
  const options = sessionPhotos.map((photo, index) => ({
    text: `Photo ${index + 1}`,
    onPress: () => sharePhoto(photo.uri, photo)
  }));

  options.push({ text: t('close'), style: 'cancel' });

  Alert.alert(
    t('choosePhoto'),
    t('choosePhotoMessage'),
    options
  );
};

/**
 * Ouvre les paramètres de l'app
 */
const openAppSettings = async () => {
  try {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openURL('package:' + 'com.yourapp.package'); // À adapter selon le package
    }
  } catch (error) {
    console.error('Impossible d\'ouvrir les paramètres:', error);
    Alert.alert(
      'Paramètres',
      'Ouvrez manuellement les Réglages > ThisMoment > Photos pour autoriser l\'accès.'
    );
  }
};

/**
 * Assemble plusieurs images en un collage selon le template avec Skia
 * @param {Array} sessionPhotos - Photos de la session
 * @param {Object} selectedTemplate - Template sélectionné
 * @param {Object} collageRef - Référence au composant de collage (non utilisé avec Skia)
 * @returns {Promise<string>} - URI de l'image composite générée
 */
export const generateTemplateComposite = async (sessionPhotos, selectedTemplate, collageRef = null) => {
  try {
    if (!selectedTemplate || !sessionPhotos.length) {
      throw new Error('Template ou photos manquants');
    }

    // Si pas de slots (template "Aucun template"), retourner la dernière photo
    if (!selectedTemplate.slots || selectedTemplate.slots.length === 0) {
      return sessionPhotos[sessionPhotos.length - 1].uri;
    }

    console.log('🎨 Création du collage...');
    console.log('Template:', selectedTemplate.name, 'isCustom:', selectedTemplate.isCustom, 'hasBackgroundImage:', !!selectedTemplate.backgroundImage, 'category:', selectedTemplate.category, 'Photos:', sessionPhotos.length);

    // Pour TOUS les templates avec slots, utiliser la capture de la vue
    // Cela garantit que les positions, zooms et rotations des photos sont respectés
    const hasSlots = selectedTemplate.slots && selectedTemplate.slots.length > 0;
    
    console.log('🔍 Vérification du template:');
    console.log('  - hasSlots:', hasSlots);
    console.log('  - collageRef?.current:', !!collageRef?.current);
    console.log('  - slots.length:', selectedTemplate.slots?.length);
    
    if (hasSlots && collageRef?.current) {
      console.log('📸 Template avec slots détecté - capture de la vue pour respecter les transformations...');
      console.log('  Type:', selectedTemplate.isCustom ? 'Custom' : 'Prédéfini');
      console.log('  Category:', selectedTemplate.category || 'Aucune');
      console.log('  BackgroundImage:', !!selectedTemplate.backgroundImage);
      console.log('  Nombre de slots:', selectedTemplate.slots.length);
      console.log('  Nombre de photos:', sessionPhotos.length);
      
      const { captureRef } = require('react-native-view-shot');
      
      try {
        console.log('⏳ Démarrage de la capture...');
        const uri = await captureRef(collageRef, {
          format: 'jpg',
          quality: 1.0,
          result: 'tmpfile',
        });
        
        console.log('✅✅✅ Template capturé avec toutes les transformations:', uri);
        console.log('  Format: JPG, Quality: 1.0');
        return uri;
      } catch (captureError) {
        console.error('❌❌❌ Erreur lors de la capture du template:', captureError);
        console.error('  Stack:', captureError.stack);
        // Fallback sur la première photo
        console.log('⚠️ Fallback sur la première photo');
        return sessionPhotos[0].uri;
      }
    }

    // Fallback pour les templates sans slots (ne devrait jamais arriver à ce point)
    console.log('⚠️⚠️⚠️ Template sans slots ou collageRef non disponible - fallback sur première photo');
    console.log('  hasSlots:', hasSlots);
    console.log('  collageRef?.current:', !!collageRef?.current);
    return sessionPhotos[0].uri;

  } catch (error) {
    console.error('Erreur lors de la génération de composite:', error);
    // Fallback: retourner la première photo disponible
    return sessionPhotos.length > 0 ? sessionPhotos[0].uri : null;
  }
};

/**
 * Partage ou sauvegarde le résultat d'une session avec template
 * @param {Array} sessionPhotos - Photos de la session
 * @param {Object} selectedTemplate - Template sélectionné
 * @param {string} action - 'share' ou 'save'
 * @param {Object} collageRef - Référence au composant de collage
 * @param {boolean} silent - Si true, ne pas afficher les alertes
 * @returns {Promise<boolean>} - true si succès, false sinon
 */
export const handleTemplateSessionAction = async (sessionPhotos, selectedTemplate, action = 'share', collageRef = null, silent = false) => {
  try {
    // Générer l'image composite du template
    const compositeUri = await generateTemplateComposite(sessionPhotos, selectedTemplate, collageRef);
    
    if (!compositeUri) {
      throw new Error('Impossible de générer l\'image composite');
    }

    const mockPhoto = {
      id: `template-${Date.now()}`,
      uri: compositeUri,
      timestamp: Date.now(),
      template: selectedTemplate?.name || 'Template personnalisé',
      isComposite: true, // Marquer comme composite pour éviter le recrop
    };

    if (action === 'save') {
      return await savePhotoToGallery(compositeUri, mockPhoto, silent);
    } else {
      return await sharePhoto(compositeUri, mockPhoto);
    }
  } catch (error) {
    console.error(`Erreur lors de l'action ${action} sur template:`, error);
    
    // Fallback: traiter comme session normale
    if (action === 'save') {
      return await saveSessionPhotos(sessionPhotos, silent);
    } else {
      return await shareSessionPhotos(sessionPhotos);
    }
  }
};
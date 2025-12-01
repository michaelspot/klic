import React, { useState, useEffect } from "react";
import { View, useColorScheme, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import { GLView } from "expo-gl";
import { savePermanentTemplate } from "../../utils/permanentStorage";
import { useTranslation } from "../../hooks/useTranslation";
import Header from "../../components/template-creator/Header";
import InitialView from "../../components/template-creator/InitialView";
import EditorView from "../../components/template-creator/EditorView";

function useTemplateEditor() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id, mode } = useLocalSearchParams(); // Récupérer l'ID et le mode depuis les paramètres
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState(null);
  const [originalTemplateId, setOriginalTemplateId] = useState(null);
  const [autoDetectedSlots, setAutoDetectedSlots] = useState(null); // Slots originaux détectés automatiquement
  const [slotExpansion, setSlotExpansion] = useState(0); // Expansion en pixels (0-10)

  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Fonction pour nettoyer les données temporaires
  const cleanupTemporaryData = async () => {
    try {
      await AsyncStorage.removeItem("thismoment_current_template_project");
      console.log("Données temporaires du projet template nettoyées");
    } catch (error) {
      console.error("Erreur lors du nettoyage des données temporaires:", error);
    }
  };

  // Charger le projet de template basé sur l'ID
  useEffect(() => {
    const loadTemplateProject = async () => {
      try {
        console.log(
          "Chargement du projet template avec ID:",
          id,
          "Mode:",
          mode,
        );

        // Charger le projet de template depuis AsyncStorage
        const projectData = await AsyncStorage.getItem(
          "thismoment_current_template_project",
        );

        if (projectData) {
          const project = JSON.parse(projectData);
          console.log("Projet chargé:", project);

          // Vérifier que l'ID correspond
          if (project.id !== id) {
            console.warn(
              "ID du projet ne correspond pas:",
              project.id,
              "vs",
              id,
            );
            Alert.alert(t('error'), t('templateProjectNotFound'));
            router.back();
            return;
          }

          // Configurer l'état basé sur le projet
          setCurrentTemplateId(project.id);
          setIsEditMode(project.mode === "edit");
          setOriginalTemplateId(project.originalTemplateId || project.id);

          // Charger les données du projet
          setTemplateName(project.templateName || "");
          setSlots(project.slots || []);
          setSelectedSlot(project.selectedSlot || null);

          // Charger l'image de fond
          if (project.backgroundImage) {
            const bgImage = project.backgroundImage;
            if (typeof bgImage === "string") {
              setBackgroundImage(bgImage);
              setImageDimensions({ width: 400, height: 600 }); // Dimensions par défaut
            } else if (bgImage.uri) {
              setBackgroundImage(bgImage.uri);
              setImageDimensions({
                width: bgImage.width || 400,
                height: bgImage.height || 600,
              });
            }
          }

          console.log("Projet template chargé avec succès:", {
            id: project.id,
            mode: project.mode,
            templateName: project.templateName,
            slotsCount: (project.slots || []).length,
          });
        } else {
          console.error("Aucun projet de template trouvé");
          Alert.alert(t('error'), t('templateProjectNotFound'));
          router.back();
        }
      } catch (error) {
        console.error("Erreur lors du chargement du projet template:", error);
        Alert.alert(t('error'), t('unableToLoadTemplateProject'));
        router.back();
      }
    };

    // Charger seulement si on a un ID
    if (id) {
      loadTemplateProject();
    } else {
      console.error("Aucun ID de template fourni");
      Alert.alert(t('error'), t('noTemplateSpecified'));
      router.back();
    }
  }, [id, mode]);

  // Effet de nettoyage au démontage du composant
  useEffect(() => {
    return () => {
      const timeoutId = setTimeout(() => {
        cleanupTemporaryData();
      }, 100);

      return () => clearTimeout(timeoutId);
    };
  }, []);

  const selectBackgroundImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t('permissionRequired'),
          t('permissionRequiredGallery'),
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setBackgroundImage(asset.uri);
        setImageDimensions({ width: asset.width, height: asset.height });

        // En mode création, remettre les slots à zéro avec la nouvelle image
        if (!isEditMode) {
          setSlots([]);
          setSelectedSlot(null);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error);
    }
  };

  const addSlotAtCenter = () => {
    if (!backgroundImage) return;

    handleHapticFeedback();
    const centerX = 0.5;
    const centerY = 0.5;

    const newSlot = {
      id: Date.now(),
      topLeft: { x: Math.max(0, centerX - 0.1), y: Math.max(0, centerY - 0.1) },
      topRight: {
        x: Math.min(1, centerX + 0.1),
        y: Math.max(0, centerY - 0.1),
      },
      bottomLeft: {
        x: Math.max(0, centerX - 0.1),
        y: Math.min(1, centerY + 0.1),
      },
      bottomRight: {
        x: Math.min(1, centerX + 0.1),
        y: Math.min(1, centerY + 0.1),
      },
      number: slots.length + 1,
    };

    setSlots([...slots, newSlot]);
    setSelectedSlot(newSlot.id);
  };

  const updateSlotCorner = (slotId, corner, newX, newY, imageLayout) => {
    const relativeX = Math.max(
      0,
      Math.min(1, (newX - imageLayout.x) / imageLayout.width),
    );
    const relativeY = Math.max(
      0,
      Math.min(1, (newY - imageLayout.y) / imageLayout.height),
    );

    setSlots(
      slots.map((slot) => {
        if (slot.id === slotId) {
          return { ...slot, [corner]: { x: relativeX, y: relativeY } };
        }
        return slot;
      }),
    );
  };

  const moveSlot = (slotId, deltaX, deltaY, imageLayout) => {
    const deltaRelativeX = deltaX / imageLayout.width;
    const deltaRelativeY = deltaY / imageLayout.height;

    setSlots(
      slots.map((slot) => {
        if (slot.id === slotId) {
          const newSlot = { ...slot };
          ["topLeft", "topRight", "bottomLeft", "bottomRight"].forEach(
            (corner) => {
              newSlot[corner] = {
                x: Math.max(0, Math.min(1, slot[corner].x + deltaRelativeX)),
                y: Math.max(0, Math.min(1, slot[corner].y + deltaRelativeY)),
              };
            },
          );
          return newSlot;
        }
        return slot;
      }),
    );
  };

  const deleteSlot = (slotId) => {
    handleHapticFeedback();
    const updatedSlots = slots
      .filter((slot) => slot.id !== slotId)
      .map((slot, index) => ({ ...slot, number: index + 1 }));
    setSlots(updatedSlots);
    setSelectedSlot(null);
  };

  const generateSlotsFromColors = async () => {
    if (!backgroundImage) {
      Alert.alert(t('error'), t('selectBackgroundImageFirst'));
      return;
    }

    handleHapticFeedback();

    try {
      // Manipuler l'image pour obtenir une version réduite
      const manipResult = await ImageManipulator.manipulateAsync(
        backgroundImage,
        [{ resize: { width: 400 } }], // Réduire pour accélérer le traitement
        { format: ImageManipulator.SaveFormat.PNG }
      );

      console.log("Image manipulée:", manipResult);

      // Utiliser expo-gl pour lire les pixels
      const detectedSlots = await detectColorZonesWithGL(manipResult.uri, manipResult.width, manipResult.height);

      if (detectedSlots.length === 0) {
        Alert.alert(
          t('noSlotDetected'),
          t('noSlotDetectedMessage')
        );
        return;
      }

      setSlots(detectedSlots);
      setAutoDetectedSlots(detectedSlots); // Sauvegarder les slots originaux
      setSlotExpansion(0); // Réinitialiser l'expansion
      setSelectedSlot(null);
      Alert.alert(t('success'), `${detectedSlots.length} ${t('slotsDetected')}`);
    } catch (error) {
      console.error("Erreur lors de la génération des slots:", error);
      Alert.alert(t('error'), t('unableToAnalyzeImage') + ": " + error.message);
    }
  };

  // Fonction pour détecter les zones de couleurs dans l'image avec expo-gl
  const detectColorZonesWithGL = async (imageUri, imgWidth, imgHeight) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Créer un GLView invisible pour lire les pixels
        const gl = await new Promise((resolveGL, rejectGL) => {
          const glView = GLView.createContextAsync();
          glView.then(resolveGL).catch(rejectGL);
        });

        // Charger l'image en tant que texture
        const asset = Asset.fromURI(imageUri);
        await asset.downloadAsync();
        
        // Créer une texture
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // Charger l'image dans la texture
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          asset
        );

        // Créer un framebuffer pour lire les pixels
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          texture,
          0
        );

        // Lire les pixels
        const pixels = new Uint8Array(imgWidth * imgHeight * 4);
        gl.readPixels(0, 0, imgWidth, imgHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        console.log(`Pixels lus: ${pixels.length} bytes pour ${imgWidth}x${imgHeight}`);

        // Couleurs de slots à détecter (#00ff01, #00ff02, etc.)
        const slotColors = [];
        for (let i = 1; i <= 20; i++) {
          const hex = `#00ff${i.toString().padStart(2, '0')}`;
          slotColors.push({
            number: i,
            hex,
            rgb: hexToRgb(hex)
          });
        }

        const detectedZones = [];

        // Pour chaque couleur de slot
        for (const slotColor of slotColors) {
          const points = [];
          const uniqueColors = new Set(); // Pour voir les couleurs réellement détectées
          
          // Parcourir les pixels pour trouver ceux qui correspondent à cette couleur
          for (let y = 0; y < imgHeight; y++) {
            for (let x = 0; x < imgWidth; x++) {
              const pixelIndex = (y * imgWidth + x) * 4;
              const r = pixels[pixelIndex];
              const g = pixels[pixelIndex + 1];
              const b = pixels[pixelIndex + 2];
              
              // Vérifier si le pixel correspond à la couleur du slot (avec tolérance)
              if (colorsMatch(r, g, b, slotColor.rgb)) {
                points.push({ x, y });
                // Enregistrer cette couleur pour debug
                if (uniqueColors.size < 5) { // Limiter à 5 pour ne pas surcharger
                  uniqueColors.add(`RGB(${r},${g},${b})`);
                }
              }
            }
          }

          // Tentative de création d'un slot pour cette couleur
          if (points.length > 0) {
            console.log(`\n🎨 Analyse slot ${slotColor.number} (${slotColor.hex} = RGB(${slotColor.rgb.r},${slotColor.rgb.g},${slotColor.rgb.b}))`);
            console.log(`  ${points.length} pixels de cette couleur exacte trouvés`);
            console.log(`  Couleurs RGB réellement détectées:`, Array.from(uniqueColors).join(', '));
            
            // Trouver les 4 coins du quadrilatère et valider
            const corners = findExtremPoints(points, imgWidth, imgHeight, pixels, slotColor.rgb);
            
            // IMPORTANT : Un slot n'est créé QUE si les 4 coins ont EXACTEMENT la couleur cible
            if (corners) {
              const slotData = {
                id: Date.now() + slotColor.number * 1000,
                ...corners,
                number: slotColor.number
              };
              console.log(`  ✅ SLOT ${slotColor.number} CRÉÉ AVEC SUCCÈS`);
              detectedZones.push(slotData);
            } else {
              console.log(`  ❌ SLOT ${slotColor.number} NON CRÉÉ - Validation des coins échouée`);
            }
          }
        }

        // Nettoyer
        gl.deleteTexture(texture);
        gl.deleteFramebuffer(framebuffer);

        resolve(detectedZones.sort((a, b) => a.number - b.number));
      } catch (error) {
        console.error("Erreur dans detectColorZonesWithGL:", error);
        reject(error);
      }
    });
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const colorsMatch = (r, g, b, targetRgb) => {
    // Correspondance EXACTE uniquement - pas de tolérance
    // Car #00ff01, #00ff02, etc. sont très proches (diffèrent de seulement 1 unité)
    return (
      r === targetRgb.r &&
      g === targetRgb.g &&
      b === targetRgb.b
    );
  };

  const findExtremPoints = (points, imgWidth, imgHeight, pixels, targetRgb) => {
    if (points.length === 0) {
      console.log(`  ❌ Aucun point trouvé, slot non créé`);
      return null;
    }

    console.log(`  🔍 Détection des zones connectées (Connected Components)...`);

    // Fonction pour vérifier si un pixel a EXACTEMENT la couleur cible
    const hasExactColor = (x, y) => {
      const pixelIndex = (y * imgWidth + x) * 4;
      const r = pixels[pixelIndex];
      const g = pixels[pixelIndex + 1];
      const b = pixels[pixelIndex + 2];
      return r === targetRgb.r && g === targetRgb.g && b === targetRgb.b;
    };

    // Créer une map des pixels pour recherche rapide
    const pixelMap = new Set(points.map(p => `${p.x},${p.y}`));
    const visited = new Set();
    const components = [];

    // Fonction BFS pour trouver une zone connectée
    const findConnectedComponent = (startX, startY) => {
      const component = [];
      const queue = [[startX, startY]];
      const key = `${startX},${startY}`;
      visited.add(key);

      while (queue.length > 0) {
        const [x, y] = queue.shift();
        component.push({ x, y });

        // Vérifier les 8 voisins (connexité-8)
        const neighbors = [
          [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
          [x - 1, y],                 [x + 1, y],
          [x - 1, y + 1], [x, y + 1], [x + 1, y + 1]
        ];

        for (const [nx, ny] of neighbors) {
          const nKey = `${nx},${ny}`;
          if (!visited.has(nKey) && pixelMap.has(nKey) && hasExactColor(nx, ny)) {
            visited.add(nKey);
            queue.push([nx, ny]);
          }
        }
      }

      return component;
    };

    // Trouver toutes les zones connectées
    for (const point of points) {
      const key = `${point.x},${point.y}`;
      if (!visited.has(key) && hasExactColor(point.x, point.y)) {
        const component = findConnectedComponent(point.x, point.y);
        components.push(component);
      }
    }

    console.log(`  📊 ${components.length} zone(s) connectée(s) trouvée(s)`);
    components.forEach((comp, i) => {
      console.log(`    Zone ${i + 1}: ${comp.length} pixels`);
    });

    // Trouver la plus grande zone connectée
    if (components.length === 0) {
      console.log(`  ❌ Aucune zone connectée trouvée`);
      return null;
    }

    const largestComponent = components.reduce((max, comp) => 
      comp.length > max.length ? comp : max
    );

    console.log(`  ✅ Plus grande zone sélectionnée: ${largestComponent.length} pixels`);

    // Trouver les 4 coins extrêmes de la plus grande zone
    let topLeft = null, topRight = null, bottomLeft = null, bottomRight = null;

    // TopLeft : x + y minimal
    for (const p of largestComponent) {
      if (!topLeft || (p.x + p.y < topLeft.x + topLeft.y)) {
        topLeft = p;
      }
    }

    // TopRight : x - y maximal
    for (const p of largestComponent) {
      if (!topRight || (p.x - p.y > topRight.x - topRight.y)) {
        topRight = p;
      }
    }

    // BottomLeft : y - x maximal
    for (const p of largestComponent) {
      if (!bottomLeft || (p.y - p.x > bottomLeft.y - bottomLeft.x)) {
        bottomLeft = p;
      }
    }

    // BottomRight : x + y maximal
    for (const p of largestComponent) {
      if (!bottomRight || (p.x + p.y > bottomRight.x + bottomRight.y)) {
        bottomRight = p;
      }
    }

    console.log(`  📍 Coins du quadrilatère:`);
    console.log(`    topLeft: (${topLeft.x},${topLeft.y})`);
    console.log(`    topRight: (${topRight.x},${topRight.y})`);
    console.log(`    bottomLeft: (${bottomLeft.x},${bottomLeft.y})`);
    console.log(`    bottomRight: (${bottomRight.x},${bottomRight.y})`);

    // Vérifier que les 4 coins ont la couleur exacte
    const allValid = hasExactColor(topLeft.x, topLeft.y) &&
                     hasExactColor(topRight.x, topRight.y) &&
                     hasExactColor(bottomLeft.x, bottomLeft.y) &&
                     hasExactColor(bottomRight.x, bottomRight.y);

    if (!allValid) {
      console.log(`  ❌ Les 4 coins n'ont pas tous la couleur exacte`);
      return null;
    }

    // Calculer l'aire approximative
    const width = Math.max(topRight.x - topLeft.x, bottomRight.x - bottomLeft.x);
    const height = Math.max(bottomLeft.y - topLeft.y, bottomRight.y - topRight.y);
    const area = width * height;
    
    console.log(`  ✅ Quadrilatère valide: ~${width}x${height} pixels (aire: ~${area})`);

    // Convertir en coordonnées relatives (0-1)
    const corners = {
      topLeft: { x: topLeft.x / imgWidth, y: topLeft.y / imgHeight },
      topRight: { x: topRight.x / imgWidth, y: topRight.y / imgHeight },
      bottomLeft: { x: bottomLeft.x / imgWidth, y: bottomLeft.y / imgHeight },
      bottomRight: { x: bottomRight.x / imgWidth, y: bottomRight.y / imgHeight }
    };

    return corners;
  };

  // Fonction pour appliquer l'expansion aux slots auto-détectés
  const applySlotExpansion = (expansionPixels) => {
    if (!autoDetectedSlots || autoDetectedSlots.length === 0) return;

    const expandedSlots = autoDetectedSlots.map(slot => {
      // Convertir l'expansion en pixels en coordonnées relatives
      // L'expansion se fait de manière égale de tous les côtés
      const expansionX = expansionPixels / imageDimensions.width;
      const expansionY = expansionPixels / imageDimensions.height;

      return {
        ...slot,
        // Chaque coin recule/avance de la même distance dans toutes les directions
        topLeft: {
          x: Math.max(0, slot.topLeft.x - expansionX),
          y: Math.max(0, slot.topLeft.y - expansionY)
        },
        topRight: {
          x: Math.min(1, slot.topRight.x + expansionX),
          y: Math.max(0, slot.topRight.y - expansionY)
        },
        bottomLeft: {
          x: Math.max(0, slot.bottomLeft.x - expansionX),
          y: Math.min(1, slot.bottomLeft.y + expansionY)
        },
        bottomRight: {
          x: Math.min(1, slot.bottomRight.x + expansionX),
          y: Math.min(1, slot.bottomRight.y + expansionY)
        }
      };
    });

    setSlots(expandedSlots);
  };

  // Appliquer l'expansion quand elle change
  useEffect(() => {
    if (autoDetectedSlots) {
      applySlotExpansion(slotExpansion);
    }
  }, [slotExpansion]);

  const saveTemplate = async () => {
    if (!backgroundImage || slots.length === 0 || !templateName.trim()) {
      Alert.alert(
        t('templateIncomplete'),
        t('templateIncompleteMessage'),
      );
      return;
    }

    try {
      // Utiliser l'ID original pour les modifications, ou créer un nouvel ID pour les créations
      const finalTemplateId = isEditMode
        ? originalTemplateId
        : `custom-${Date.now()}`;

      const templateData = {
        id: finalTemplateId,
        name: templateName.trim(),
        backgroundImage: backgroundImage,
        slots,
        photoCount: slots.length,
        isCustom: true,
        createdAt: isEditMode
          ? new Date().toISOString() // En mode édition, une nouvelle date de modification
          : new Date().toISOString(),
      };

      console.log("Sauvegarde du template:", {
        id: finalTemplateId,
        isEditMode,
        name: templateName.trim(),
        slotsCount: slots.length,
      });

      if (isEditMode) {
        // Mode édition : mettre à jour le template existant
        const existingTemplates = await AsyncStorage.getItem(
          "thismoment_custom_templates",
        );
        let templates = existingTemplates ? JSON.parse(existingTemplates) : [];

        const templateIndex = templates.findIndex(
          (t) => t.id === finalTemplateId,
        );
        if (templateIndex !== -1) {
          // Conserver la date de création originale
          templateData.createdAt = templates[templateIndex].createdAt;
          templates[templateIndex] = templateData;
        } else {
          // Si non trouvé, l'ajouter
          templates.push(templateData);
        }

        // Sauvegarder l'image de façon permanente et mettre à jour le template
        const savedTemplate = await savePermanentTemplate(templateData);
        if (templateIndex !== -1) {
          templates[templateIndex] = savedTemplate;
        }

        await AsyncStorage.setItem(
          "thismoment_custom_templates",
          JSON.stringify(templates),
        );
      } else {
        // Mode création : nouveau template
        await savePermanentTemplate(templateData);
      }

      // Nettoyer les données temporaires après sauvegarde réussie
      await cleanupTemporaryData();

      handleHapticFeedback();
      Alert.alert(
        isEditMode ? t('templateModified') : t('templateSaved'),
        `"${templateName}" ${isEditMode ? t('templateModifiedSuccess') : t('templateSavedSuccess')}`,
        [{ text: t('ok'), onPress: () => router.back() }],
      );
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      Alert.alert(t('error'), t('unableToSaveTemplate'));
    }
  };

  return {
    backgroundImage,
    templateName,
    setTemplateName,
    slots,
    selectedSlot,
    setSelectedSlot,
    imageDimensions,
    selectBackgroundImage,
    addSlotAtCenter,
    updateSlotCorner,
    moveSlot,
    deleteSlot,
    generateSlotsFromColors,
    saveTemplate,
    handleHapticFeedback,
    isEditMode,
    autoDetectedSlots,
    slotExpansion,
    setSlotExpansion,
  };
}

export default function TemplateCreator() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const {
    backgroundImage,
    templateName,
    setTemplateName,
    slots,
    selectedSlot,
    setSelectedSlot,
    imageDimensions,
    selectBackgroundImage,
    addSlotAtCenter,
    updateSlotCorner,
    moveSlot,
    deleteSlot,
    generateSlotsFromColors,
    saveTemplate,
    isEditMode,
    autoDetectedSlots,
    slotExpansion,
    setSlotExpansion,
  } = useTemplateEditor();

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }} />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Header
          onSave={saveTemplate}
          isDark={isDark}
          insets={insets}
          isEditMode={isEditMode}
        />

        {!backgroundImage ? (
          <InitialView
            templateName={templateName}
            setTemplateName={setTemplateName}
            onSelectImage={selectBackgroundImage}
            isDark={isDark}
            isEditMode={isEditMode}
          />
        ) : (
          <EditorView
            templateName={templateName}
            setTemplateName={setTemplateName}
            onAddSlot={addSlotAtCenter}
            onGenerateSlotsFromColors={generateSlotsFromColors}
            onChangeImage={selectBackgroundImage}
            isDark={isDark}
            backgroundImage={backgroundImage}
            imageDimensions={imageDimensions}
            slots={slots}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            onUpdateSlotCorner={updateSlotCorner}
            onMoveSlot={moveSlot}
            onDeleteSlot={deleteSlot}
            insets={insets}
            isEditMode={isEditMode}
            autoDetectedSlots={autoDetectedSlots}
            slotExpansion={slotExpansion}
            setSlotExpansion={setSlotExpansion}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

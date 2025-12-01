import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useTemplateEditor() {
  const router = useRouter();
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const selectBackgroundImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission requise",
          "Nous avons besoin de l'accès à votre galerie pour sélectionner une image."
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
        setSlots([]);
        setSelectedSlot(null);
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
      topRight: { x: Math.min(1, centerX + 0.1), y: Math.max(0, centerY - 0.1) },
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
      Math.min(1, (newX - imageLayout.x) / imageLayout.width)
    );
    const relativeY = Math.max(
      0,
      Math.min(1, (newY - imageLayout.y) / imageLayout.height)
    );

    setSlots(
      slots.map((slot) => {
        if (slot.id === slotId) {
          return { ...slot, [corner]: { x: relativeX, y: relativeY } };
        }
        return slot;
      })
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
            }
          );
          return newSlot;
        }
        return slot;
      })
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

  const saveTemplate = async () => {
    if (!backgroundImage || slots.length === 0 || !templateName.trim()) {
      Alert.alert(
        "Template incomplet",
        "Veuillez ajouter une image de fond, au moins un slot et donner un nom à votre template."
      );
      return;
    }

    try {
      const templateData = {
        id: `custom-${Date.now()}`,
        name: templateName.trim(),
        preview: backgroundImage,
        backgroundImage,
        slots,
        photoCount: slots.length,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      const existingTemplates = await AsyncStorage.getItem(
        "thismoment_custom_templates"
      );
      const templates = existingTemplates ? JSON.parse(existingTemplates) : [];
      templates.push(templateData);

      await AsyncStorage.setItem(
        "thismoment_custom_templates",
        JSON.stringify(templates)
      );

      handleHapticFeedback();
      Alert.alert(
        "Template sauvegardé",
        `Le template "${templateName}" a été créé avec succès !`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder le template.");
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
    saveTemplate,
    handleHapticFeedback,
  };
}
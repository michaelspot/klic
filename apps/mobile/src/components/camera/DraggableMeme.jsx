import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Move, X, Maximize2 } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";

export function DraggableMeme({
  meme,
  isSelected,
  onSelect,
  onUpdatePosition,
  onRemove,
  onHapticFeedback,
  cameraLayout,
}) {
  // Alias pour compatibilité avec le code existant
  const sticker = meme;
  // Constantes pour la colonne de contrôles
  const CONTROL_SIZE = 32;
  const CONTROL_SPACING = 8;
  const COLUMN_OFFSET = 12; // Espacement entre le sticker et la colonne

  const translateX = useSharedValue(sticker.x);
  const translateY = useSharedValue(sticker.y);
  const scale = useSharedValue(sticker.scale);
  const baseScale = useSharedValue(sticker.scale);

  // Sync with sticker props when they change
  useEffect(() => {
    translateX.value = sticker.x;
    translateY.value = sticker.y;
    scale.value = sticker.scale;
    baseScale.value = sticker.scale;
  }, [sticker.x, sticker.y, sticker.scale]);

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(onSelect)(sticker.id);
    runOnJS(onHapticFeedback)();
  });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(onSelect)(sticker.id);
      runOnJS(onHapticFeedback)();
    })
    .onUpdate((event) => {
      const newX = event.translationX + sticker.x;
      const newY = event.translationY + sticker.y;

      // Contraintes pour garder le sticker dans le cadre 4:3
      // Tenir compte de la taille visuelle réelle après redimensionnement
      const visualWidth = sticker.width * scale.value;
      const visualHeight = sticker.height * scale.value;

      // Le sticker se redimensionne depuis son centre, donc ajuster les contraintes
      const minX = (visualWidth - sticker.width) / 2;
      const maxX =
        cameraLayout.cameraWidth -
        sticker.width -
        (visualWidth - sticker.width) / 2;
      const minY = (visualHeight - sticker.height) / 2;
      const maxY =
        cameraLayout.cameraHeight -
        sticker.height -
        (visualHeight - sticker.height) / 2;

      const constrainedX = Math.max(minX, Math.min(maxX, newX));
      const constrainedY = Math.max(minY, Math.min(maxY, newY));

      translateX.value = constrainedX;
      translateY.value = constrainedY;
    })
    .onEnd(() => {
      runOnJS(onUpdatePosition)(
        sticker.id,
        translateX.value,
        translateY.value,
        scale.value,
      );
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      baseScale.value = scale.value;
      runOnJS(onSelect)(sticker.id);
      runOnJS(onHapticFeedback)();
    })
    .onUpdate((event) => {
      scale.value = Math.max(0.5, Math.min(3, baseScale.value * event.scale));
    })
    .onEnd(() => {
      runOnJS(onUpdatePosition)(
        sticker.id,
        translateX.value,
        translateY.value,
        scale.value,
      );
    });

  // Geste spécifique pour la molette de déplacement
  const moveHandlePanGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(onHapticFeedback)();
    })
    .onUpdate((event) => {
      const newX = event.translationX + sticker.x;
      const newY = event.translationY + sticker.y;

      // Contraintes pour garder le sticker dans le cadre 4:3
      // Tenir compte de la taille visuelle réelle après redimensionnement
      const visualWidth = sticker.width * scale.value;
      const visualHeight = sticker.height * scale.value;

      // Le sticker se redimensionne depuis son centre, donc ajuster les contraintes
      const minX = (visualWidth - sticker.width) / 2;
      const maxX =
        cameraLayout.cameraWidth -
        sticker.width -
        (visualWidth - sticker.width) / 2;
      const minY = (visualHeight - sticker.height) / 2;
      const maxY =
        cameraLayout.cameraHeight -
        sticker.height -
        (visualHeight - sticker.height) / 2;

      const constrainedX = Math.max(minX, Math.min(maxX, newX));
      const constrainedY = Math.max(minY, Math.min(maxY, newY));

      translateX.value = constrainedX;
      translateY.value = constrainedY;
    })
    .onEnd(() => {
      runOnJS(onUpdatePosition)(
        sticker.id,
        translateX.value,
        translateY.value,
        scale.value,
      );
    });

  // Geste spécifique pour la molette de redimensionnement
  const scaleHandlePanGesture = Gesture.Pan()
    .onStart(() => {
      baseScale.value = scale.value;
      runOnJS(onHapticFeedback)();
    })
    .onUpdate((event) => {
      // Utiliser la distance verticale pour le redimensionnement
      const scaleChange = -event.translationY * 0.01; // Multiplier par un facteur pour contrôler la sensibilité
      const newScale = Math.max(
        0.5,
        Math.min(3, baseScale.value + scaleChange),
      );
      scale.value = newScale;
    })
    .onEnd(() => {
      runOnJS(onUpdatePosition)(
        sticker.id,
        translateX.value,
        translateY.value,
        scale.value,
      );
    });

  const composedGesture = Gesture.Race(
    tapGesture,
    Gesture.Simultaneous(panGesture, pinchGesture),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Style pour les contrôles (position qui suit le coin haut droit du sticker)
  const controlsStyle = useAnimatedStyle(() => {
    // Le sticker est positionné par son coin supérieur gauche (translateX/Y)
    // et se scale depuis son centre
    // Calculer la position du bord droit visible après scaling
    const scaledWidth = sticker.width * scale.value;
    const scaledHeight = sticker.height * scale.value;
    
    // Position du centre du sticker
    const centerX = translateX.value + sticker.width / 2;
    const centerY = translateY.value + sticker.height / 2;
    
    // Position du bord droit après scaling (depuis le centre)
    const visualRightEdge = centerX + scaledWidth / 2;
    const visualTopEdge = centerY - scaledHeight / 2;

    return {
      position: 'absolute',
      left: visualRightEdge + COLUMN_OFFSET,
      top: visualTopEdge,
    };
  });

  const handleRemove = () => {
    onHapticFeedback();
    onRemove(sticker.id);
  };

  return (
    <>
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            {
              position: "absolute",
              width: sticker.width,
              height: sticker.height,
              zIndex: isSelected ? 1000 : 100,
            },
            animatedStyle,
          ]}
          pointerEvents="box-none"
        >
          <View
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 8,
              borderWidth: isSelected ? 2 : 0,
              borderColor: "#FF6B6B",
              borderStyle: "dashed",
            }}
            pointerEvents="auto"
          >
            <Image
              source={{ uri: sticker.url }}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              transition={200}
              cachePolicy="memory-disk"
              // Memes statiques uniquement (pas d'autoplay)
            />
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Colonne de contrôles positionnée à droite du sticker */}
      {isSelected && (
        <Animated.View
          style={[
            {
              position: "absolute",
              zIndex: 1001,
            },
            controlsStyle,
          ]}
          pointerEvents="box-none"
        >
          {/* Bouton de suppression - en haut de la colonne */}
          <TouchableOpacity
            onPress={handleRemove}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: CONTROL_SIZE,
              height: CONTROL_SIZE,
              borderRadius: CONTROL_SIZE / 2,
              backgroundColor: "rgba(255, 68, 68, 0.95)",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              borderWidth: 2,
              borderColor: "#FF4444",
            }}
            activeOpacity={0.7}
          >
            <X size={16} color="#fff" />
          </TouchableOpacity>

          {/* Molette de déplacement - au milieu de la colonne */}
          <GestureDetector gesture={moveHandlePanGesture}>
            <Animated.View
              style={{
                position: "absolute",
                top: CONTROL_SIZE + CONTROL_SPACING,
                left: 0,
                width: CONTROL_SIZE,
                height: CONTROL_SIZE,
                borderRadius: CONTROL_SIZE / 2,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
                borderWidth: 2,
                borderColor: "#FF6B6B",
              }}
              pointerEvents="auto"
            >
              <Move size={16} color="#FF6B6B" />
            </Animated.View>
          </GestureDetector>

          {/* Molette de redimensionnement - en bas de la colonne */}
          <GestureDetector gesture={scaleHandlePanGesture}>
            <Animated.View
              style={{
                position: "absolute",
                top: (CONTROL_SIZE + CONTROL_SPACING) * 2,
                left: 0,
                width: CONTROL_SIZE,
                height: CONTROL_SIZE,
                borderRadius: CONTROL_SIZE / 2,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
                borderWidth: 2,
                borderColor: "#4F46E5",
              }}
              pointerEvents="auto"
            >
              <Maximize2 size={16} color="#4F46E5" />
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      )}
    </>
  );
}

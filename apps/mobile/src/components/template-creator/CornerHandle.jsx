import React from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const handleHapticFeedback = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export default function CornerHandle({
  slotId,
  corner,
  position,
  imageLayout,
  onUpdateCorner,
  cornerOffsets, // Shared values passées depuis SlotOverlay
  onDragUpdate, // Callback pour mettre à jour les shared values du parent
  onDragEnd, // Callback pour la fin du drag
}) {
  // Seulement l'animation de scale reste locale au handle
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(handleHapticFeedback)();
      scale.value = withTiming(1.2, { duration: 100 });
    })
    .onUpdate((event) => {
      // Utiliser le callback pour mettre à jour les shared values du parent
      // Cela garantit que le polygone et le handle utilisent exactement les mêmes valeurs
      if (onDragUpdate) {
        runOnJS(onDragUpdate)(event.translationX, event.translationY);
      }
    })
    .onEnd((event) => {
      const newAbsoluteX =
        imageLayout.x + position.x * imageLayout.width + event.translationX;
      const newAbsoluteY =
        imageLayout.y + position.y * imageLayout.height + event.translationY;

      runOnJS(onUpdateCorner)(slotId, corner, newAbsoluteX, newAbsoluteY);

      // Appeler le callback de fin qui réinitialise les animations temporaires
      if (onDragEnd) {
        runOnJS(onDragEnd)();
      }

      scale.value = withTiming(1, { duration: 150 });
    });

  // Style animé qui utilise les shared values du parent pour les translations
  // et la valeur locale pour le scale
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cornerOffsets ? cornerOffsets.x.value : 0 },
      { translateY: cornerOffsets ? cornerOffsets.y.value : 0 },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          {
            position: "absolute",
            left: position.x * imageLayout.width - 12,
            top: position.y * imageLayout.height - 12,
            width: 24,
            height: 24,
            backgroundColor: "#007AFF",
            borderRadius: 12,
            borderWidth: 3,
            borderColor: "#fff",
            zIndex: 4000,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 10,
          },
          animatedStyle,
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      />
    </GestureDetector>
  );
}

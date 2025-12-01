import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withTiming,
  useAnimatedProps,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Trash2, Move } from "lucide-react-native";
import Svg, { Polygon } from "react-native-svg";
import CornerHandle from "./CornerHandle";

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

const handleHapticFeedback = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export default function SlotOverlay({
  slot,
  imageLayout,
  isSelected,
  onSelect,
  onMove,
  onUpdateCorner,
  onDelete,
}) {
  const CONTROL_SIZE = 32;
  const CONTROL_SPACING = 8;
  const CONTROL_OFFSET = 12;

  // Valeurs animées partagées pour le déplacement global du slot
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Valeurs animées PARTAGÉES pour les déplacements temporaires des corners
  // Ces valeurs seront utilisées à la fois par les handles ET par le polygone
  const cornerOffsets = {
    topLeft: { x: useSharedValue(0), y: useSharedValue(0) },
    topRight: { x: useSharedValue(0), y: useSharedValue(0) },
    bottomLeft: { x: useSharedValue(0), y: useSharedValue(0) },
    bottomRight: { x: useSharedValue(0), y: useSharedValue(0) },
  };

  // Geste pour sélectionner le slot (tap simple)
  const tapGesture = Gesture.Tap()
    .maxDistance(10) // Distance maximale pour considérer comme un tap
    .onEnd(() => {
      runOnJS(onSelect)(slot.id);
      runOnJS(handleHapticFeedback)();
    });

  // Geste pour déplacer tout le slot (pan avec seuil)
  const panGesture = Gesture.Pan()
    .minDistance(15) // Distance minimale pour déclencher le pan
    .onStart(() => {
      runOnJS(handleHapticFeedback)();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      // Appliquer le déplacement définitivement à tous les corners
      runOnJS(onMove)(slot.id, translateX.value, translateY.value);
      translateX.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(0, { duration: 150 });
    });

  // Geste combiné - tap a priorité sur pan
  const combinedGesture = Gesture.Exclusive(tapGesture, panGesture);

  // Style animé pour le déplacement global
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // Callbacks SYNCHRONISÉS pour gérer les déplacements des corners
  const handleCornerDragUpdate = (corner, deltaX, deltaY) => {
    // Mettre à jour directement les shared values partagées
    cornerOffsets[corner].x.value = deltaX;
    cornerOffsets[corner].y.value = deltaY;
  };

  const handleCornerDragEnd = (corner) => {
    // IMPORTANT: Attendre que React ait mis à jour le state du slot
    // avant de remettre les offsets à zéro pour éviter la désynchronisation
    setTimeout(() => {
      cornerOffsets[corner].x.value = withTiming(0, { duration: 150 });
      cornerOffsets[corner].y.value = withTiming(0, { duration: 150 });
    }, 50); // Petit délai pour laisser le temps au state de se mettre à jour
  };

  // Props animés pour le polygone SVG - PARFAITEMENT synchronisés avec les handles
  const animatedPolygonProps = useAnimatedProps(() => {
    const points = [
      {
        x: slot.topLeft.x * imageLayout.width + cornerOffsets.topLeft.x.value,
        y: slot.topLeft.y * imageLayout.height + cornerOffsets.topLeft.y.value,
      },
      {
        x: slot.topRight.x * imageLayout.width + cornerOffsets.topRight.x.value,
        y:
          slot.topRight.y * imageLayout.height + cornerOffsets.topRight.y.value,
      },
      {
        x:
          slot.bottomRight.x * imageLayout.width +
          cornerOffsets.bottomRight.x.value,
        y:
          slot.bottomRight.y * imageLayout.height +
          cornerOffsets.bottomRight.y.value,
      },
      {
        x:
          slot.bottomLeft.x * imageLayout.width +
          cornerOffsets.bottomLeft.x.value,
        y:
          slot.bottomLeft.y * imageLayout.height +
          cornerOffsets.bottomLeft.y.value,
      },
    ];

    return {
      points: points.map((p) => `${p.x},${p.y}`).join(" "),
    };
  });

  // Calcul du centre du slot en temps réel pour le numéro
  const centerX =
    (slot.topLeft.x +
      slot.topRight.x +
      slot.bottomLeft.x +
      slot.bottomRight.x) /
    4;
  const centerY =
    (slot.topLeft.y +
      slot.topRight.y +
      slot.bottomLeft.y +
      slot.bottomRight.y) /
    4;

  // Calcul des points du quadrilatère en coordonnées absolues pour la zone tactile
  const quadPoints = [
    {
      x: slot.topLeft.x * imageLayout.width,
      y: slot.topLeft.y * imageLayout.height,
    },
    {
      x: slot.topRight.x * imageLayout.width,
      y: slot.topRight.y * imageLayout.height,
    },
    {
      x: slot.bottomRight.x * imageLayout.width,
      y: slot.bottomRight.y * imageLayout.height,
    },
    {
      x: slot.bottomLeft.x * imageLayout.width,
      y: slot.bottomLeft.y * imageLayout.height,
    },
  ];

  // Calcul des limites pour positionner les contrôles à droite du slot
  const boundingBox = {
    left: Math.min(...quadPoints.map((p) => p.x)),
    top: Math.min(...quadPoints.map((p) => p.y)),
    right: Math.max(...quadPoints.map((p) => p.x)),
    bottom: Math.max(...quadPoints.map((p) => p.y)),
  };

  // Style animé pour la zone tactile qui suit les transformations
  const touchAreaStyle = useAnimatedStyle(() => {
    return {
      left: boundingBox.left + translateX.value,
      top: boundingBox.top + translateY.value,
      width: boundingBox.right - boundingBox.left,
      height: boundingBox.bottom - boundingBox.top,
    };
  });

  // Style animé pour les contrôles - maintenant ils suivent le déplacement du slot
  const controlsStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      left: boundingBox.right + CONTROL_OFFSET + translateX.value,
      top: boundingBox.top + translateY.value,
      zIndex: 2000,
    };
  });

  const handleRemove = () => {
    console.log("Delete button pressed for slot:", slot.id);
    handleHapticFeedback();
    onDelete(slot.id);
  };

  return (
    <>
      {/* Container principal pour le slot */}
      <View
        style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
      >
        {/* SVG pour dessiner le quadrilatère exact - maintenant parfaitement synchronisé */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              top: 0,
              width: imageLayout.width,
              height: imageLayout.height,
              zIndex: isSelected ? 1000 : 100,
            },
            animatedStyle,
          ]}
          pointerEvents="none"
        >
          <Svg width={imageLayout.width} height={imageLayout.height}>
            <AnimatedPolygon
              animatedProps={animatedPolygonProps}
              fill={
                isSelected ? "rgba(0, 122, 255, 0.3)" : "rgba(0, 122, 255, 0.2)"
              }
              stroke={isSelected ? "#007AFF" : "#fff"}
              strokeWidth="2"
              strokeDasharray="8,4"
            />
          </Svg>
        </Animated.View>

        {/* Zone tactile pour la sélection et le déplacement */}
        <GestureDetector gesture={combinedGesture}>
          <Animated.View
            style={[
              {
                position: "absolute",
                backgroundColor: "transparent",
                zIndex: isSelected ? 1001 : 101,
              },
              touchAreaStyle,
            ]}
            pointerEvents="auto"
          />
        </GestureDetector>

        {/* Numéro du slot au centre - maintenant il suit le déplacement */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: centerX * imageLayout.width - 15,
              top: centerY * imageLayout.height - 15,
              width: 30,
              height: 30,
              backgroundColor: isSelected
                ? "#007AFF"
                : "rgba(0, 122, 255, 0.8)",
              borderRadius: 15,
              alignItems: "center",
              justifyContent: "center",
              zIndex: isSelected ? 1002 : 999,
              borderWidth: 2,
              borderColor: "#fff",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            },
            animatedStyle,
          ]}
          pointerEvents="none"
        >
          <Text
            style={{
              color: "#fff",
              fontFamily: "Inter_700Bold",
              fontSize: 14,
            }}
          >
            {slot.number}
          </Text>
        </Animated.View>

        {/* Handles des coins - maintenant PARFAITEMENT synchronisés */}
        {isSelected && (
          <Animated.View style={[animatedStyle, { zIndex: 3000 }]}>
            <CornerHandle
              slotId={slot.id}
              corner="topLeft"
              position={slot.topLeft}
              imageLayout={imageLayout}
              onUpdateCorner={onUpdateCorner}
              cornerOffsets={cornerOffsets.topLeft} // Passer les shared values directement
              onDragUpdate={(deltaX, deltaY) =>
                handleCornerDragUpdate("topLeft", deltaX, deltaY)
              }
              onDragEnd={() => handleCornerDragEnd("topLeft")}
            />
            <CornerHandle
              slotId={slot.id}
              corner="topRight"
              position={slot.topRight}
              imageLayout={imageLayout}
              onUpdateCorner={onUpdateCorner}
              cornerOffsets={cornerOffsets.topRight}
              onDragUpdate={(deltaX, deltaY) =>
                handleCornerDragUpdate("topRight", deltaX, deltaY)
              }
              onDragEnd={() => handleCornerDragEnd("topRight")}
            />
            <CornerHandle
              slotId={slot.id}
              corner="bottomLeft"
              position={slot.bottomLeft}
              imageLayout={imageLayout}
              onUpdateCorner={onUpdateCorner}
              cornerOffsets={cornerOffsets.bottomLeft}
              onDragUpdate={(deltaX, deltaY) =>
                handleCornerDragUpdate("bottomLeft", deltaX, deltaY)
              }
              onDragEnd={() => handleCornerDragEnd("bottomLeft")}
            />
            <CornerHandle
              slotId={slot.id}
              corner="bottomRight"
              position={slot.bottomRight}
              imageLayout={imageLayout}
              onUpdateCorner={onUpdateCorner}
              cornerOffsets={cornerOffsets.bottomRight}
              onDragUpdate={(deltaX, deltaY) =>
                handleCornerDragUpdate("bottomRight", deltaX, deltaY)
              }
              onDragEnd={() => handleCornerDragEnd("bottomRight")}
            />
          </Animated.View>
        )}

        {/* Contrôles (supprimer et déplacer) - maintenant attachés et suivent le slot */}
        {isSelected && (
          <Animated.View style={controlsStyle} pointerEvents="auto">
            <TouchableOpacity
              onPress={handleRemove}
              style={{
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
                elevation: 8,
                borderWidth: 2,
                borderColor: "#FF4444",
                marginBottom: CONTROL_SPACING,
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={16} color="#fff" />
            </TouchableOpacity>

            {/* Bouton d'info pour le déplacement */}
            <View
              style={{
                width: CONTROL_SIZE,
                height: CONTROL_SIZE,
                borderRadius: CONTROL_SIZE / 2,
                backgroundColor: "rgba(0, 122, 255, 0.9)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "#007AFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 8,
              }}
            >
              <Move size={16} color="#fff" />
            </View>
          </Animated.View>
        )}
      </View>
    </>
  );
}

import React, { useState } from "react";
import {
  View,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback,
} from "react-native";
import { Image } from "expo-image";
import SlotOverlay from "./SlotOverlay";
import * as Haptics from "expo-haptics";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function ImageContainer({
  backgroundImage,
  imageDimensions,
  slots,
  selectedSlot,
  setSelectedSlot,
  onUpdateSlotCorner,
  onMoveSlot,
  onDeleteSlot,
  isDark,
  insets,
}) {
  const [imageLayout, setImageLayout] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });

  const getDisplayDimensions = () => {
    const containerWidth = screenWidth - 48;
    const maxContainerHeight = screenHeight - insets.top - insets.bottom - 200;

    if (!imageDimensions.width || !imageDimensions.height) {
      return { width: containerWidth, height: maxContainerHeight };
    }

    const imageAspectRatio = imageDimensions.width / imageDimensions.height;
    let displayWidth = containerWidth;
    let displayHeight = containerWidth / imageAspectRatio;
    const actualContainerHeight = Math.min(displayHeight, maxContainerHeight);

    return {
      width: displayWidth,
      height: displayHeight,
      containerHeight: actualContainerHeight,
    };
  };

  const displayDimensions = getDisplayDimensions();
  const canScrollVertically =
    displayDimensions.height > displayDimensions.containerHeight;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) =>
      canScrollVertically && Math.abs(gestureState.dy) > 5,
    onPanResponderMove: (evt, gestureState) => {
      if (canScrollVertically) {
        const maxOffset =
          displayDimensions.height - displayDimensions.containerHeight;
        const newY = Math.max(
          -maxOffset,
          Math.min(0, imageOffset.y + gestureState.dy),
        );
        setImageOffset({ x: 0, y: newY });
      }
    },
    onPanResponderRelease: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const handleBackgroundPress = (event) => {
    // Désélectionner uniquement si on clique sur le fond, pas sur un slot
    console.log("Background tapped, deselecting slot");
    setSelectedSlot(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: insets.bottom + 24,
        justifyContent: "flex-start",
      }}
    >
      <View
        style={{
          height: displayDimensions.containerHeight,
          backgroundColor: isDark ? "#1A1A1A" : "#F5F5F5",
          borderRadius: 12,
          overflow: "visible",
          position: "relative",
          alignSelf: "center",
          width: "100%",
          marginTop: 0,
        }}
        {...(canScrollVertically ? panResponder.panHandlers : {})}
      >
        {/* Couche de fond cliquable pour désélectionner */}
        <TouchableWithoutFeedback onPress={handleBackgroundPress}>
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
            pointerEvents="auto"
          />
        </TouchableWithoutFeedback>

        <View
          style={{
            position: "absolute",
            width: displayDimensions.width,
            height: displayDimensions.height,
            top: imageOffset.y,
            left: imageOffset.x,
            borderRadius: 12,
            overflow: "hidden",
            zIndex: 10,
          }}
          pointerEvents="none"
        >
          <Image
            source={{ uri: backgroundImage }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            onLoad={() => {
              setImageLayout({
                x: 0,
                y: 0,
                width: displayDimensions.width,
                height: displayDimensions.height,
              });
            }}
          />
        </View>

        {imageLayout.width > 0 &&
          slots.map((slot, index) => (
            <View
              key={slot.id}
              style={{
                position: "absolute",
                top: imageOffset.y,
                left: imageOffset.x,
                width: displayDimensions.width,
                height: displayDimensions.height,
                zIndex: 100 + index, // Ensure each slot has a unique z-index
              }}
            >
              <SlotOverlay
                slot={slot}
                imageLayout={imageLayout}
                isSelected={selectedSlot === slot.id}
                onSelect={(slotId) => {
                  console.log("Slot selected:", slotId);
                  setSelectedSlot(slotId);
                }}
                onMove={(slotId, deltaX, deltaY) =>
                  onMoveSlot(slotId, deltaX, deltaY, imageLayout)
                }
                onUpdateCorner={(slotId, corner, newX, newY) =>
                  onUpdateSlotCorner(slotId, corner, newX, newY, imageLayout)
                }
                onDelete={onDeleteSlot}
              />
            </View>
          ))}
      </View>
    </View>
  );
}

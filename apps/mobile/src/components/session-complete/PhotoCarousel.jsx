import React, { useState, useRef, useMemo, useCallback } from "react";
import { View, Text, Dimensions, FlatList, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { calculateCameraLayout } from "@/utils/cameraLayout";

const { width: screenWidth } = Dimensions.get("window");

// Calculer les dimensions pour l'affichage 4:3 en dehors du composant
const photoWidth = screenWidth - 48;
const photoHeight = photoWidth * (4 / 3);
const ITEM_WIDTH = photoWidth + 24; // width + marginRight

export const PhotoCarousel = React.memo(({ sessionPhotos, onActiveIndexChange }) => {
  const insets = useSafeAreaInsets();
  const cameraLayout = useMemo(() => calculateCameraLayout(insets), [insets]);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const renderPhoto = useCallback(({ item: photo, index }) => {
    return (
      <View style={[styles.photoContainer, { width: photoWidth }]}>
        <View style={{ width: photoWidth, height: photoHeight, borderRadius: 16, overflow: "hidden", backgroundColor: "#1A1A1A" }}>
          {/* Photo principale */}
          <Image
            source={{ uri: photo.uri }}
            style={{
              width: "100%",
              height: "100%",
              transform: photo.isComposite ? [] : [
                {
                  // Inverser la logique : ne pas retourner si miroir activé, sinon retourner
                  scaleX: photo.cameraSettings?.mirrorEnabled ? -1 : 1,
                },
              ],
            }}
            contentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
          />

          {/* Memes s'ils ne sont pas fusionnés */}
          {!photo.isComposite && photo.memes &&
            photo.memes.map((meme) => {
              // Calculer les positions relatives à la taille d'affichage
              const scaleX = photoWidth / cameraLayout.cameraWidth;
              const scaleY = photoHeight / cameraLayout.cameraHeight;

              const scaledX = meme.x * scaleX;
              const scaledY = meme.y * scaleY;
              const scaledWidth = meme.width * scaleX * (meme.scale || 1);
              const scaledHeight = meme.height * scaleY * (meme.scale || 1);

              return (
                <View
                  key={meme.id}
                  style={{
                    position: "absolute",
                    left: scaledX,
                    top: scaledY,
                    width: scaledWidth,
                    height: scaledHeight,
                    zIndex: 2,
                  }}
                >
                  <Image
                    source={{ uri: meme.url }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                    priority="normal"
                  />
                </View>
              );
            })}
        </View>

        {/* Numéro de photo */}
        <Text style={styles.photoNumber}>
          {index + 1} / {sessionPhotos.length}
        </Text>
      </View>
    );
  }, [cameraLayout, sessionPhotos.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index || 0;
      setActiveIndex(newIndex);
      onActiveIndexChange?.(newIndex);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const getItemLayout = useCallback(
    (data, index) => ({
      length: ITEM_WIDTH,
      offset: ITEM_WIDTH * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={sessionPhotos}
        renderItem={renderPhoto}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={styles.flatListContent}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />

      {/* Indicateurs de pagination */}
      <View style={styles.pagination}>
        {sessionPhotos.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  flatListContent: {
    paddingHorizontal: 24,
  },
  photoContainer: {
    marginRight: 24,
  },
  photoNumber: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    marginTop: 16,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  paginationDotActive: {
    backgroundColor: "#FF6B6B",
    width: 24,
  },
});

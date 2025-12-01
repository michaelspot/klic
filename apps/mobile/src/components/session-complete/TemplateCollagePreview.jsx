import React, { useState, useCallback, forwardRef } from "react";
import { View, Dimensions } from "react-native";
import { Image } from "expo-image";
import { PhotoSlot } from "@/components/session-complete/PhotoSlot";
import { Watermark } from "@/components/session-complete/Watermark";
import { RevealOverlay } from "@/components/session-complete/RevealOverlay";
import { calculateCameraLayout } from "@/utils/cameraLayout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

export const TemplateCollagePreview = forwardRef(({
  sessionId,
  sessionPhotos,
  selectedTemplate,
  isPremium,
  shakeToRevealEnabled,
  isRevealed,
  onManualReveal,
  revealOverlayStyle,
  photoOffsets = {},
  onPhotoOffsetChange,
}, ref) => {
  const insets = useSafeAreaInsets();
  const cameraLayout = calculateCameraLayout(insets);
  const [templateImageDimensions, setTemplateImageDimensions] = useState(null);

  const handleTemplateImageLoad = (event) => {
    const { width, height } = event.source;
    setTemplateImageDimensions({ width, height });
  };

  const getContainerDimensions = () => {
    // Round to ensure integer pixel alignment for containers
    const baseWidth = Math.floor(screenWidth - 48);
    let containerWidth = baseWidth;
    let containerHeight;
    
    console.log('🎨 getContainerDimensions:', {
      templateId: selectedTemplate?.id,
      templateName: selectedTemplate?.name,
      isPredefined: selectedTemplate?.isPredefined,
      category: selectedTemplate?.category,
      photoCount: selectedTemplate?.photoCount,
      hasBackgroundImage: !!selectedTemplate?.backgroundImage,
      hasImageDimensions: !!templateImageDimensions,
      imageDimensions: templateImageDimensions,
      baseWidth
    });
    
    // PRIORITÉ 1: Templates avec backgroundImage ET dimensions d'image chargées
    // (Prédéfinis OU personnalisés)
    if (selectedTemplate?.backgroundImage && templateImageDimensions) {
      // Utiliser les dimensions EXACTES de l'image de fond du template
      const bgAspectRatio = templateImageDimensions.width / templateImageDimensions.height;
      containerHeight = baseWidth / bgAspectRatio;
      console.log('✅ Template avec image de fond (dimensions réelles):', { 
        containerWidth, 
        containerHeight,
        bgAspectRatio,
        bgDimensions: templateImageDimensions,
        realWidth: templateImageDimensions.width,
        realHeight: templateImageDimensions.height
      });
      return { width: containerWidth, height: containerHeight };
    }
    
    // PRIORITÉ 1.5: Templates prédéfinis avec backgroundImage MAIS dimensions pas encore chargées
    // Utiliser les dimensions hardcodées connues pour éviter le flash
    if (selectedTemplate?.backgroundImage && selectedTemplate?.isPredefined) {
      // Template Polaroid : 1080x1350px
      if (selectedTemplate.id === 'polaroid-letters') {
        const bgAspectRatio = 1080 / 1350; // 0.8
        containerHeight = baseWidth / bgAspectRatio;
        console.log('📐 Template Polaroid (dimensions hardcodées):', { 
          containerWidth, 
          containerHeight,
          bgAspectRatio
        });
        return { width: containerWidth, height: containerHeight };
      }
      
      // Pour d'autres templates prédéfinis avec backgroundImage, fallback sur 4:3
      containerHeight = baseWidth * (4 / 3);
      console.log('⚠️ Template prédéfini avec backgroundImage (fallback 4:3):', { 
        containerWidth, 
        containerHeight
      });
      return { width: containerWidth, height: containerHeight };
    }
    
    // PRIORITÉ 2: Templates prédéfinis SANS backgroundImage
    if (selectedTemplate?.isPredefined && !selectedTemplate?.backgroundImage) {
      const photoCount = selectedTemplate.photoCount || selectedTemplate.slots?.length || 1;
      
      if (selectedTemplate.category === 'horizontal') {
        // Templates Horizontal : photos côte à côte en ligne
        // Largeur fixe, hauteur varie selon le nombre de photos
        containerWidth = baseWidth;
        containerHeight = Math.floor((4 / 3) * baseWidth / photoCount);
        console.log('📏 Horizontal:', { containerWidth, containerHeight, photoCount });
      } else if (selectedTemplate.category === 'vertical') {
        // Templates Vertical : photos empilées en colonne
        // Largeur varie selon le nombre de photos, hauteur fixe
        containerWidth = Math.floor(baseWidth / photoCount);
        containerHeight = Math.floor(baseWidth * (4 / 3));
        console.log('📐 Vertical:', { containerWidth, containerHeight, photoCount });
      } else if (selectedTemplate.category === 'square') {
        // Templates Carré : grille 2x2
        // Largeur fixe, hauteur fixe en 4:3
        containerWidth = baseWidth;
        containerHeight = Math.floor(baseWidth * (4 / 3));
        console.log('⬜ Carré:', { containerWidth, containerHeight });
      } else {
        // Fallback pour templates sans catégorie
        containerWidth = baseWidth;
        containerHeight = Math.floor(baseWidth * (4 / 3));
        console.log('❓ Fallback:', { containerWidth, containerHeight });
      }
      
      return { width: containerWidth, height: containerHeight };
    }
    
    // Pour les autres templates (sans isPredefined)
    const photoRatio = 4 / 3;
    const photosCount = sessionPhotos.length;
    
    console.log('⚠️ Template sans isPredefined ni backgroundImage');
    
    // Calculer les dimensions en fonction du layout
    if (selectedTemplate?.category === 'horizontal') {
      // Photos côte à côte
      const photoWidth = baseWidth / photosCount;
      containerHeight = photoWidth * photoRatio;
      console.log('📏 Horizontal (custom):', { containerWidth, containerHeight, photosCount });
    } else if (selectedTemplate?.category === 'square') {
      // Grille 2x2
      const photoWidth = baseWidth / 2;
      containerHeight = photoWidth * photoRatio * 2;
      console.log('⬜ Carré (custom):', { containerWidth, containerHeight });
    } else {
      // Vertical (empilées) ou par défaut
      const photoWidth = baseWidth;
      const photoHeight = photoWidth * photoRatio;
      containerHeight = photoHeight * photosCount;
      console.log('📐 Vertical (custom):', { containerWidth, containerHeight, photosCount });
    }
    
    return { width: containerWidth, height: containerHeight };
  };

  const getPhotosForSlots = useCallback(() => {
    if (!selectedTemplate?.slots || !sessionPhotos.length) {
      console.log('❌ Pas de slots ou pas de photos:', {
        hasSlots: !!selectedTemplate?.slots,
        slotsLength: selectedTemplate?.slots?.length,
        photosLength: sessionPhotos.length
      });
      return [];
    }
    const slots = selectedTemplate.slots;
    const photos = [...sessionPhotos];
    
    console.log('📸 getPhotosForSlots:', {
      slotsCount: slots.length,
      photosCount: photos.length,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name
    });
    
    if (photos.length === 1 && slots.length > 1) {
      const middleSlotIndex = Math.floor(slots.length / 2);
      const result = new Array(slots.length).fill(null);
      result[middleSlotIndex] = photos[0];
      console.log('✅ Une photo, plusieurs slots - position:', middleSlotIndex);
      return result;
    }
    const result = new Array(slots.length).fill(null);
    photos.forEach((photo, index) => {
      if (index < slots.length) {
        result[index] = photo;
      }
    });
    console.log('✅ Photos assignées aux slots:', result.map((p, i) => ({ slot: i, hasPhoto: !!p, uri: p?.uri?.substring(0, 50) })));
    return result;
  }, [sessionPhotos, selectedTemplate]);

  if (!sessionPhotos.length || !selectedTemplate) {
    console.log('⚠️ Pas de photos ou template:', {
      hasPhotos: sessionPhotos.length > 0,
      hasTemplate: !!selectedTemplate
    });
    return null;
  }

  const hasSlots = selectedTemplate.slots && selectedTemplate.slots.length > 0;
  
  console.log('🎨 TemplateCollagePreview render:', {
    hasSlots,
    templateId: selectedTemplate.id,
    templateName: selectedTemplate.name,
    photosCount: sessionPhotos.length,
    slotsCount: selectedTemplate.slots?.length
  });

  const containerDims = getContainerDimensions();

  return (
    <View style={{ paddingHorizontal: 24, marginBottom: 0 }}>
      <View style={{ alignItems: "center", marginBottom: 0 }}>
        {hasSlots ? (
          <View
            ref={ref}
            collapsable={false}
            style={{
              width: containerDims.width,
              height: containerDims.height,
              overflow: "hidden",
              backgroundColor: "#f0f0f0",
              position: "relative",
            }}
          >
            {/* Image de fond du template */}
            {selectedTemplate.backgroundImage ? (
              <Image
                source={
                  typeof selectedTemplate.backgroundImage === 'number'
                    ? selectedTemplate.backgroundImage // C'est un require()
                    : { uri: selectedTemplate.backgroundImage } // C'est une URI string
                }
                style={{ position: "absolute", width: "100%", height: "100%" }}
                contentFit="cover"
                cachePolicy="memory-disk"
                onLoad={handleTemplateImageLoad}
              />
            ) : (
              <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: "#fff" }} />
            )}
            {getPhotosForSlots().map((photo, index) => {
              const defaultOffset = { x: 0, y: 0 };
              const defaultScale = 1;
              const defaultRotation = 0;
              
              // Utiliser les valeurs sauvegardées SI DISPONIBLES, sinon valeurs par défaut
              const currentOffset = photoOffsets[index]?.translate || defaultOffset;
              const currentScale = photoOffsets[index]?.scale || defaultScale;
              const currentRotation = photoOffsets[index]?.rotation || defaultRotation;
              
              console.log(`🎨 Render PhotoSlot ${index}:`, {
                sessionId,
                offset: currentOffset,
                scale: currentScale,
                rotation: currentRotation,
                hasStoredData: !!photoOffsets[index]
              });
              
              return (
                <PhotoSlot
                  key={`${sessionId}-${index}`}
                  photo={photo}
                  slot={selectedTemplate.slots[index]}
                  containerDimensions={containerDims}
                  index={index}
                  offset={currentOffset}
                  scale={currentScale}
                  rotation={currentRotation}
                  onTransformChange={(translate, scale, rotation) => {
                    if (onPhotoOffsetChange) {
                      onPhotoOffsetChange(index, { translate, scale, rotation });
                    }
                  }}
                />
              );
            })}
            {!isPremium && <Watermark containerWidth={containerDims.width} containerHeight={containerDims.height} />}
            {shakeToRevealEnabled && !isRevealed && (
              <RevealOverlay
                onManualReveal={onManualReveal}
                revealOverlayStyle={revealOverlayStyle}
              />
            )}
          </View>
        ) : (
          <View
            style={{
              width: screenWidth - 48,
              aspectRatio: 2 / 3,
              overflow: "hidden",
              backgroundColor: "#f0f0f0",
              position: "relative",
            }}
          >
            {/* Photo principale */}
            <Image
              source={{ uri: sessionPhotos[sessionPhotos.length - 1].uri }}
              style={{
                width: "100%",
                height: "100%",
                transform: [
                  {
                    // Logique miroir : flip si caméra frontale ET miroir désactivé
                    // OU si caméra arrière ET miroir activé
                    scaleX: (() => {
                      const photo = sessionPhotos[sessionPhotos.length - 1];
                      if (!photo.cameraSettings) return 1;
                      
                      const shouldFlip = photo.cameraSettings.facing === 'front'
                        ? !photo.cameraSettings.mirrorEnabled  // Front: flip si miroir désactivé
                        : photo.cameraSettings.mirrorEnabled;  // Arrière: flip si miroir activé
                      
                      return shouldFlip ? -1 : 1;
                    })(),
                  },
                ],
              }}
              contentFit="cover"
              transition={200}
            />
            
            {/* Afficher les memes (statiques uniquement) - seulement si pas déjà fusionnés */}
            {!sessionPhotos[sessionPhotos.length - 1].isComposite && 
             sessionPhotos[sessionPhotos.length - 1].memes &&
              sessionPhotos[sessionPhotos.length - 1].memes.map((meme) => {
                // Calculer les positions relatives à la taille d'affichage
                const displayWidth = screenWidth - 48;
                const displayHeight = displayWidth * (3 / 2); // Aspect ratio 2:3
                const scaleX = displayWidth / cameraLayout.cameraWidth;
                const scaleY = displayHeight / cameraLayout.cameraHeight;

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
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                  </View>
                );
              })}
            
            {!isPremium && <Watermark containerWidth={containerDims.width} containerHeight={containerDims.height} />}
            {shakeToRevealEnabled && !isRevealed && (
              <RevealOverlay
                onManualReveal={onManualReveal}
                revealOverlayStyle={revealOverlayStyle}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
});

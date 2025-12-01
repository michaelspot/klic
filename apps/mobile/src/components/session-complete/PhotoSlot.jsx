import React, { useState, useRef, useEffect } from "react";
import { View, Dimensions } from "react-native";
import { Image } from "expo-image";
import Svg, { Defs, ClipPath, Polygon, G, Image as SvgImage } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const { width: screenWidth } = Dimensions.get("window");

export function PhotoSlot({ photo, slot, containerDimensions, index, offset = { x: 0, y: 0 }, scale: initialScale = 1, rotation: initialRotation = 0, onTransformChange }) {
  if (!photo || !slot) {
    return null;
  }

  const containerWidth = containerDimensions?.width || screenWidth - 48;
  const containerHeight = containerDimensions?.height || (containerWidth * (4 / 3));
  
  const [localScale, setLocalScale] = useState(initialScale);
  const [localTranslate, setLocalTranslate] = useState(offset);
  const [localRotation, setLocalRotation] = useState(initialRotation);
  
  // Utiliser useSharedValue au lieu de useRef pour pouvoir modifier dans les worklets
  const gestureStartScale = useSharedValue(initialScale);
  const gestureStartTranslate = useSharedValue(offset);
  const gestureStartRotation = useSharedValue(initialRotation);
  const activeGesturesCount = useRef(0);

  // TOUJOURS synchroniser avec les props pour réinitialiser à chaque nouvelle session
  useEffect(() => {
    console.log(`📸 PhotoSlot ${index} - Sync scale:`, initialScale);
    setLocalScale(initialScale);
    gestureStartScale.value = initialScale;
  }, [initialScale, index]);

  useEffect(() => {
    console.log(`📸 PhotoSlot ${index} - Sync translate:`, offset);
    setLocalTranslate(offset);
    gestureStartTranslate.value = offset;
  }, [offset.x, offset.y, index]);

  useEffect(() => {
    console.log(`📸 PhotoSlot ${index} - Sync rotation:`, initialRotation);
    setLocalRotation(initialRotation);
    gestureStartRotation.value = initialRotation;
  }, [initialRotation, index]);

  // Calculer les positions des 4 coins du slot en pixels
  const topLeftX = slot.topLeft.x * containerWidth;
  const topLeftY = slot.topLeft.y * containerHeight;
  const topRightX = slot.topRight.x * containerWidth;
  const topRightY = slot.topRight.y * containerHeight;
  const bottomRightX = slot.bottomRight.x * containerWidth;
  const bottomRightY = slot.bottomRight.y * containerHeight;
  const bottomLeftX = slot.bottomLeft.x * containerWidth;
  const bottomLeftY = slot.bottomLeft.y * containerHeight;

  // Trouver la bounding box du slot avec ajustement aux pixels entiers pour éviter les espaces
  const minX = Math.floor(Math.min(topLeftX, topRightX, bottomLeftX, bottomRightX));
  const minY = Math.floor(Math.min(topLeftY, topRightY, bottomLeftY, bottomRightY));
  const maxX = Math.ceil(Math.max(topLeftX, topRightX, bottomLeftX, bottomRightX));
  const maxY = Math.ceil(Math.max(topLeftY, topRightY, bottomLeftY, bottomRightY));
  
  const slotWidth = maxX - minX;
  const slotHeight = maxY - minY;

  // Points du polygone relatifs à la bounding box
  // Pour les rectangles simples (vertical/horizontal), on aligne le polygone sur les bords entiers
  // pour garantir une couverture totale sans ligne blanche
  const isSimpleRect = 
    Math.abs(topLeftX - bottomLeftX) < 0.1 && 
    Math.abs(topRightX - bottomRightX) < 0.1 &&
    Math.abs(topLeftY - topRightY) < 0.1 && 
    Math.abs(bottomLeftY - bottomRightY) < 0.1;

  let polygonPoints;
  
  if (isSimpleRect) {
    // Si c'est un rectangle simple, on utilise la largeur/hauteur entière calculée
    // Cela force le clipPath à couvrir toute la zone du View (qui a été arrondie à l'entier supérieur)
    polygonPoints = `
      0,0
      ${slotWidth},0
      ${slotWidth},${slotHeight}
      0,${slotHeight}
    `;
  } else {
    // Pour les formes complexes, on garde la précision originale relative à l'origine arrondie
    polygonPoints = `
      ${topLeftX - minX},${topLeftY - minY}
      ${topRightX - minX},${topRightY - minY}
      ${bottomRightX - minX},${bottomRightY - minY}
      ${bottomLeftX - minX},${bottomLeftY - minY}
    `;
  }

  // Gesture pour le pinch (zoom) - SANS LIMITES
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      activeGesturesCount.current++;
      // Capturer la valeur ACTUELLE au début du geste
      gestureStartScale.value = localScale;
      console.log('🟢 PINCH onStart - gestureStartScale capturé:', gestureStartScale.value);
    })
    .onUpdate((event) => {
      // Calculer le nouveau scale à partir de la valeur de départ
      const newScale = Math.max(0.1, Math.min(gestureStartScale.value * event.scale, 5));
      runOnJS(setLocalScale)(newScale);
    })
    .onEnd(() => {
      activeGesturesCount.current--;
      // Mettre à jour pour le prochain geste
      gestureStartScale.value = localScale;
      
      if (onTransformChange) {
        runOnJS(onTransformChange)(localTranslate, localScale, localRotation);
      }
    });

  // Gesture pour le pan (déplacement) - GARDE TOUT : position, scale ET rotation
  const panGesture = Gesture.Pan()
    .onStart(() => {
      activeGesturesCount.current++;
      
      console.log('🟢 PAN onStart - AVANT capture');
      console.log('  localTranslate:', localTranslate);
      console.log('  localScale:', localScale);
      console.log('  localRotation:', localRotation);
      
      // Capturer la position ACTUELLE (ne rien réinitialiser)
      gestureStartTranslate.value = { x: localTranslate.x, y: localTranslate.y };
      
      console.log('🟢 PAN onStart - APRÈS capture');
      console.log('  gestureStartTranslate.value capturé:', gestureStartTranslate.value);
    })
    .onUpdate((event) => {
      // Calculer la nouvelle position à partir de la dernière position + le delta
      const newX = gestureStartTranslate.value.x + event.translationX;
      const newY = gestureStartTranslate.value.y + event.translationY;
      
      console.log('🔵 PAN onUpdate');
      console.log('  gestureStartTranslate.value:', gestureStartTranslate.value);
      console.log('  event.translationX/Y:', event.translationX, event.translationY);
      console.log('  newX/Y calculé:', newX, newY);
      
      runOnJS(setLocalTranslate)({ x: newX, y: newY });
    })
    .onEnd((event) => {
      activeGesturesCount.current--;
      
      // Calculer la position finale
      const finalX = gestureStartTranslate.value.x + event.translationX;
      const finalY = gestureStartTranslate.value.y + event.translationY;
      const finalTranslate = { x: finalX, y: finalY };
      
      console.log('🔴 PAN onEnd');
      console.log('  finalTranslate calculé:', finalTranslate);
      console.log('  localScale:', localScale);
      console.log('  localRotation:', localRotation);
      
      // Mettre à jour le state et la shared value pour le prochain geste
      runOnJS(setLocalTranslate)(finalTranslate);
      gestureStartTranslate.value = finalTranslate;
      
      if (onTransformChange) {
        // Sauvegarder avec les valeurs ACTUELLES de scale et rotation
        runOnJS(onTransformChange)(finalTranslate, localScale, localRotation);
      }
    });

  // Gesture pour la rotation - SANS LIMITES
  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      activeGesturesCount.current++;
      // Capturer la rotation ACTUELLE au début du geste
      gestureStartRotation.value = localRotation;
    })
    .onUpdate((event) => {
      // Convertir de radians en degrés
      const rotationDegrees = (event.rotation * 180) / Math.PI;
      const newRotation = gestureStartRotation.value + rotationDegrees;
      runOnJS(setLocalRotation)(newRotation);
    })
    .onEnd(() => {
      activeGesturesCount.current--;
      // Mettre à jour pour le prochain geste
      gestureStartRotation.value = localRotation;
      
      if (onTransformChange) {
        runOnJS(onTransformChange)(localTranslate, localScale, localRotation);
      }
    });

  // Gesture pour le double tap - Réinitialise toutes les transformations
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      // Feedback haptique pour confirmer la réinitialisation
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      
      // Réinitialiser toutes les valeurs
      const resetTranslate = { x: 0, y: 0 };
      const resetScale = 1;
      const resetRotation = 0;
      
      console.log('🔄 Double tap - Réinitialisation des transformations');
      
      // Mettre à jour les states
      runOnJS(setLocalTranslate)(resetTranslate);
      runOnJS(setLocalScale)(resetScale);
      runOnJS(setLocalRotation)(resetRotation);
      
      // Mettre à jour les shared values pour les prochains gestures
      gestureStartTranslate.value = resetTranslate;
      gestureStartScale.value = resetScale;
      gestureStartRotation.value = resetRotation;
      
      // Notifier le parent
      if (onTransformChange) {
        runOnJS(onTransformChange)(resetTranslate, resetScale, resetRotation);
      }
    });

  // Combiner les gestes (zoom, déplacement, rotation ET double tap)
  const composedGesture = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture, rotationGesture)
  );

  return (
    <GestureDetector gesture={composedGesture}>
      <View
        key={`slot-${index}`}
        style={{
          position: "absolute",
          left: minX,
          top: minY,
          width: slotWidth,
          height: slotHeight,
        }}
      >
        <Svg width={slotWidth} height={slotHeight}>
          <Defs>
            <ClipPath id={`clip-${index}`}>
              <Polygon points={polygonPoints} />
            </ClipPath>
          </Defs>
          {/* Groupe avec clipPath pour garantir que tout reste dans le slot */}
          <G clipPath={`url(#clip-${index})`}>
            <SvgImage
              href={{ uri: photo.uri }}
              x={localTranslate.x - 1}
              y={localTranslate.y - 1}
              width={slotWidth * localScale + 2}
              height={slotHeight * localScale + 2}
              preserveAspectRatio="xMidYMid slice"
              transform={
                (() => {
                  const transforms = [];
                  
                  // Rotation autour du centre de l'IMAGE - SANS LIMITE DE SCALE
                  // L'image pivote "sur place" et reste clippée par le polygon du slot
                  if (localRotation !== 0) {
                    // Centre de l'image dans le système de coordonnées du SVG
                    const imageCenterX = localTranslate.x + (slotWidth * localScale) / 2;
                    const imageCenterY = localTranslate.y + (slotHeight * localScale) / 2;
                    
                    // Rotation en 3 étapes pour que l'image pivote "sur place" :
                    // 1. Translater pour mettre le centre de l'image à l'origine
                    // 2. Faire la rotation
                    // 3. Translater pour remettre le centre de l'image à sa position
                    transforms.push(`translate(${imageCenterX}, ${imageCenterY})`);
                    transforms.push(`rotate(${localRotation})`);
                    transforms.push(`translate(${-imageCenterX}, ${-imageCenterY})`);
                  }
                  
                  // Miroir pour les photos de caméra (appliqué après la rotation)
                  // Logique : On flip si caméra frontale ET miroir DÉSACTIVÉ
                  // OU si caméra arrière ET miroir ACTIVÉ
                  if (!photo.isComposite && photo.cameraSettings) {
                    const shouldFlip = photo.cameraSettings.facing === 'front'
                      ? !photo.cameraSettings.mirrorEnabled  // Front: flip si miroir désactivé
                      : photo.cameraSettings.mirrorEnabled;  // Arrière: flip si miroir activé
                    
                    if (shouldFlip) {
                      transforms.push(`scale(-1, 1)`);
                      transforms.push(`translate(-${slotWidth * localScale}, 0)`);
                    }
                  }
                  
                  return transforms.length > 0 ? transforms.join(' ') : undefined;
                })()
              }
            />
          </G>
        </Svg>
      </View>
    </GestureDetector>
  );
}

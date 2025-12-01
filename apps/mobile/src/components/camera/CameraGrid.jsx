import React from 'react';
import { View } from 'react-native';

/**
 * Composant de grille pour la caméra (rule of thirds)
 * Affiche une grille 3x3 pour aider à la composition
 */
export function CameraGrid({ cameraLayout }) {
  const { cameraTop, cameraWidth, cameraHeight } = cameraLayout;
  const screenWidth = cameraWidth;

  return (
    <View
      style={{
        position: 'absolute',
        top: cameraTop,
        left: (screenWidth - cameraWidth) / 2,
        width: cameraWidth,
        height: cameraHeight,
        pointerEvents: 'none',
      }}
    >
      {/* Lignes verticales */}
      <View
        style={{
          position: 'absolute',
          left: cameraWidth / 3,
          top: 0,
          width: 1,
          height: cameraHeight,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: (cameraWidth * 2) / 3,
          top: 0,
          width: 1,
          height: cameraHeight,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        }}
      />

      {/* Lignes horizontales */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: cameraHeight / 3,
          width: cameraWidth,
          height: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: (cameraHeight * 2) / 3,
          width: cameraWidth,
          height: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
        }}
      />
    </View>
  );
}

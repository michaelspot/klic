import React from "react";
import { View } from "react-native";

export function CameraCropOverlay({ topCrop, bottomCrop }) {
  return (
    <>
      {topCrop > 0 && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: topCrop,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 1,
          }}
        />
      )}
      {bottomCrop > 0 && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: bottomCrop,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 1,
          }}
        />
      )}
    </>
  );
}

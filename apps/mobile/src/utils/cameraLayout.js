import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const TOP_BAR_HEIGHT = 80;
const BOTTOM_BAR_HEIGHT = 120;

export function calculateCameraLayout(insets) {
  const availableHeight =
    screenHeight - insets.top - insets.bottom - TOP_BAR_HEIGHT - BOTTOM_BAR_HEIGHT;
  const maxCameraWidth = screenWidth;
  const maxCameraHeight = availableHeight;

  // 4:3 format (taller than wide)
  const cameraHeight = Math.min(maxCameraWidth * (4 / 3), maxCameraHeight);
  const cameraWidth = cameraHeight * (3 / 4);

  const cameraTop =
    insets.top + TOP_BAR_HEIGHT + (availableHeight - cameraHeight) / 2;
  const cameraBottom =
    screenHeight -
    insets.bottom -
    BOTTOM_BAR_HEIGHT -
    (availableHeight - cameraHeight) / 2;

  const topCrop = cameraTop;
  const bottomCrop = screenHeight - cameraBottom;

  return {
    cameraWidth,
    cameraHeight,
    cameraTop,
    cameraBottom,
    topCrop,
    bottomCrop,
  };
}

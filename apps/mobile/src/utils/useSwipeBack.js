import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { BackHandler } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, runOnJS } from "react-native-reanimated";

export const useSwipeBack = (onBack) => {
  const navigation = useNavigation();
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  useFocusEffect(() => {
    // Enable swipe gestures for iOS
    navigation.setOptions({
      gestureEnabled: true,
      fullScreenGestureEnabled: true,
    });

    // Ensure parent navigation also supports gestures
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({ gestureEnabled: true });
    }

    // Android back button handler
    const hardwareBackPressHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (onBack) {
          onBack();
          return true; // Prevent default behavior
        }
        return false; // Allow default behavior
      },
    );

    return () => {
      hardwareBackPressHandler.remove();
    };
  });

  // Create improved swipe gesture for custom handling
  const swipeGesture = Gesture.Pan()
    .onStart((event) => {
      startX.value = event.x;
      startY.value = event.y;
    })
    .onUpdate((event) => {
      // Optional: provide visual feedback during swipe
    })
    .onEnd((event) => {
      const { translationX, translationY, velocityX, x } = event;

      // Improved swipe detection:
      // 1. Must start from left edge (within 50px)
      // 2. Must swipe right (positive translationX)
      // 3. Must swipe at least 100px or have significant velocity
      // 4. Vertical movement shouldn't be too large (not a vertical scroll)

      const isFromLeftEdge = startX.value < 50;
      const isRightwardSwipe = translationX > 0;
      const hasMinimumDistance = translationX > 100;
      const hasMinimumVelocity = velocityX > 500;
      const isNotVerticalScroll =
        Math.abs(translationY) < Math.abs(translationX);

      if (
        isFromLeftEdge &&
        isRightwardSwipe &&
        (hasMinimumDistance || hasMinimumVelocity) &&
        isNotVerticalScroll
      ) {
        if (onBack) {
          runOnJS(onBack)();
        }
      }
    })
    .enableTrackpadTwoFingerGesture(true); // Enable for trackpad users

  return { swipeGesture };
};

export default useSwipeBack;

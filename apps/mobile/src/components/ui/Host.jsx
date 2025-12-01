import { View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function Host({ children, style }) {
  const { isDark } = useTheme();

  return (
    <View
      style={[{ flex: 1, backgroundColor: isDark ? "#000" : "#f2f2f7" }, style]}
    >
      {children}
    </View>
  );
}

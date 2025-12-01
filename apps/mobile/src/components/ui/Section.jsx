import { View, Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function Section({ children, title, style }) {
  const { isDark } = useTheme();

  return (
    <View style={[{ marginTop: 35 }, style]}>
      {title && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: "400",
            color: isDark ? "#8e8e93" : "#6d6d72",
            textTransform: "uppercase",
            marginBottom: 6,
            marginLeft: 20,
            letterSpacing: -0.08,
          }}
        >
          {title}
        </Text>
      )}
      <View
        style={{
          backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
          marginHorizontal: 20,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}

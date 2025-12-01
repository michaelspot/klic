import { TouchableOpacity, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";

export default function Row({
  label,
  value,
  onPress,
  showChevron = true,
  color,
  style,
  icon,
  ...props
}) {
  const { isDark } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress && onPress();
  };

  const Component = onPress ? TouchableOpacity : View;
  const textColor = color || (isDark ? "#fff" : "#000");

  return (
    <Component
      onPress={handlePress}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2c2c2e" : "#e5e5e7",
        },
        style,
      ]}
      {...props}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        {icon && <View style={{ marginRight: 12 }}>{icon}</View>}
        <Text
          style={{
            fontSize: 17,
            color: textColor,
            fontWeight: "400",
          }}
        >
          {label}
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {value && (
          <Text
            style={{
              fontSize: 17,
              color: "#8e8e93",
              fontWeight: "400",
              marginRight: showChevron && onPress ? 8 : 0,
            }}
          >
            {value}
          </Text>
        )}
        {showChevron && onPress && <ChevronRight size={16} color="#8e8e93" />}
      </View>
    </Component>
  );
}

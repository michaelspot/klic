import { View, Text, TouchableOpacity, Switch as RNSwitch } from "react-native";
import * as Haptics from "expo-haptics";
import { Lock } from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";

export default function Switch({
  value,
  onValueChange,
  label,
  style,
  locked = false,
  icon,
  ...props
}) {
  const { isDark } = useTheme();

  const handleValueChange = (newValue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange && onValueChange(newValue);
  };

  return (
    <View
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
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        {icon && <View style={{ marginRight: 12 }}>{icon}</View>}
        <Text
          style={{
            fontSize: 17,
            color: isDark ? "#fff" : "#000",
            fontWeight: "400",
            flex: 1,
          }}
        >
          {label}
        </Text>
        {locked && (
          <Lock size={16} color="#FF8C00" style={{ marginRight: 8 }} />
        )}
      </View>
      <RNSwitch
        value={value}
        onValueChange={handleValueChange}
        trackColor={{ false: "#767577", true: "#34C759" }}
        thumbColor={"#f4f3f4"}
        disabled={locked}
        {...props}
      />
    </View>
  );
}

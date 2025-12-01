import { TouchableOpacity, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function Button({ children, onPress, color = '#007AFF', variant = 'primary', disabled = false, style, icon, ...props }) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress && onPress();
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      disabled={disabled}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: variant === 'row' ? 'space-between' : 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e5e7',
        }, 
        style
      ]}
      {...props}
    >
      <Text style={{
        fontSize: 17,
        color: disabled ? '#8e8e93' : color,
        fontWeight: variant === 'primary' ? '600' : '400',
      }}>
        {children}
      </Text>
      {icon && (
        <View style={{ marginLeft: 8 }}>
          {icon}
        </View>
      )}
    </TouchableOpacity>
  );
}
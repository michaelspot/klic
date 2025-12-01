import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Form({ children, style }) {
  const insets = useSafeAreaInsets();
  
  return (
    <ScrollView 
      style={[{ flex: 1 }, style]}
      contentContainerStyle={{ 
        paddingBottom: insets.bottom + 20 
      }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
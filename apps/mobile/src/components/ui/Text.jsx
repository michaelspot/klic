import { Text as RNText } from 'react-native';

export default function Text({ children, size = 17, color = '#000', weight = '400', style, ...props }) {
  return (
    <RNText 
      style={[
        { 
          fontSize: size, 
          color, 
          fontWeight: weight,
          paddingHorizontal: 20,
          paddingVertical: 12,
        }, 
        style
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
  ScrollView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import {
  X,
  Check,
  Smile,
  Sticker,
  Type,
  Palette,
  Sparkles,
  Crown,
  Plus,
  RotateCcw,
} from 'lucide-react-native';
import { useFonts, Inter_600SemiBold, Inter_400Regular } from '@expo-google-fonts/inter';
import { useRouter } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AnimatedView = Animated.createAnimatedComponent(View);

export default function PhotoEditor() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('stickers');
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isPremium] = useState(false);

  // Mock photo data
  const [photo] = useState({
    uri: 'https://picsum.photos/400/600?random=20',
    hasWatermark: true,
  });

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }} />;
  }

  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const filters = [
    { id: 'none', name: t('original'), preview: '#FF6B6B' },
    { id: 'vintage', name: t('vintage'), preview: '#D4A574' },
    { id: 'bw', name: 'N&B', preview: '#888' },
    { id: 'warm', name: t('warm'), preview: '#FFA07A' },
    { id: 'cool', name: t('cool'), preview: '#87CEEB' },
    { id: 'sepia', name: t('sepia'), preview: '#DEB887', premium: true },
    { id: 'dramatic', name: t('dramatic'), preview: '#800080', premium: true },
  ];

  const stickers = [
    { id: '1', emoji: '😊', category: 'emotions' },
    { id: '2', emoji: '❤️', category: 'emotions' },
    { id: '3', emoji: '🎉', category: 'party' },
    { id: '4', emoji: '🌟', category: 'party' },
    { id: '5', emoji: '📸', category: 'camera' },
    { id: '6', emoji: '✨', category: 'sparkle' },
    { id: '7', emoji: '🎈', category: 'party', premium: true },
    { id: '8', emoji: '🎊', category: 'party', premium: true },
  ];

  const addElement = (type, content) => {
    handleHapticFeedback();
    const newElement = {
      id: Date.now().toString(),
      type,
      content,
      x: screenWidth / 2 - 25,
      y: 200,
      scale: 1,
      rotation: 0,
    };
    setElements([...elements, newElement]);
  };

  const removeElement = (elementId) => {
    handleHapticFeedback();
    setElements(elements.filter(el => el.id !== elementId));
    setSelectedElement(null);
  };

  const DraggableElement = ({ element }) => {
    const translateX = useSharedValue(element.x);
    const translateY = useSharedValue(element.y);
    const scale = useSharedValue(element.scale);

    const panGesture = useAnimatedGestureHandler({
      onStart: () => {
        runOnJS(setSelectedElement)(element.id);
        runOnJS(handleHapticFeedback)();
      },
      onActive: (event) => {
        translateX.value = event.translationX + element.x;
        translateY.value = event.translationY + element.y;
      },
      onEnd: () => {
        element.x = translateX.value;
        element.y = translateY.value;
      },
    });

    const pinchGesture = useAnimatedGestureHandler({
      onStart: () => {
        runOnJS(setSelectedElement)(element.id);
      },
      onActive: (event) => {
        scale.value = event.scale * element.scale;
      },
      onEnd: () => {
        element.scale = scale.value;
      },
    });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    }));

    return (
      <PinchGestureHandler onGestureEvent={pinchGesture}>
        <AnimatedView>
          <PanGestureHandler onGestureEvent={panGesture}>
            <AnimatedView
              style={[
                {
                  position: 'absolute',
                  zIndex: 100,
                },
                animatedStyle,
              ]}
            >
              <View
                style={{
                  backgroundColor: element.type === 'text' ? 'rgba(0,0,0,0.3)' : 'transparent',
                  paddingHorizontal: element.type === 'text' ? 8 : 0,
                  paddingVertical: element.type === 'text' ? 4 : 0,
                  borderRadius: 8,
                  borderWidth: selectedElement === element.id ? 2 : 0,
                  borderColor: '#FF6B6B',
                }}
              >
                {element.type === 'sticker' && (
                  <Text style={{ fontSize: 40 }}>{element.content}</Text>
                )}
                {element.type === 'text' && (
                  <Text style={{
                    fontSize: 20,
                    color: '#fff',
                    fontFamily: 'Inter_600SemiBold',
                  }}>
                    {element.content}
                  </Text>
                )}
              </View>
            </AnimatedView>
          </PanGestureHandler>
        </AnimatedView>
      </PinchGestureHandler>
    );
  };

  const TabButton = ({ id, title, icon: IconComponent, active }) => (
    <TouchableOpacity
      onPress={() => {
        handleHapticFeedback();
        setActiveTab(id);
      }}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: active ? '#FF6B6B' : 'transparent',
        borderRadius: 12,
        marginHorizontal: 4,
      }}
    >
      <IconComponent size={20} color={active ? '#fff' : (isDark ? '#CCCCCC' : '#666')} />
      <Text style={{
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: active ? '#fff' : (isDark ? '#CCCCCC' : '#666'),
        marginTop: 4,
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const FilterButton = ({ filter }) => (
    <TouchableOpacity
      onPress={() => {
        if (filter.premium && !isPremium) {
          Alert.alert(t('premium'), t('featureRequiresPremium'));
          return;
        }
        handleHapticFeedback();
      }}
      style={{
        alignItems: 'center',
        marginRight: 16,
      }}
    >
      <View style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: filter.preview,
        marginBottom: 8,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {filter.premium && !isPremium && (
          <Crown size={20} color="#FFD700" />
        )}
      </View>
      <Text style={{
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: isDark ? '#CCCCCC' : '#666',
        textAlign: 'center',
      }}>
        {filter.name}
      </Text>
    </TouchableOpacity>
  );

  const StickerButton = ({ sticker }) => (
    <TouchableOpacity
      onPress={() => {
        if (sticker.premium && !isPremium) {
          Alert.alert(t('premium'), t('featureRequiresPremium'));
          return;
        }
        addElement('sticker', sticker.emoji);
      }}
      style={{
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? '#2C2C2C' : '#F5F5F5',
        borderRadius: 12,
        marginRight: 12,
        marginBottom: 12,
        position: 'relative',
      }}
    >
      <Text style={{ fontSize: 30 }}>{sticker.emoji}</Text>
      {sticker.premium && !isPremium && (
        <View style={{
          position: 'absolute',
          top: 4,
          right: 4,
          backgroundColor: '#FFD700',
          borderRadius: 8,
          padding: 2,
        }}>
          <Crown size={10} color="#000" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 24,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isDark ? '#000' : '#fff',
        zIndex: 1000,
      }}>
        <TouchableOpacity
          onPress={() => {
            handleHapticFeedback();
            router.back();
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDark ? '#2C2C2C' : '#F5F5F5',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        
        <Text style={{
          fontSize: 18,
          fontFamily: 'Inter_600SemiBold',
          color: isDark ? '#fff' : '#000',
        }}>
          Éditeur
        </Text>
        
        <TouchableOpacity
          onPress={() => {
            handleHapticFeedback();
            Alert.alert('Sauvegardé !', 'Votre photo a été sauvegardée.');
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#FF6B6B',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Photo Canvas */}
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
      }}>
        <View style={{
          width: screenWidth - 48,
          aspectRatio: 2/3,
          borderRadius: 20,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <Image
            source={{ uri: photo.uri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          
          {/* Overlay elements */}
          {elements.map((element) => (
            <DraggableElement key={element.id} element={element} />
          ))}
          
          {photo.hasWatermark && (
            <View style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}>
              <Text style={{
                color: '#fff',
                fontSize: 14,
                fontFamily: 'Inter_600SemiBold',
              }}>
                ThisMoment
              </Text>
            </View>
          )}
        </View>
        
        {selectedElement && (
          <TouchableOpacity
            onPress={() => removeElement(selectedElement)}
            style={{
              position: 'absolute',
              top: 100,
              right: 24,
              backgroundColor: '#FF4444',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text style={{
              color: '#fff',
              fontSize: 14,
              fontFamily: 'Inter_600SemiBold',
            }}>
              Supprimer
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Panel */}
      <View style={{
        backgroundColor: isDark ? '#1A1A1A' : '#F9F9F9',
        paddingTop: 16,
        paddingBottom: insets.bottom + 16,
      }}>
        {/* Tabs */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 24,
          marginBottom: 16,
        }}>
          <TabButton id="stickers" title={t('stickers')} icon={Smile} active={activeTab === 'stickers'} />
          <TabButton id="text" title={t('text')} icon={Type} active={activeTab === 'text'} />
          <TabButton id="filters" title={t('filters')} icon={Palette} active={activeTab === 'filters'} />
        </View>

        {/* Content */}
        <View style={{ height: 120 }}>
          {activeTab === 'stickers' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            >
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                width: screenWidth * 2,
              }}>
                {stickers.map((sticker) => (
                  <StickerButton key={sticker.id} sticker={sticker} />
                ))}
              </View>
            </ScrollView>
          )}

          {activeTab === 'text' && (
            <View style={{ paddingHorizontal: 24 }}>
              <TouchableOpacity
                onPress={() => {
                  Alert.prompt(
                    t('addText'),
                    t('enterYourText'),
                    [
                      { text: t('cancel'), style: 'cancel' },
                      {
                        text: t('add'),
                        onPress: (text) => {
                          if (text) addElement('text', text);
                        },
                      },
                    ],
                    'plain-text'
                  );
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FF6B6B',
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <Plus size={24} color="#fff" />
                <Text style={{
                  fontSize: 16,
                  fontFamily: 'Inter_600SemiBold',
                  color: '#fff',
                  marginLeft: 12,
                }}>
                  Ajouter du texte
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'filters' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            >
              {filters.map((filter) => (
                <FilterButton key={filter.id} filter={filter} />
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}
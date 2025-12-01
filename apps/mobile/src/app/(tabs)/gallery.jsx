import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { GestureDetector } from "react-native-gesture-handler";
import {
  ArrowLeft,
  Share,
  Trash2,
  Heart,
  Download,
  Grid3X3,
  Calendar,
  Camera,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculateCameraLayout } from "../../utils/cameraLayout";
import { useTheme } from "../../hooks/useTheme";
import useSwipeBack from "../../utils/useSwipeBack";
import useHapticFeedback from "../../hooks/useHapticFeedback";
import { useTranslation } from "../../hooks/useTranslation";
import { savePhotoToGallery, sharePhoto } from "../../utils/shareAndSave";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function Gallery() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { triggerLightHaptic } = useHapticFeedback();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
  });

  // Calculer le layout de la caméra pour le format 4:3
  const cameraLayout = calculateCameraLayout(insets);

  // Gestes de retour
  const goBack = () => {
    triggerLightHaptic();
    router.push("/(tabs)/camera/");
  };

  const { swipeGesture } = useSwipeBack(goBack);

  // Gestes de retour spécifiques pour la vue photo détaillée
  const closeDetailView = () => {
    setSelectedPhoto(null);
  };

  const { swipeGesture: detailSwipeGesture } = useSwipeBack(closeDetailView);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const savedPhotos = await AsyncStorage.getItem("thismoment_photos");
      if (savedPhotos) {
        const photosData = JSON.parse(savedPhotos);
        setPhotos(photosData);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  };

  const toggleFavorite = async (photoId) => {
    triggerLightHaptic();
    try {
      const updatedPhotos = photos.map((photo) =>
        photo.id === photoId ? { ...photo, favorite: !photo.favorite } : photo,
      );
      setPhotos(updatedPhotos);
      await AsyncStorage.setItem(
        "thismoment_photos",
        JSON.stringify(updatedPhotos),
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour des favoris:", error);
    }
  };

  const deletePhoto = async (photoId) => {
    Alert.alert(
      t('deletePhoto'),
      t('deletePhotoConfirm'),
      [
        { text: t('cancel'), style: "cancel" },
        {
          text: t('delete'),
          style: "destructive",
          onPress: async () => {
            triggerLightHaptic();
            try {
              const updatedPhotos = photos.filter(
                (photo) => photo.id !== photoId,
              );
              setPhotos(updatedPhotos);
              await AsyncStorage.setItem(
                "thismoment_photos",
                JSON.stringify(updatedPhotos),
              );
              setSelectedPhoto(null);
            } catch (error) {
              console.error("Erreur lors de la suppression:", error);
            }
          },
        },
      ],
    );
  };

  const handleSharePhoto = async (photo) => {
    triggerLightHaptic();
    await sharePhoto(photo.uri, photo);
  };

  const handleSaveToDevice = async (photo) => {
    triggerLightHaptic();
    await savePhotoToGallery(photo.uri, photo);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }} />
    );
  }

  if (selectedPhoto) {
    const photo = photos.find((p) => p.id === selectedPhoto);
    if (!photo) return null;

    // Calculer les dimensions pour l'affichage plein écran en conservant le ratio 4:3
    const displayWidth = screenWidth;
    const displayHeight = displayWidth * (4 / 3);
    const displayTop = (screenHeight - displayHeight) / 2;

    return (
      <GestureDetector gesture={detailSwipeGesture}>
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <StatusBar style="light" />

          {/* Full screen photo container */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 0,
            }}
          >
            <View
              style={{
                width: displayWidth,
                height: displayHeight,
                position: "relative",
                backgroundColor: "#000",
              }}
            >
              {/* Photo principale */}
              <Image
                source={{ uri: photo.uri }}
                style={{
                  width: "100%",
                  height: "100%",
                  transform: photo.isComposite ? [] : [
                    {
                      // Pour la galerie : inverser la logique pour correspondre au carrousel
                      // Sauf si c'est une image composite (déjà dans la bonne orientation)
                      scaleX: photo.cameraSettings?.mirrorEnabled ? -1 : 1,
                    },
                  ],
                }}
                contentFit="cover"
                transition={200}
              />

              {/* Afficher les memes avec le bon scaling (seulement si pas déjà fusionnés) */}
              {!photo.isComposite && photo.memes &&
                photo.memes.map((meme) => {
                  // Calculer les positions relatives à la taille d'affichage
                  const scaleX = displayWidth / cameraLayout.cameraWidth;
                  const scaleY = displayHeight / cameraLayout.cameraHeight;

                  const scaledX = meme.x * scaleX;
                  const scaledY = meme.y * scaleY;
                  const scaledWidth =
                    meme.width * scaleX * (meme.scale || 1);
                  const scaledHeight =
                    meme.height * scaleY * (meme.scale || 1);

                  return (
                    <View
                      key={meme.id}
                      style={{
                        position: "absolute",
                        left: scaledX,
                        top: scaledY,
                        width: scaledWidth,
                        height: scaledHeight,
                        zIndex: 2,
                      }}
                    >
                      <Image
                        source={{ uri: meme.url }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="contain"
                        transition={200}
                        cachePolicy="memory-disk"
                      />
                    </View>
                  );
                })}
            </View>
          </View>

          {/* Header */}
          <View
            style={{
              position: "absolute",
              top: insets.top + 10,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              zIndex: 10,
            }}
          >
            <TouchableOpacity
              onPress={closeDetailView}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(0,0,0,0.5)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleFavorite(photo.id)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(0,0,0,0.5)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart
                size={24}
                color={photo.favorite ? "#FF6B6B" : "#fff"}
                fill={photo.favorite ? "#FF6B6B" : "transparent"}
              />
            </TouchableOpacity>
          </View>

          {/* Bottom actions */}
          <View
            style={{
              position: "absolute",
              bottom: insets.bottom + 20,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 40,
              zIndex: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => handleSharePhoto(photo)}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "rgba(0,0,0,0.5)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Share size={26} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSaveToDevice(photo)}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "rgba(0,0,0,0.5)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Download size={26} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => deletePhoto(photo.id)}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "rgba(255,107,107,0.8)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2 size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </GestureDetector>
    );
  }

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}>
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 24,
            paddingBottom: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={goBack}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isDark ? "#1A1A1A" : "#F0F0F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft size={24} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 24,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#fff" : "#000",
              }}
            >
              {t('gallery')}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#CCCCCC" : "#666",
                marginTop: 2,
              }}
            >
              {photos.length} {photos.length !== 1 ? t('photos') : t('photo')}
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#CCCCCC" : "#666",
              }}
            >
              {t('loading')}
            </Text>
          </View>
        ) : photos.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 40,
            }}
          >
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: isDark ? "#1A1A1A" : "#F0F0F0",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <Camera size={48} color={isDark ? "#666" : "#999"} />
            </View>

            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#fff" : "#000",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              {t('noPhotos')}
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_400Regular",
                color: isDark ? "#CCCCCC" : "#666",
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              {t('startCapturingMoments')}
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/camera/")}
              style={{
                backgroundColor: "#FF6B6B",
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 25,
                marginTop: 32,
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                {t('takePhoto')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDark ? "#fff" : "#000"}
              />
            }
          >
            {/* Photo Grid */}
            <View
              style={{
                paddingHorizontal: 24,
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {photos.map((photo, index) => {
                // Calculer les dimensions pour la miniature en format 4:3
                const thumbnailWidth = (screenWidth - 48 - 8) / 2;
                const thumbnailHeight = thumbnailWidth * (4 / 3);

                return (
                  <TouchableOpacity
                    key={photo.id}
                    onPress={() => {
                      triggerLightHaptic();
                      setSelectedPhoto(photo.id);
                    }}
                    style={{
                      width: thumbnailWidth,
                      height: thumbnailHeight,
                      borderRadius: 16,
                      overflow: "hidden",
                      marginBottom: 12,
                      position: "relative",
                      backgroundColor: isDark ? "#1A1A1A" : "#F0F0F0",
                    }}
                    activeOpacity={0.9}
                  >
                    {/* Photo principale */}
                    <Image
                      source={{ uri: photo.uri }}
                      style={{
                        width: "100%",
                        height: "100%",
                        transform: photo.isComposite ? [] : [
                          {
                            // Pour la galerie : inverser la logique pour correspondre au carrousel (miniatures)
                            // Sauf si c'est une image composite (déjà dans la bonne orientation)
                            scaleX: photo.cameraSettings?.mirrorEnabled
                              ? -1
                              : 1,
                          },
                        ],
                      }}
                      contentFit="cover"
                      transition={200}
                    />

                    {/* Memes sur la miniature (seulement si pas déjà fusionnés) */}
                    {!photo.isComposite && photo.memes &&
                      photo.memes.map((meme) => {
                        // Calculer les positions relatives à la taille de la miniature
                        const scaleX =
                          thumbnailWidth / cameraLayout.cameraWidth;
                        const scaleY =
                          thumbnailHeight / cameraLayout.cameraHeight;

                        const scaledX = meme.x * scaleX;
                        const scaledY = meme.y * scaleY;
                        const scaledWidth =
                          meme.width * scaleX * (meme.scale || 1);
                        const scaledHeight =
                          meme.height * scaleY * (meme.scale || 1);

                        return (
                          <View
                            key={meme.id}
                            style={{
                              position: "absolute",
                              left: scaledX,
                              top: scaledY,
                              width: scaledWidth,
                              height: scaledHeight,
                              zIndex: 2,
                            }}
                          >
                            <Image
                              source={{ uri: meme.url }}
                              style={{ width: "100%", height: "100%" }}
                              contentFit="contain"
                              transition={200}
                            />
                          </View>
                        );
                      })}

                    {/* Favorite indicator */}
                    {photo.favorite && (
                      <View
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 3,
                        }}
                      >
                        <Heart size={16} color="#FF6B6B" fill="#FF6B6B" />
                      </View>
                    )}

                    {/* Date */}
                    <View
                      style={{
                        position: "absolute",
                        bottom: 12,
                        left: 12,
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        zIndex: 3,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 10,
                          fontFamily: "Inter_600SemiBold",
                        }}
                      >
                        {formatDate(photo.timestamp)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Stats */}
            {photos.length > 0 && (
              <View
                style={{
                  marginTop: 24,
                  paddingHorizontal: 24,
                  paddingVertical: 20,
                  backgroundColor: isDark ? "#1A1A1A" : "#F9F9F9",
                  marginHorizontal: 24,
                  borderRadius: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    alignItems: "center",
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 24,
                        fontFamily: "Inter_600SemiBold",
                        color: "#FF6B6B",
                      }}
                    >
                      {photos.length}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_400Regular",
                        color: isDark ? "#CCCCCC" : "#666",
                        marginTop: 4,
                      }}
                    >
                      {t('photos')}
                    </Text>
                  </View>

                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 24,
                        fontFamily: "Inter_600SemiBold",
                        color: "#FF6B6B",
                      }}
                    >
                      {photos.filter((p) => p.favorite).length}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_400Regular",
                        color: isDark ? "#CCCCCC" : "#666",
                        marginTop: 4,
                      }}
                    >
                      {t('favorites')}
                    </Text>
                  </View>

                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 24,
                        fontFamily: "Inter_600SemiBold",
                        color: "#FF6B6B",
                      }}
                    >
                      {Math.ceil(photos.length / 4)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_400Regular",
                        color: isDark ? "#CCCCCC" : "#666",
                        marginTop: 4,
                      }}
                    >
                      {t('sessions')}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </GestureDetector>
  );
}

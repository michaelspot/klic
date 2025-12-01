import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  useColorScheme,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Plus,
  Crown,
  Check,
  Upload,
  Grid3X3,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { savePermanentTemplate } from "../../utils/permanentStorage";
import { useTranslation } from "../../hooks/useTranslation";
import { getTemplateName } from "../../utils/i18n";

const { width: screenWidth } = Dimensions.get("window");
const templateWidth = (screenWidth - 48 - 16) / 2;

export default function TemplateSelector() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customTemplates, setCustomTemplates] = useState([]);

  // Color palette
  const colors = {
    lavender: "rgb(220,195,217)",
    yellowOrange: "rgb(254,199,110)",
    peach: "rgb(246,196,170)",
    rosePale: "rgb(236,195,195)",
    yellowPastel: "rgb(252,197,140)",
  };

  // Mock templates data
  const [predefinedTemplates] = useState([
    {
      id: "none",
      name: "Aucun template",
      preview: null,
      isPremium: false,
      description: "Photos simples sans template",
      isCustom: false,
      photoCount: 1,
    },
    {
      id: "collage-4",
      name: "Collage Carré",
      preview: "https://picsum.photos/400/400?random=20",
      isPremium: false,
      description: "4 photos en carré",
      isCustom: false,
      slots: [
        {
          id: 1,
          topLeft: { x: 0.05, y: 0.05 },
          topRight: { x: 0.45, y: 0.05 },
          bottomLeft: { x: 0.05, y: 0.45 },
          bottomRight: { x: 0.45, y: 0.45 },
        },
        {
          id: 2,
          topLeft: { x: 0.55, y: 0.05 },
          topRight: { x: 0.95, y: 0.05 },
          bottomLeft: { x: 0.55, y: 0.45 },
          bottomRight: { x: 0.95, y: 0.45 },
        },
        {
          id: 3,
          topLeft: { x: 0.05, y: 0.55 },
          topRight: { x: 0.45, y: 0.55 },
          bottomLeft: { x: 0.05, y: 0.95 },
          bottomRight: { x: 0.45, y: 0.95 },
        },
        {
          id: 4,
          topLeft: { x: 0.55, y: 0.55 },
          topRight: { x: 0.95, y: 0.55 },
          bottomLeft: { x: 0.55, y: 0.95 },
          bottomRight: { x: 0.95, y: 0.95 },
        },
      ],
      photoCount: 4,
    },
    {
      id: "polaroid",
      name: "Style Polaroid",
      preview: "https://picsum.photos/400/500?random=21",
      isPremium: true,
      description: "Effet photo instantané",
      isCustom: false,
    },
    {
      id: "magazine",
      name: "Magazine",
      preview: "https://picsum.photos/400/600?random=22",
      isPremium: true,
      description: "Mise en page magazine",
      isCustom: false,
    },
    {
      id: "vintage",
      name: "Vintage",
      preview: "https://picsum.photos/400/500?random=23",
      isPremium: true,
      description: "Style rétro années 90",
      isCustom: false,
    },
    {
      id: "minimal",
      name: "Minimaliste",
      preview: "https://picsum.photos/400/600?random=24",
      isPremium: false,
      description: "Design épuré",
      isCustom: false,
    },
  ]);

  const [isPremium] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    loadCustomTemplates();
    loadSelectedTemplate();
  }, []);

  const loadCustomTemplates = async () => {
    try {
      const templatesData = await AsyncStorage.getItem(
        "thismoment_custom_templates",
      );
      if (templatesData) {
        const templates = JSON.parse(templatesData);
        console.log("Custom templates chargés:", templates);
        setCustomTemplates(templates);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des templates custom:", error);
    }
  };

  const loadSelectedTemplate = async () => {
    try {
      const selectedData = await AsyncStorage.getItem(
        "thismoment_selected_template",
      );
      if (selectedData) {
        const template = JSON.parse(selectedData);
        console.log("Template sélectionné chargé:", template);
        setSelectedTemplate(template.id);
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement du template sélectionné:",
        error,
      );
    }
  };

  // Combine predefined and custom templates
  const allTemplates = [...predefinedTemplates, ...customTemplates];

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }} />
    );
  }

  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const selectTemplate = async (template) => {
    handleHapticFeedback();

    if (template.isPremium && !isPremium) {
      Alert.alert(
        t('premiumRequired'),
        t('templateRequiresPremium'),
        [
          { text: t('cancel'), style: "cancel" },
          {
            text: t('viewPremium'),
            onPress: () => router.push("/(tabs)/premium"),
          },
        ],
      );
      return;
    }

    try {
      let finalTemplate = { ...template };

      // Si le template a une image de fond (preview ou backgroundImage), la sauvegarder de façon permanente
      if (template.preview || template.backgroundImage) {
        const imageUri = template.backgroundImage || template.preview;

        // Seulement si ce n'est pas déjà une URI permanente (contient ImageManipulator)
        if (imageUri && !imageUri.includes("ImageManipulator")) {
          console.log("Sauvegarde de l'image de fond du template:", imageUri);

          try {
            // Utiliser saveTemplate pour sauvegarder l'image de façon permanente
            const templateToSave = {
              ...template,
              backgroundImage: imageUri,
              isCustom: template.isCustom || false,
            };

            const savedTemplate = await savePermanentTemplate(templateToSave);
            finalTemplate = savedTemplate;
            console.log(
              "Template avec image permanente sauvegardé:",
              savedTemplate,
            );
          } catch (saveError) {
            console.error(
              "Erreur lors de la sauvegarde de l'image:",
              saveError,
            );
            // Continuer avec le template original si la sauvegarde échoue
          }
        }
      }

      // Sauvegarder le template sélectionné
      await AsyncStorage.setItem(
        "thismoment_selected_template",
        JSON.stringify(finalTemplate),
      );
      console.log("Template sélectionné sauvegardé:", finalTemplate);

      setSelectedTemplate(finalTemplate.id);

      // Retourner à l'écran précédent après 500ms
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.error("Erreur lors de la sélection du template:", error);
      Alert.alert(t('error'), t('unableToSelectTemplate'));
    }
  };

  const createCustomTemplate = () => {
    handleHapticFeedback();
    router.push("/(tabs)/template-creator");
  };

  const TemplateCard = ({ template }) => (
    <TouchableOpacity
      onPress={() => selectTemplate(template)}
      style={{
        width: templateWidth,
        marginBottom: 20,
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <LinearGradient
        colors={
          template.isPremium
            ? [colors.yellowOrange, colors.yellowPastel]
            : [colors.lavender, colors.peach]
        }
        style={{
          padding: 2,
          borderRadius: 20,
        }}
      >
        <View
          style={{
            backgroundColor: isDark
              ? "rgba(0,0,0,0.9)"
              : "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {/* Preview */}
          <View
            style={{
              height: templateWidth * 1.2,
              backgroundColor: isDark ? "#1A1A1A" : "#F5F5F5",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {template.preview ? (
              <Image
                source={{ uri: template.preview }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <Grid3X3 size={40} color={isDark ? "#666" : "#999"} />
            )}

            {/* Premium badge */}
            {template.isPremium && (
              <View
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: colors.yellowOrange,
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                <Crown size={12} color="#000" />
              </View>
            )}

            {/* Selected indicator */}
            {selectedTemplate === template.id && (
              <View
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  backgroundColor: colors.yellowOrange,
                  borderRadius: 12,
                  padding: 4,
                }}
              >
                <Check size={16} color="#000" />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={{ padding: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_700Bold",
                  color: isDark ? "#fff" : "#000",
                  flex: 1,
                }}
              >
                {template.isCustom ? template.name : getTemplateName(template.id)}
              </Text>
              {template.isPremium && !isPremium && (
                <Crown size={14} color={colors.yellowOrange} />
              )}
            </View>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Inter_400Regular",
                color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
              }}
            >
              {template.description}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#F8F9FA" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.1)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => {
              handleHapticFeedback();
              router.back();
            }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            <ArrowLeft size={24} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 24,
                fontFamily: "Inter_700Bold",
                color: isDark ? "#fff" : "#000",
              }}
            >
              Templates
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
              }}
            >
              Choisissez votre style
            </Text>
          </View>
          <TouchableOpacity
            onPress={createCustomTemplate}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Plus size={24} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Create Custom Template Card */}
        <TouchableOpacity
          onPress={createCustomTemplate}
          style={{
            marginBottom: 30,
            borderRadius: 20,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={[colors.yellowOrange, colors.peach]}
            style={{
              padding: 2,
              borderRadius: 20,
            }}
          >
            <View
              style={{
                backgroundColor: isDark
                  ? "rgba(0,0,0,0.9)"
                  : "rgba(255,255,255,0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: 18,
                paddingVertical: 20,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <LinearGradient
                  colors={[colors.yellowOrange, colors.peach]}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 30,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Upload size={28} color="#fff" />
                </LinearGradient>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Inter_700Bold",
                    color: isDark ? "#fff" : "#000",
                    marginBottom: 4,
                  }}
                >
                  Créer votre template
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                  }}
                >
                  Importez votre propre fond et définissez les emplacements
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Templates Grid */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {allTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </View>

        {/* Premium Upsell */}
        {!isPremium && (
          <View
            style={{
              marginTop: 20,
              borderRadius: 20,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={[colors.yellowOrange, colors.yellowPastel]}
              style={{
                padding: 2,
                borderRadius: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: isDark
                    ? "rgba(0,0,0,0.9)"
                    : "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 18,
                  padding: 20,
                  alignItems: "center",
                }}
              >
                <Crown
                  size={40}
                  color={colors.yellowOrange}
                  style={{ marginBottom: 12 }}
                />

                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Inter_600SemiBold",
                    color: isDark ? "#fff" : "#000",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  {t('createYourOwnTemplates')}
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                    textAlign: "center",
                    marginBottom: 16,
                  }}
                >
                  {t('createCustomTemplates')}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    handleHapticFeedback();
                    router.push("/(tabs)/premium");
                  }}
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    alignSelf: "stretch",
                  }}
                >
                  <LinearGradient
                    colors={[colors.yellowOrange, colors.yellowPastel]}
                    style={{
                      paddingVertical: 16,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#000",
                        fontSize: 16,
                        fontFamily: "Inter_700Bold",
                      }}
                    >
                      {t('upgradeToPremiumShort')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

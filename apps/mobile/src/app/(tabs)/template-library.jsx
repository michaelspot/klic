import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { GestureDetector } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeft,
  Plus,
  Crown,
  Grid3X3,
  Upload,
  Star,
  Download,
  Heart,
  Trash2,
  Edit3,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import { useTheme } from "../../hooks/useTheme";
import useSwipeBack from "../../utils/useSwipeBack";
import { savePermanentTemplate } from "../../utils/permanentStorage";
import usePremium from "../../utils/usePremium";
import { getAllPredefinedTemplates } from "../../utils/predefinedTemplates";

const { width: screenWidth } = Dimensions.get("window");
const templateWidth = (screenWidth - 60) / 2; // 2 colonnes avec espacement

export default function TemplateLibrary() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("predefined"); // 'predefined' | 'custom'
  const { isPremium } = usePremium();

  // Geste de retour unifié
  const handleBack = () => {
    handleHapticFeedback();
    router.back();
  };

  const { swipeGesture } = useSwipeBack(handleBack);

  // Templates prédéfinis (depuis le fichier de configuration)
  const [predefinedTemplates] = useState(getAllPredefinedTemplates());

  // Templates créés par l'utilisateur
  const [customTemplates, setCustomTemplates] = useState([]);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_700Bold,
  });

  // Charger les templates personnalisés
  const loadCustomTemplates = useCallback(async () => {
    try {
      const savedTemplates = await AsyncStorage.getItem(
        "thismoment_custom_templates",
      );
      if (savedTemplates) {
        const templates = JSON.parse(savedTemplates);
        setCustomTemplates(
          templates.map((template) => ({
            ...template,
            createdAt: new Date(template.createdAt),
          })),
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des templates:", error);
    }
  }, []);

  useEffect(() => {
    loadCustomTemplates();
  }, [loadCustomTemplates]);

  useFocusEffect(
    useCallback(() => {
      loadCustomTemplates();
    }, [loadCustomTemplates]),
  );

  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const createCustomTemplate = async () => {
    handleHapticFeedback();

    try {
      // Demander permission d'accès à la galerie
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission requise",
          "Nous avons besoin de l'accès à votre galerie pour sélectionner une image.",
        );
        return;
      }

      // Ouvrir la galerie pour sélectionner l'image de fond
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];

        // Créer un nouvel ID unique pour ce template
        const newTemplateId = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log("Création d'un nouveau template avec ID:", newTemplateId);

        // Créer les données du nouveau projet de template
        const newTemplateProject = {
          id: newTemplateId,
          mode: "create",
          backgroundImage: {
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
          },
          templateName: "",
          slots: [],
          selectedSlot: null,
          createdAt: new Date().toISOString(),
        };

        // Nettoyer toutes les données temporaires de projets précédents
        await AsyncStorage.removeItem("thismoment_template_background_image");
        await AsyncStorage.removeItem("thismoment_template_to_edit");
        await AsyncStorage.removeItem("thismoment_current_template_project");

        // Sauvegarder le nouveau projet avec son ID unique
        await AsyncStorage.setItem(
          "thismoment_current_template_project",
          JSON.stringify(newTemplateProject),
        );

        console.log("Nouveau projet de template créé:", newTemplateProject);

        // Naviguer vers le template creator
        router.push(`/(tabs)/template-creator?id=${newTemplateId}&mode=create`);
      }
    } catch (error) {
      console.error("Erreur lors de la création du nouveau template:", error);
      Alert.alert("Erreur", "Impossible de créer le nouveau template");
    }
  };

  const selectTemplate = async (template) => {
    handleHapticFeedback();

    if (template.isPremium && !isPremium) {
      Alert.alert(
        "Premium requis",
        "Ce template nécessite un abonnement Premium",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Voir Premium", onPress: () => router.push("/premium") },
        ],
      );
      return;
    }

    try {
      let finalTemplate = {
        id: template.id,
        name: template.name,
        preview: template.preview,
        backgroundImage: template.backgroundImage || template.preview, // Pour les templates custom
        slots: template.slots || [], // Slots pour les templates custom
        isCustom: template.isCustom || false, // Flag pour identifier les templates custom
        photoCount:
          template.photoCount ||
          (template.slots
            ? template.slots.length
            : template.id === "collage-4"
              ? 4
              : template.id === "none"
                ? 4
                : 6), // Nombre de photos selon le template
      };

      // Si le template a une image de fond (preview ou backgroundImage), la sauvegarder de façon permanente
      if (template.preview || template.backgroundImage) {
        const imageUri = template.backgroundImage || template.preview;

        // Seulement si ce n'est pas déjà une URI permanente (contient ImageManipulator)
        if (imageUri && !imageUri.includes("ImageManipulator")) {
          console.log("Sauvegarde de l'image de fond du template:", imageUri);

          try {
            // Utiliser saveTemplate pour sauvegarder l'image de façon permanente
            const templateToSave = {
              ...finalTemplate,
              backgroundImage: imageUri,
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

      console.log("Sauvegarde du template sélectionné:", finalTemplate);

      await AsyncStorage.setItem(
        "thismoment_selected_template",
        JSON.stringify(finalTemplate),
      );
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du template:", error);
    }

    router.push("/(tabs)/camera/");
  };

  const deleteCustomTemplate = async (templateId) => {
    Alert.alert(
      "Supprimer le template",
      "Êtes-vous sûr de vouloir supprimer ce template ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedTemplates = customTemplates.filter(
                (t) => t.id !== templateId,
              );
              setCustomTemplates(updatedTemplates);

              // Sauvegarder dans AsyncStorage
              await AsyncStorage.setItem(
                "thismoment_custom_templates",
                JSON.stringify(updatedTemplates),
              );

              handleHapticFeedback();
            } catch (error) {
              console.error("Erreur lors de la suppression:", error);
              Alert.alert("Erreur", "Impossible de supprimer le template.");
            }
          },
        },
      ],
    );
  };

  const editCustomTemplate = async (template) => {
    handleHapticFeedback();

    try {
      console.log("Préparation de l'édition du template:", template);

      // Créer un projet d'édition avec l'ID du template existant
      const editTemplateProject = {
        id: template.id, // Garder l'ID original du template
        mode: "edit",
        originalTemplateId: template.id, // Sauvegarder l'ID original pour référence
        backgroundImage: template.backgroundImage
          ? typeof template.backgroundImage === "string"
            ? { uri: template.backgroundImage }
            : template.backgroundImage
          : { uri: template.preview },
        templateName: template.name || "",
        slots: template.slots || [],
        selectedSlot: null,
        createdAt: template.createdAt,
        photoCount:
          template.photoCount || (template.slots ? template.slots.length : 0),
        isCustom: template.isCustom,
      };

      // Nettoyer les données temporaires précédentes
      await AsyncStorage.removeItem("thismoment_template_background_image");
      await AsyncStorage.removeItem("thismoment_template_to_edit");
      await AsyncStorage.removeItem("thismoment_current_template_project");

      // Sauvegarder le projet d'édition
      await AsyncStorage.setItem(
        "thismoment_current_template_project",
        JSON.stringify(editTemplateProject),
      );

      console.log("Projet d'édition créé:", editTemplateProject);

      // Naviguer vers le template creator avec les paramètres appropriés
      router.push(`/(tabs)/template-creator?id=${template.id}&mode=edit`);
    } catch (error) {
      console.error("Erreur lors de la préparation de l'édition:", error);
      Alert.alert("Erreur", "Impossible de modifier ce template");
    }
  };

  const TemplateCard = ({ template, onLongPress = null }) => (
    <TouchableOpacity
      onPress={() => selectTemplate(template)}
      onLongPress={onLongPress}
      style={{
        width: templateWidth,
        marginBottom: 20,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: isDark ? "#1A1A1A" : "#F9F9F9",
        borderWidth: template.isPremium ? 2 : 0,
        borderColor: template.isPremium ? "#FF9500" : "transparent",
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
              backgroundColor: "#FF9500",
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Crown size={12} color="#fff" />
          </View>
        )}

        {/* Boutons pour templates custom */}
        {template.isCustom && (
          <View
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              flexDirection: "row",
              gap: 8,
            }}
          >
            {/* Bouton Modifier */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                editCustomTemplate(template);
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255, 149, 0, 0.9)",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.8}
            >
              <Edit3 size={16} color="#fff" />
            </TouchableOpacity>

            {/* Bouton Supprimer */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                deleteCustomTemplate(template.id);
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255, 59, 48, 0.9)",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.8}
            >
              <Trash2 size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ padding: 12 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#fff" : "#000",
            marginBottom: 4,
          }}
        >
          {template.name}
        </Text>

        {/* Date pour templates custom */}
        {template.isCustom && template.createdAt && (
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#CCCCCC" : "#666",
            }}
          >
            Créé le {template.createdAt.toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}>
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Header unifié */}
        <View
          style={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 24,
            paddingBottom: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: isDark ? "#000" : "#fff",
          }}
        >
          <TouchableOpacity
            onPress={handleBack}
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
              Templates
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        {/* Tabs */}
        <View
          style={{
            paddingHorizontal: 24,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              backgroundColor: isDark ? "#1A1A1A" : "#F9F9F9",
              borderRadius: 16,
              padding: 4,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                handleHapticFeedback();
                setActiveTab("predefined");
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor:
                  activeTab === "predefined"
                    ? isDark
                      ? "#fff"
                      : "#fff"
                    : "transparent",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color:
                    activeTab === "predefined"
                      ? "#000"
                      : isDark
                        ? "#CCCCCC"
                        : "#666",
                }}
              >
                Prédéfinis
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                handleHapticFeedback();
                setActiveTab("custom");
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor:
                  activeTab === "custom"
                    ? isDark
                      ? "#fff"
                      : "#fff"
                    : "transparent",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color:
                    activeTab === "custom"
                      ? "#000"
                      : isDark
                        ? "#CCCCCC"
                        : "#666",
                }}
              >
                Mes créations
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "custom" && (
            /* Create Custom Template Card */
            <TouchableOpacity
              onPress={createCustomTemplate}
              style={{
                marginBottom: 30,
                borderRadius: 16,
                backgroundColor: "transparent",
                borderWidth: 2,
                borderColor: isDark ? "#666" : "#999",
                borderStyle: "dashed",
                padding: 20,
                flexDirection: "row",
                alignItems: "center",
              }}
              activeOpacity={0.8}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: isDark ? "#666" : "#999",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <Upload size={28} color={isDark ? "#fff" : "#fff"} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Inter_600SemiBold",
                    color: isDark ? "#fff" : "#000",
                    marginBottom: 4,
                  }}
                >
                  Créer un template
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: isDark ? "#CCCCCC" : "#666",
                  }}
                >
                  Utilisez une photo de votre galerie
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Templates Grid */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {(activeTab === "predefined"
              ? predefinedTemplates
              : customTemplates
            ).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onLongPress={
                  template.isCustom
                    ? () => deleteCustomTemplate(template.id)
                    : null
                }
              />
            ))}
          </View>

          {/* Empty state pour templates custom */}
          {activeTab === "custom" && customTemplates.length === 0 && (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 60,
              }}
            >
              <Grid3X3 size={60} color={isDark ? "#333" : "#ccc"} />
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#CCCCCC" : "#666",
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                Aucun template personnalisé
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#666" : "#999",
                  marginTop: 8,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Créez votre premier template en ajoutant{"\n"}une image de votre
                galerie
              </Text>
            </View>
          )}

          {/* Premium Upsell */}
          {activeTab === "predefined" && !isPremium && (
            <View
              style={{
                backgroundColor: isDark ? "#2A1F0F" : "#FFF9E6",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isDark ? "#4A3B1F" : "#FFE4A3",
                padding: 20,
                marginTop: 20,
                alignItems: "center",
              }}
            >
              <Crown size={40} color="#FF9500" style={{ marginBottom: 12 }} />

              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Inter_600SemiBold",
                  color: isDark ? "#fff" : "#000",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Débloquez tous les templates
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#CCCCCC" : "#666",
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                Accédez à plus de 50 templates exclusifs Premium
              </Text>

              <TouchableOpacity
                onPress={() => {
                  handleHapticFeedback();
                  router.push("/premium");
                }}
                style={{
                  backgroundColor: "#FF9500",
                  borderRadius: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  alignSelf: "stretch",
                  alignItems: "center",
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
                  Essai gratuit 3 jours
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </GestureDetector>
  );
}

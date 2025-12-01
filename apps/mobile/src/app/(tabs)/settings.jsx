import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { GestureDetector } from "react-native-gesture-handler";
import {
  ArrowLeft,
  Timer,
  Camera,
  Crown,
  HelpCircle,
  Shield,
  Info,
  Globe,
  CreditCard,
  Grid,
  Plus,
  Minus,
  Palette,
  Lock,
  Play,
  Sparkles,
  FileText,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import useSwipeBack from "../../utils/useSwipeBack";
import { usePremium } from "../../utils/usePremium";
import Host from "../../components/ui/Host";
import Form from "../../components/ui/Form";
import Section from "../../components/ui/Section";
import Switch from "../../components/ui/Switch";
import Row from "../../components/ui/Row";

export default function Settings() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { t, changeLanguage } = useTranslation();
  const router = useRouter();
  const { isPremium, loading: premiumLoading } = usePremium();

  // Settings state - synchronisé avec la caméra
  const [settings, setSettings] = useState({
    timer: 3,
    photoCount: 4,
    photoboothMode: false, // Nouveau paramètre
    cleanMode: false, // Mode épuré - nouveau paramètre
    flash: false,
    grid: false,
    mirror: false,
    autoSave: true,
    hapticFeedback: true,
    language: "FR",
    theme: "auto",
  });

  // Geste de retour
  const handleBack = () => {
    handleHapticFeedback();
    router.push("/(tabs)/camera/");
  };

  const { swipeGesture } = useSwipeBack(handleBack);

  // Charger les paramètres depuis AsyncStorage au montage
  useEffect(() => {
    loadSettings();
  }, []);

  // Recharger les paramètres quand on revient sur la page
  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, []),
  );

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("thismoment_settings");
      if (savedSettings) {
        const loadedSettings = JSON.parse(savedSettings);
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres:", error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(
        "thismoment_settings",
        JSON.stringify(newSettings),
      );
      setSettings(newSettings);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
    }
  };

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleHapticFeedback = async () => {
    try {
      // Toujours vérifier le paramètre depuis AsyncStorage pour s'assurer qu'il est à jour
      const savedSettings = await AsyncStorage.getItem("thismoment_settings");
      let currentHapticSetting = true; // Valeur par défaut

      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        currentHapticSetting = settings.hapticFeedback !== false; // Par défaut activé
      }

      if (currentHapticSetting) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du retour haptique:",
        error,
      );
      // En cas d'erreur, ne pas déclencher le retour haptique
    }
  };

  const adjustTimer = async (direction) => {
    await handleHapticFeedback();
    const currentTimer = settings.timer !== undefined ? settings.timer : 3;
    let newTimer;

    // Utilisateurs gratuits : limité à 0, 3, 5 secondes
    const freeTimers = [0, 3, 5];
    
    if (!isPremium) {
      const currentIndex = freeTimers.indexOf(currentTimer);
      if (direction === "plus") {
        if (currentIndex < freeTimers.length - 1) {
          newTimer = freeTimers[currentIndex + 1];
        } else {
          // Afficher un message pour débloquer
          Alert.alert(
            t('premiumFeatureTitle'),
            t('unlockMoreTimerOptions'),
            [
              { text: t('cancel'), style: "cancel" },
              { text: t('viewPremium'), onPress: () => router.push("/(tabs)/premium") }
            ]
          );
          return;
        }
      } else {
        if (currentIndex > 0) {
          newTimer = freeTimers[currentIndex - 1];
        } else {
          newTimer = currentTimer;
        }
      }
    } else {
      // Utilisateurs premium : 0-10 secondes
      if (direction === "plus") {
        if (currentTimer < 10) {
          newTimer = currentTimer + 1;
        } else {
          newTimer = currentTimer;
        }
      } else {
        if (currentTimer > 0) {
          newTimer = currentTimer - 1;
        } else {
          newTimer = currentTimer;
        }
      }
    }

    updateSetting("timer", newTimer);
  };

  const adjustPhotoCount = async (direction) => {
    handleHapticFeedback();
    
    // Utilisateurs gratuits : nombre de photos dépend du template uniquement
    if (!isPremium) {
      Alert.alert(
        t('premiumFeatureTitle'),
        t('photoCountLockedByTemplate'),
        [
          { text: t('cancel'), style: "cancel" },
          { text: t('viewPremium'), onPress: () => router.push("/(tabs)/premium") }
        ]
      );
      return;
    }
    
    const currentCount = settings.photoCount;
    let newCount;

    if (direction === "plus") {
      if (currentCount < 8) {
        newCount = currentCount + 1;
      } else {
        newCount = currentCount;
      }
    } else {
      if (currentCount > 1) {
        newCount = currentCount - 1;
      } else {
        newCount = currentCount;
      }
    }

    // Mettre à jour les paramètres
    const newSettings = { ...settings, photoCount: newCount };
    await saveSettings(newSettings);

    // Vérifier et gérer le template automatiquement
    await checkAndHandleTemplateCompatibility(newCount);
  };

  // Fonction pour vérifier la compatibilité du template avec le nouveau nombre de photos
  const checkAndHandleTemplateCompatibility = async (newPhotoCount) => {
    try {
      console.log(
        `Vérification compatibilité template avec ${newPhotoCount} photos`,
      );

      // Charger le template actuel
      const savedTemplate = await AsyncStorage.getItem(
        "thismoment_selected_template",
      );

      if (savedTemplate) {
        const templateData = JSON.parse(savedTemplate);
        console.log("Template actuel:", templateData);

        // Ignorer si c'est déjà "Aucun template"
        if (templateData.id === "none") {
          console.log("✅ Déjà sur 'Aucun template', pas d'alerte nécessaire");
          return;
        }

        // Calculer le nombre de photos du template
        const templatePhotoCount = templateData.slots
          ? templateData.slots.length
          : templateData.photoCount || 4;

        console.log(
          `Template photos: ${templatePhotoCount}, Nouveau paramètre: ${newPhotoCount}`,
        );

        // Si le nouveau nombre ne correspond plus au template
        if (newPhotoCount !== templatePhotoCount) {
          console.log("❌ Incompatibilité détectée - demande de confirmation");

          // Demander confirmation à l'utilisateur avec possibilité d'annuler
          Alert.alert(
            t('templateModified'),
            t('templateModifiedMessage').replace('{count}', newPhotoCount),
            [
              {
                text: t('cancel'),
                style: 'cancel',
                onPress: async () => {
                  // Annuler : remettre l'ancien nombre de photos
                  const oldSettings = { ...settings, photoCount: templatePhotoCount };
                  await saveSettings(oldSettings);
                  console.log("❌ Annulation - nombre de photos restauré");
                },
              },
              {
                text: t('ok'),
                onPress: async () => {
                  // Confirmer : supprimer le template et sélectionner "Aucun template"
                  await AsyncStorage.removeItem("thismoment_selected_template");

                  const noneTemplate = {
                    id: "none",
                    name: t('noneTemplate'),
                    preview: null,
                    backgroundImage: null,
                    slots: [],
                    isCustom: false,
                    photoCount: 1,
                  };

                  await AsyncStorage.setItem(
                    "thismoment_selected_template",
                    JSON.stringify(noneTemplate),
                  );

                  console.log(
                    `✅ Template "${t('noneTemplate')}" sélectionné avec 1 photo`,
                  );
                },
              },
            ],
          );
        } else {
          console.log("✅ Template compatible, aucune modification nécessaire");
        }
      } else {
        console.log("Aucun template sélectionné, rien à vérifier");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du template:", error);
    }
  };

  const handleLanguagePress = () => {
    handleHapticFeedback();
    Alert.alert(t('language'), t('chooseYourLanguage'), [
      { text: "Français", onPress: async () => { await changeLanguage("FR"); updateSetting("language", "FR"); } },
      { text: "English", onPress: async () => { await changeLanguage("EN"); updateSetting("language", "EN"); } },
      { text: "Español", onPress: async () => { await changeLanguage("ES"); updateSetting("language", "ES"); } },
      { text: t('cancel'), style: "cancel" },
    ]);
  };

  return (
    <GestureDetector gesture={swipeGesture}>
      <Host>
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Header - Style copié de la galerie */}
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
              {t('settingsTitle')}
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        <Form>
          <Section title={t('session')}>
            {/* Retardateur avec boutons +/- */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
                paddingHorizontal: 16,
                backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#333" : "#E5E7EB",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <Timer size={22} color="#007AFF" style={{ marginRight: 12 }} />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_500Medium",
                    color: isDark ? "#fff" : "#000",
                  }}
                >
                  {t('timer')}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => adjustTimer("minus")}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isDark ? "#333" : "#F0F0F0",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Minus size={16} color={isDark ? "#fff" : "#000"} />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: isDark ? "#fff" : "#000",
                    minWidth: 32,
                    textAlign: "center",
                  }}
                >
                  {settings.timer ?? 3} s
                </Text>
                <TouchableOpacity
                  onPress={() => adjustTimer("plus")}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isDark ? "#333" : "#F0F0F0",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 12,
                  }}
                >
                  <Plus size={16} color={isDark ? "#fff" : "#000"} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Nombre de photos avec boutons +/- */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
                paddingHorizontal: 16,
                backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#333" : "#E5E7EB",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <Camera size={22} color="#007AFF" style={{ marginRight: 12 }} />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_500Medium",
                    color: isDark ? "#fff" : "#000",
                  }}
                >
                  {t('photoCount')}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {!isPremium && (
                  <Lock size={16} color="#FF8C00" style={{ marginRight: 8 }} />
                )}
                <TouchableOpacity
                  onPress={() => adjustPhotoCount("minus")}
                  disabled={!isPremium}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isDark ? "#333" : "#F0F0F0",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    opacity: !isPremium ? 0.5 : 1,
                  }}
                >
                  <Minus size={16} color={isDark ? "#fff" : "#000"} />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Inter_600SemiBold",
                    color: isDark ? "#fff" : "#000",
                    minWidth: 24,
                    textAlign: "center",
                  }}
                >
                  {settings.photoCount}
                </Text>
                <TouchableOpacity
                  onPress={() => adjustPhotoCount("plus")}
                  disabled={!isPremium}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isDark ? "#333" : "#F0F0F0",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 12,
                    opacity: !isPremium ? 0.5 : 1,
                  }}
                >
                  <Plus size={16} color={isDark ? "#fff" : "#000"} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Photobooth automatique */}
            <Switch
              label={t('photoboothMode')}
              value={isPremium ? settings.photoboothMode : false}
              onValueChange={(value) => {
                if (!isPremium) {
                  Alert.alert(
                    t('premiumFeatureTitle'),
                    t('autoPhotoboothPremium'),
                    [
                      { text: t('cancel'), style: "cancel" },
                      { text: t('viewPremium'), onPress: () => router.push("/(tabs)/premium") }
                    ]
                  );
                  return;
                }
                updateSetting("photoboothMode", value);
              }}
              icon={<Play size={22} color={isPremium ? "#007AFF" : "#999"} />}
              locked={!isPremium}
            />

            {/* Mode épuré */}
            <Switch
              label={t('cleanMode')}
              value={isPremium ? settings.cleanMode : false}
              onValueChange={(value) => {
                if (!isPremium) {
                  Alert.alert(
                    t('premiumFeatureTitle'),
                    t('cleanModePremium'),
                    [
                      { text: t('cancel'), style: "cancel" },
                      { text: t('viewPremium'), onPress: () => router.push("/(tabs)/premium") }
                    ]
                  );
                  return;
                }
                updateSetting("cleanMode", value);
              }}
              icon={<Camera size={22} color={isPremium ? "#007AFF" : "#999"} />}
              locked={!isPremium}
            />

            {/* Secouer pour révéler */}
            <Switch
              label={t('shakeToReveal')}
              value={settings.shakeToReveal}
              onValueChange={(value) => updateSetting("shakeToReveal", value)}
              icon={<Sparkles size={22} color="#007AFF" />}
            />

            {/* Bibliothèque Templates */}
            <Row
              label={t('templateLibrary')}
              value={t('manage')}
              onPress={() => {
                handleHapticFeedback();
                router.push("/(tabs)/template-library");
              }}
              icon={<Grid size={22} color="#007AFF" />}
              style={{ borderBottomWidth: 0 }}
            />
          </Section>

          <Section title={t('cameraSettings')}>
            <Switch
              label={t('flash')}
              value={settings.flash}
              onValueChange={(value) => updateSetting("flash", value)}
            />
            <Switch
              label={t('grid')}
              value={settings.grid}
              onValueChange={(value) => updateSetting("grid", value)}
            />
            <Switch
              label={t('mirror')}
              value={settings.mirror}
              onValueChange={(value) => updateSetting("mirror", value)}
            />
            <Switch
              label={t('autoSave')}
              value={settings.autoSave}
              onValueChange={(value) => updateSetting("autoSave", value)}
              style={{ borderBottomWidth: 0 }}
            />
          </Section>

          <Section title={t('appSettings')}>
            <Switch
              label={t('hapticFeedback')}
              value={settings.hapticFeedback}
              onValueChange={(value) => updateSetting("hapticFeedback", value)}
            />
            <Row
              label={t('language')}
              value={settings.language}
              onPress={handleLanguagePress}
              icon={<Globe size={22} color="#007AFF" />}
              style={{ borderBottomWidth: 0 }}
            />
          </Section>

          <Section title={t('premium')}>
            {!isPremium ? (
              <Row
                label={t('premiumTitle')}
                value={t('unlock')}
                onPress={() => router.push("/(tabs)/premium")}
                icon={<Crown size={22} color="#FF9500" />}
                style={{ borderBottomWidth: 0 }}
              />
            ) : (
              <Row
                label={t('premium')}
                value={t('manage')}
                onPress={() => router.push("/(tabs)/premium")}
                icon={<Crown size={22} color="#FF9500" />}
                style={{ borderBottomWidth: 0 }}
              />
            )}
          </Section>

          <Section title={t('support')}>
            <Row
              label={t('help')}
              onPress={() => {
                Alert.alert(
                  t('help'),
                  t('helpMessage'),
                  [
                    {
                      text: t('contactMe'),
                      onPress: () => Linking.openURL('mailto:charly.klopoff@gmail.com?subject=Aide ThisMoment')
                    },
                    { text: t('cancel'), style: "cancel" }
                  ]
                );
              }}
              icon={<HelpCircle size={22} color="#007AFF" />}
            />
            <Row
              label={t('privacy')}
              onPress={() =>
                Linking.openURL('https://www.notion.so/PRIVACY-POLICY-287a7f71a89780b79819ed509024f373')
              }
              icon={<Shield size={22} color="#007AFF" />}
            />
            <Row
              label={t('termsOfUse')}
              onPress={() =>
                Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')
              }
              icon={<FileText size={22} color="#007AFF" />}
            />
            <Row
              label={t('about')}
              onPress={() =>
                Alert.alert(t('about'), t('aboutText'))
              }
              icon={<Info size={22} color="#007AFF" />}
              style={{ borderBottomWidth: 0 }}
            />
          </Section>
        </Form>
      </Host>
    </GestureDetector>
  );
}

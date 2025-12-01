import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  ArrowLeft,
  Crown,
  Check,
  Camera,
  Wand2,
  Timer,
  Sparkles,
  Palette,
  Zap,
  ExternalLink,
} from "lucide-react-native";
import {
  useFonts,
  Inter_600SemiBold,
  Inter_400Regular,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import useSwipeBack from "../../utils/useSwipeBack";
import { useRevenueCat } from "../../hooks/useRevenueCat";
import { formatPrice, reformatPriceString } from "../../utils/i18n";

export default function Premium() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(3);

  const {
    isPremium,
    offerings,
    isLoading: subscriptionLoading,
    isPurchasing,
    currentSubscription,
    purchase,
    restore,
  } = useRevenueCat();

  // Initialiser selectedPlan avec l'abonnement actuel si premium
  useEffect(() => {
    if (isPremium && currentSubscription) {
      setSelectedPlan(currentSubscription);
    }
  }, [isPremium, currentSubscription]);

  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
  });

  // Geste de retour unifié
  const handleBack = () => {
    handleHapticFeedback();
    router.back();
  };

  const { swipeGesture } = useSwipeBack(handleBack);

  // Si l'utilisateur est déjà premium, ne pas rediriger mais afficher un message différent
  // useEffect(() => {
  //   if (isPremium && !subscriptionLoading) {
  //     Alert.alert(
  //       "Déjà Premium !",
  //       "Vous avez déjà un abonnement Premium actif.",
  //       [{ text: "OK", onPress: () => router.back() }],
  //     );
  //   }
  // }, [isPremium, subscriptionLoading, router]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }} />
    );
  }

  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePurchase = async () => {
    if (isPurchasing || subscriptionLoading || !offerings) return;

    handleHapticFeedback();

    try {
      // Mapper le plan sélectionné au bon identifier RevenueCat
      const packageIdentifierMap = {
        'weekly': '$rc_weekly',
        'monthly': '$rc_monthly',
        'yearly': '$rc_annual', // yearly → annual dans RevenueCat
      };

      // Trouver le package correspondant au plan sélectionné
      const packageToPurchase = offerings.availablePackages.find(
        pkg => pkg.identifier === packageIdentifierMap[selectedPlan]
      );

      if (!packageToPurchase) {
        Alert.alert(t('error'), t('packageNotFound'));
        return;
      }

      const result = await purchase(packageToPurchase);
      
      if (result.success) {
        Alert.alert(t('success'), isPremium ? t('subscriptionModified') : t('youAreNowPremium'), [
          { text: t('ok'), onPress: () => router.push("/(tabs)/settings") }
        ]);
      } else if (!result.cancelled) {
        Alert.alert(t('error'), t('purchaseError'));
      }
    } catch (error) {
      console.error("Purchase error:", error);
      Alert.alert(t('error'), t('purchaseError'));
    }
  };

  const handleRefundRequest = () => {
    handleHapticFeedback();
    Alert.alert(
      t('requestRefund'),
      t('refundMessage'),
      [
        { text: t('cancel'), style: "cancel" },
        {
          text: t('continue'),
          onPress: () => {
            Linking.openURL("https://reportaproblem.apple.com");
          }
        }
      ]
    );
  };

  const handleRestorePurchases = async () => {
    handleHapticFeedback();

    try {
      const result = await restore();
      
      if (result.success) {
        Alert.alert(t('success'), t('purchasesRestored'));
      } else {
        Alert.alert(t('info'), t('noPurchasesToRestore'));
      }
    } catch (error) {
      console.error("Restore error:", error);
      Alert.alert(t('error'), t('restoreError'));
    }
  };

  // Générer les plans - utiliser les vrais prix de RevenueCat si disponibles
  // Ces prix de fallback sont temporaires. Les vrais prix viennent de RevenueCat.
  let plans = [
    {
      id: "weekly",
      title: t('weekly'),
      price: formatPrice(5.99, 'weekly'),
      period: t('perWeek'),
      badge: null,
    },
    {
      id: "monthly",
      title: t('monthly'),
      price: formatPrice(9.99, 'monthly'),
      period: t('perMonth'),
      badge: t('popular'),
    },
    {
      id: "yearly",
      title: t('yearly'),
      price: formatPrice(99.99, 'yearly'),
      period: t('perYear'),
      badge: t('bestValue'),
    },
  ];

  // Si les offerings sont disponibles, utiliser les vrais prix
  if (offerings?.availablePackages) {
    const packageMap = {
      '$rc_weekly': { id: 'weekly', title: t('weekly'), period: t('perWeek'), badge: null },
      '$rc_monthly': { id: 'monthly', title: t('monthly'), period: t('perMonth'), badge: t('popular') },
      '$rc_annual': { id: 'yearly', title: t('yearly'), period: t('perYear'), badge: t('bestValue') },
    };

    const revenueCatPlans = offerings.availablePackages
      .filter(pkg => packageMap[pkg.identifier])
      .map(pkg => ({
        ...packageMap[pkg.identifier],
        price: reformatPriceString(pkg.product.priceString),
      }));

    if (revenueCatPlans.length > 0) {
      // Forcer l'ordre: Weekly, Monthly, Yearly
      const orderedPlans = [];
      const planOrder = ['weekly', 'monthly', 'yearly'];
      
      planOrder.forEach(planId => {
        const plan = revenueCatPlans.find(p => p.id === planId);
        if (plan) orderedPlans.push(plan);
      });
      
      plans = orderedPlans;
    }
  }

  // Nouveau composant PlanCard horizontal avec animation
  const HorizontalPlanCard = ({ plan, isSelected, onPress }) => {
    const scaleValue = useSharedValue(1);
    const borderColorValue = useSharedValue(0);

    const animatedCardStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scaleValue.value }],
        borderColor: isSelected
          ? "#FF8C00" // Orange
          : isDark
            ? "rgba(255, 140, 0, 0.2)"
            : "rgba(255, 140, 0, 0.1)",
      };
    });

    const handlePress = () => {
      // Animation de press
      scaleValue.value = withSpring(0.95, { duration: 150 }, () => {
        scaleValue.value = withSpring(1, { duration: 150 });
      });
      onPress();
    };

    React.useEffect(() => {
      // Animation de sélection
      if (isSelected) {
        scaleValue.value = withSpring(1.02, { duration: 200 }, () => {
          scaleValue.value = withSpring(1, { duration: 200 });
        });
      }
    }, [isSelected]);

    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={{ flex: 1, marginHorizontal: 4 }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: isSelected
                ? isDark
                  ? "#2A1A00"
                  : "#FFF8E1"
                : isDark
                  ? "#1A1A1A"
                  : "#F9F9F9",
              borderRadius: 16,
              padding: 16,
              paddingTop: 24,
              minHeight: 110,
              borderWidth: 2,
              shadowColor: isSelected ? "#FF8C00" : "#000",
              shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
              shadowOpacity: isSelected ? 0.3 : 0.1,
              shadowRadius: isSelected ? 8 : 4,
              elevation: isSelected ? 8 : 4,
            },
            animatedCardStyle,
          ]}
        >
          {/* Badge en haut */}
          {plan.badge && (
            <View
              style={{
                position: "absolute",
                top: -8,
                left: 12,
                right: 12,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "#FF8C00",
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 10,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  {plan.badge}
                </Text>
              </View>
            </View>
          )}

          {/* Titre */}
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Inter_600SemiBold",
              color: isSelected ? "#FF8C00" : isDark ? "#fff" : "#000",
              textAlign: "center",
              marginTop: 4,
              marginBottom: 8,
            }}
          >
            {plan.title}
          </Text>

          {/* Prix */}
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Inter_600SemiBold",
              color: isDark ? "#fff" : "#000",
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            {plan.price}
          </Text>

          {/* Période */}
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter_400Regular",
              color: isDark ? "#CCCCCC" : "#666",
              textAlign: "center",
            }}
          >
            {plan.period}
          </Text>

        </Animated.View>
      </TouchableOpacity>
    );
  };

  const features = [
    {
      icon: Sparkles,
      title: t('noWatermarkFeature'),
      description: t('noWatermarkDescription'),
    },
    {
      icon: Wand2,
      title: t('customTemplatesFeature'),
      description: t('createYourOwnTemplatesDescription'),
    },
    {
      icon: Crown,
      title: t('premiumTemplatesFeature'),
      description: t('premiumTemplatesDescription'),
    },
    {
      icon: Timer,
      title: t('advancedTimersFeature'),
      description: t('advancedTimersDescription'),
    },
    {
      icon: Camera,
      title: t('autoModeFeature'),
      description: t('autoModeDescription'),
    },
    {
      icon: Palette,
      title: t('premiumThemesFeature'),
      description: t('premiumThemesDescription'),
    },
  ];

  const FeatureItem = ({ feature }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isDark ? "#2A1A00" : "#FFF8E1",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        }}
      >
        <feature.icon size={20} color="#FF8C00" />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Inter_600SemiBold",
            color: isDark ? "#fff" : "#000",
            marginBottom: 2,
          }}
        >
          {feature.title}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: isDark ? "#CCCCCC" : "#666",
          }}
        >
          {feature.description}
        </Text>
      </View>
    </View>
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
              Premium
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Plans - Disposition horizontale */}
          <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#fff" : "#000",
                marginBottom: 16,
              }}
            >
              {t('choosePlan')}
            </Text>

            <View style={{ flexDirection: "row", marginHorizontal: -4 }}>
              {plans.map((plan) => (
                <HorizontalPlanCard
                  key={plan.id}
                  plan={plan}
                  isSelected={selectedPlan === plan.id}
                  onPress={() => {
                    handleHapticFeedback();
                    setSelectedPlan(plan.id);
                  }}
                />
              ))}
            </View>
          </View>

          {/* Features */}
          <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Inter_600SemiBold",
                color: isDark ? "#fff" : "#000",
                marginBottom: 16,
              }}
            >
              {t('premiumFeatures')}
            </Text>

            {features.map((feature, index) => (
              <FeatureItem key={index} feature={feature} />
            ))}
          </View>

          {/* CTA */}
          <View style={{ paddingHorizontal: 24 }}>
            <TouchableOpacity
              onPress={handlePurchase}
              disabled={isPurchasing || subscriptionLoading || !offerings || (isPremium && selectedPlan === currentSubscription)}
              style={{
                backgroundColor: isPremium && selectedPlan === currentSubscription ? "#34C759" : "#FF8C00",
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                opacity: (isPurchasing || subscriptionLoading || !offerings || (isPremium && selectedPlan === currentSubscription)) ? 0.7 : 1,
                shadowColor: isPremium && selectedPlan === currentSubscription ? "#34C759" : "#FF8C00",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                flexDirection: "row",
                gap: 8,
              }}
              activeOpacity={0.8}
            >
              {isPurchasing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  {subscriptionLoading 
                    ? t('loading')
                    : isPremium && selectedPlan === currentSubscription
                      ? "✓ " + t('currentSubscription')
                      : isPremium
                        ? t('chooseThisSubscription')
                        : t('startNow')}
                </Text>
              )}
            </TouchableOpacity>

            {!isPremium && (
              <TouchableOpacity
                onPress={handleRestorePurchases}
                disabled={isPurchasing || subscriptionLoading}
                style={{
                  alignItems: "center",
                  paddingVertical: 12,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: isDark ? "#CCCCCC" : "#666",
                    fontSize: 16,
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  {t('restorePurchases')}
                </Text>
              </TouchableOpacity>
            )}

            {isPremium && (
              <TouchableOpacity
                onPress={handleRefundRequest}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 12,
                  marginTop: 8,
                }}
              >
                <ExternalLink size={16} color={isDark ? "#CCCCCC" : "#666"} style={{ marginRight: 6 }} />
                <Text
                  style={{
                    color: isDark ? "#CCCCCC" : "#666",
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  {t('requestRefund')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Terms and Privacy Links */}
            <View style={{ marginTop: 20, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter_400Regular",
                  color: isDark ? "#666" : "#999",
                  textAlign: "center",
                  lineHeight: 18,
                  marginBottom: 12,
                }}
              >
                {t('subscriptionRenews')}
              </Text>
              
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <TouchableOpacity
                  onPress={() => {
                    handleHapticFeedback();
                    Linking.openURL("https://www.notion.so/PRIVACY-POLICY-287a7f71a89780b79819ed509024f373");
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: "#007AFF",
                      textDecorationLine: "underline",
                    }}
                  >
                    {t('privacyPolicy')}
                  </Text>
                </TouchableOpacity>
                
                <Text style={{ color: isDark ? "#666" : "#999", fontSize: 12 }}>•</Text>
                
                <TouchableOpacity
                  onPress={() => {
                    handleHapticFeedback();
                    Linking.openURL("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/");
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: "#007AFF",
                      textDecorationLine: "underline",
                    }}
                  >
                    {t('termsOfUse')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </GestureDetector>
  );
}

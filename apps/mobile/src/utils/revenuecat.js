import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Clé API RevenueCat
// En production (TestFlight/App Store) : utilise la clé Apple
// En développement : utilise la même clé (elle fonctionne avec StoreKit Configuration)
const REVENUECAT_API_KEY = 'appl_HlDiaFHXWmuwjzIeiLssbHVxSvc';

// Détecte si on est en mode développement
const __DEV__ = Constants.expoConfig?.extra?.isDev || __DEV__;

// Import conditionnel de Purchases pour éviter les crashes
let Purchases = null;

try {
  Purchases = require('react-native-purchases').default;
} catch (error) {
  console.error('Impossible de charger le module RevenueCat:', error);
}

/**
 * Initialise RevenueCat
 * À appeler au démarrage de l'app
 */
export const initializeRevenueCat = async (userId = null) => {
  try {
    if (!Purchases) {
      console.error('❌ Module RevenueCat non disponible');
      return false;
    }

    if (!REVENUECAT_API_KEY) {
      console.error('❌ Clé API RevenueCat manquante');
      return false;
    }

    console.log('🚀 Initialisation de RevenueCat...');
    console.log('🔑 API Key:', REVENUECAT_API_KEY.substring(0, 20) + '...');
    console.log('👤 User ID:', userId || 'Anonymous');
    console.log('📱 Platform:', Platform.OS);
    
    // Configurer RevenueCat
    Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId, // Optionnel : ID utilisateur personnalisé
    });
    
    console.log('✅ RevenueCat initialisé avec succès');
    
    // Activer les logs de debug en développement
    if (__DEV__) {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      console.log('🐛 Mode debug activé pour RevenueCat');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation RevenueCat:', error);
    return false;
  }
};

/**
 * Récupère les offres disponibles
 */
export const getOfferings = async () => {
  try {
    if (!Purchases) {
      console.error('❌ RevenueCat module non disponible');
      return null;
    }
    
    console.log('🔄 Récupération des offerings...');
    const offerings = await Purchases.getOfferings();
    
    console.log('📦 Offerings disponibles:', Object.keys(offerings.all));
    
    if (offerings.current !== null) {
      console.log('✅ Offering actuel trouvé:', offerings.current.identifier);
      console.log('📋 Packages disponibles:', offerings.current.availablePackages.map(p => ({
        identifier: p.identifier,
        productId: p.product.identifier,
        price: p.product.priceString
      })));
      return offerings.current;
    } else {
      // Essayer de récupérer l'offering "default" explicitement
      if (offerings.all && offerings.all['default']) {
        console.log('⚠️ Pas d\'offering current, utilisation de "default"');
        console.log('📋 Packages disponibles:', offerings.all['default'].availablePackages.map(p => ({
          identifier: p.identifier,
          productId: p.product.identifier,
          price: p.product.priceString
        })));
        return offerings.all['default'];
      }
      
      console.error('❌ Aucun offering trouvé');
      console.error('🔴 Vérifiez la configuration dans RevenueCat Dashboard:');
      console.error('   1. Les produits sont-ils créés?');
      console.error('   2. Les produits sont-ils ajoutés à un offering?');
      console.error('   3. L\'offering est-il marqué comme "current"?');
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des offres:', error);
    console.error('❌ Error details:', error.message);
    return null;
  }
};

/**
 * Achète un package
 */
export const purchasePackage = async (packageToPurchase) => {
  try {
    if (!Purchases) {
      console.error('❌ RevenueCat module non disponible');
      return { success: false, error: 'Module non disponible' };
    }

    console.log('🛒 Tentative d\'achat du package:', packageToPurchase.identifier);
    console.log('📦 Product ID:', packageToPurchase.product.identifier);
    console.log('💰 Prix:', packageToPurchase.product.priceString);

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    console.log('✅ Achat réussi!');
    console.log('👤 Customer Info:', JSON.stringify(customerInfo, null, 2));
    
    return {
      success: true,
      customerInfo,
    };
  } catch (error) {
    if (error.userCancelled) {
      console.log('❌ Achat annulé par l\'utilisateur');
      return {
        success: false,
        cancelled: true,
      };
    } else {
      console.error('❌ Erreur lors de l\'achat:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error userInfo:', error.userInfo);
      
      // Diagnostics spécifiques
      if (error.code === 'STORE_PROBLEM') {
        console.error('🔴 PROBLÈME APP STORE DÉTECTÉ:');
        console.error('   - Vérifiez que les produits existent dans App Store Connect');
        console.error('   - Vérifiez que les produits sont configurés dans RevenueCat Dashboard');
        console.error('   - Vérifiez que vous utilisez un compte sandbox valide');
        console.error('   - Vérifiez que le StoreKit Configuration file est configuré en développement');
      }
      
      return {
        success: false,
        error,
      };
    }
  }
};

/**
 * Vérifie si l'utilisateur est premium
 */
export const checkPremiumStatus = async () => {
  try {
    if (!Purchases) {
      return false;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    
    // Vérifier l'entitlement "premium" spécifiquement
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    
    return isPremium;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut premium:', error);
    return false;
  }
};

/**
 * Récupère l'abonnement actuel de l'utilisateur
 */
export const getCurrentSubscription = async () => {
  try {
    if (!Purchases) {
      return null;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    
    // Vérifier si l'utilisateur a un abonnement actif
    const premiumEntitlement = customerInfo.entitlements.active['premium'];
    
    if (!premiumEntitlement) {
      return null;
    }
    
    // Récupérer le product identifier
    const productId = premiumEntitlement.productIdentifier;
    
    // Mapper le product ID au plan
    const planMap = {
      'premium_weekly': 'weekly',
      'premium_monthly': 'monthly',
      'premium_yearly': 'yearly',
    };
    
    return planMap[productId] || null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'abonnement:', error);
    return null;
  }
};

/**
 * Restaure les achats
 */
export const restorePurchases = async () => {
  try {
    if (!Purchases) {
      return { success: false, error: 'Module non disponible' };
    }

    const customerInfo = await Purchases.restorePurchases();
    
    return {
      success: true,
      customerInfo,
    };
  } catch (error) {
    console.error('Erreur lors de la restauration:', error);
    return {
      success: false,
      error,
    };
  }
};

/**
 * Obtient les informations client
 */
export const getCustomerInfo = async () => {
  try {
    if (!Purchases) {
      return null;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Erreur lors de la récupération des infos client:', error);
    return null;
  }
};

// Système de traduction pour l'app
import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  FR: {
    // Navigation
    camera: 'Caméra',
    gallery: 'Galerie',
    settings: 'Paramètres',
    
    // Settings
    settingsTitle: 'Paramètres',
    session: 'Session',
    timer: 'Retardateur',
    photoCount: 'Nombre de photos',
    photoboothMode: 'Photobooth automatique',
    cleanMode: 'Mode épuré',
    shakeToReveal: 'Secouer pour révéler',
    templateLibrary: 'Bibliothèque Templates',
    manage: 'Gérer',
    
    // Camera settings
    cameraSettings: 'Caméra',
    flash: 'Flash',
    grid: 'Grille',
    mirror: 'Miroir',
    autoSave: 'Sauvegarde automatique',
    
    // App settings
    appSettings: 'Application',
    hapticFeedback: 'Retour haptique',
    language: 'Langue',
    
    // Premium
    premium: 'Premium',
    premiumTitle: 'Premium',
    unlock: 'Débloquer',
    manageSubscriptions: 'Gestion des abonnements',
    appStore: 'App Store',
    
    // Support
    support: 'Support',
    help: 'Aide',
    helpMessage: 'Tu as besoin d\'aide, je sais ce que c\'est ! C\'est pour ça que j\'ai créé cette app, pour faire une app utile. Si tu as un souci, contacte-moi directement à charly.klopoff@gmail.com ;)',
    contactMe: 'Me contacter',
    privacy: 'Confidentialité',
    privacyPolicy: 'Politique de confidentialité',
    termsOfUse: 'Conditions d\'utilisation',
    subscriptionRenews: 'L\'abonnement se renouvelle automatiquement. Annulez à tout moment.',
    about: 'À propos',
    aboutText: 'Klic v1.0.1\nFait avec amour par Charly Klopfenstein',
    
    // Session Complete
    sessionComplete: 'Session terminée !',
    back: 'Retour',
    whatDoYouWantToDo: 'Que voulez-vous faire ?',
    newSession: 'Nouvelle session',
    startNewSession: 'Commencer une nouvelle session',
    shakeToRevealTitle: 'Secouez pour révéler !',
    shakeToRevealSubtitle: 'Secouez votre téléphone pour révéler progressivement votre création',
    polaroidText: '✨ Comme une vraie photo Polaroid ✨',
    templateModified: 'Template modifié',
    templateModifiedMessage: 'Le nombre de photos a été changé à {count}.\n\n"Aucun template" a été automatiquement sélectionné.',
    
    // Premium Upsell
    upgradeToPremiumShort: 'Passez à Premium',
    premiumDescription: 'Supprimez le filigrane, débloquez plus de templates et créez vos propres filtres !',
    freeTrial: 'Passer à Premium',
    
    // Actions
    save: 'Sauvegarder',
    saveToGallery: 'Enregistrer dans la galerie',
    savePhotoDescription: 'Sauvegarder la photo',
    share: 'Partager',
    shareYourCreation: 'Partager votre création',
    sharePhotoDescription: 'Partager la photo',
    delete: 'Supprimer',
    cancel: 'Annuler',
    ok: 'OK',
    close: 'Fermer',
    
    // Messages
    photoSaved: 'Photo sauvegardée dans votre galerie !',
    success: 'Succès',
    error: 'Erreur',
    permissionRequired: 'Permission requise',
    permissionRequiredMessage: 'L\'accès à la galerie est nécessaire pour sauvegarder vos photos.',
    openSettings: 'Ouvrir Réglages',
    saveError: 'Erreur de sauvegarde',
    saveErrorMessage: 'Impossible de sauvegarder la photo. Vérifiez les autorisations de l\'app.',
    shareError: 'Erreur de partage',
    shareErrorMessage: 'Impossible de partager la photo. Veuillez réessayer.',
    noPhotos: 'Aucune photo',
    noPhotosToShare: 'Il n\'y a pas de photos à partager.',
    noPhotosToSave: 'Il n\'y a pas de photos à sauvegarder.',
    shareSession: 'Partager la session',
    saveSession: 'Sauvegarder la session',
    shareFirst: 'Partager la première',
    viewAllPhotos: 'Voir toutes les photos',
    understood: 'Compris',
    choosePhoto: 'Choisir une photo',
    choosePhotoMessage: 'Sélectionnez la photo à partager:',
    sessionWith: 'Session avec',
    photos: 'photos',
    individualShareRequired: 'Partage individuel nécessaire pour chaque photo.',
    saveInstructions: 'Pour sauvegarder dans votre galerie:\n1. Utilisez "Partager la première" ci-dessous\n2. Sélectionnez "Enregistrer dans Photos"\n3. Répétez pour les autres photos dans la galerie de l\'app',
    
    // Share
    sharePhotoName: 'Photo',
    photoTakenWith: 'Photo',
    
    // Memes
    addMemes: 'Ajouter des memes',
    searchMemes: 'Rechercher des memes...',
    noMemesFound: 'Aucun meme trouvé',
    
    // Premium Features
    createYourOwnTemplates: 'Créez vos propres templates',
    createCustomTemplates: 'Créez vos propres templates personnalisés illimités',
    customTemplatesDescription: 'Créez vos propres templates personnalisés avec vos photos préférées et donnez vie à vos idées',
    unlockInfinitePossibilities: 'Déverrouillez une infinité de possibilités',
    customTemplatesFeature: 'Templates personnalisés',
    createYourOwnTemplatesDescription: 'Créez vos propres templates',
    premiumTemplatesFeature: 'Templates premium',
    premiumTemplatesDescription: 'Accès aux templates premium prédéfinis',
    noWatermarkFeature: 'Sans filigrane',
    noWatermarkDescription: 'Photos sans filigrane',
    advancedTimersFeature: 'Minuteries avancées',
    advancedTimersDescription: 'Plus d\'options de retardateur',
    autoModeFeature: 'Mode automatique',
    autoModeDescription: 'Capture automatisée',
    premiumThemesFeature: 'Thèmes premium',
    premiumThemesDescription: 'Interface personnalisable',
    customTemplatesUnlimited: 'Templates personnalisés illimités',
    useYourOwnPhotos: 'Utilisez vos propres photos',
    createUniqueDesigns: 'Créez des designs uniques',
    shareYourCreations: 'Partagez vos créations',
    upgradeToPremium: 'Passer à Premium',
    premiumFeatures: 'Fonctionnalités Premium',
    choosePlan: 'Choisissez votre plan',
    startNow: 'Commencer',
    subscriptionRenews: 'L\'abonnement se renouvelle automatiquement. Annulez à tout moment depuis les paramètres de votre compte. Conditions d\'utilisation et politique de confidentialité disponibles sur notre site.',
    
    // Template Names
    templateNone: 'Aucun template',
    templatePolaroid: 'Template Polaroïd',
    template2Vertical: '2 photos verticales',
    template2Horizontal: '2 photos horizontales',
    template3Vertical: '3 photos verticales',
    template3Horizontal: '3 photos horizontales',
    template4Vertical: '4 photos verticales',
    template4Horizontal: '4 photos horizontales',
    template4Square: '4 photos en carré',
    createdOn: 'Créé le',
    
    // Template Library & Creator
    premiumFeatureTitle: 'Fonctionnalité Premium',
    customTemplatesReservedPremium: 'La création de templates personnalisés est réservée aux utilisateurs Premium',
    viewPremium: 'Voir Premium',
    permissionRequiredGallery: 'Nous avons besoin de l\'accès à votre galerie pour sélectionner une image.',
    unableToCreateTemplate: 'Impossible de créer le nouveau template',
    premiumRequired: 'Premium requis',
    templateRequiresPremium: 'Ce template nécessite un abonnement Premium',
    deleteTemplate: 'Supprimer le template',
    deleteTemplateConfirm: 'Êtes-vous sûr de vouloir supprimer ce template ?',
    unableToDeleteTemplate: 'Impossible de supprimer le template.',
    unableToEditTemplate: 'Impossible de modifier ce template',
    unableToSelectTemplate: 'Impossible de sélectionner ce template',
    
    // Template Creator
    templateProjectNotFound: 'Projet de template introuvable',
    unableToLoadTemplateProject: 'Impossible de charger le projet de template',
    noTemplateSpecified: 'Aucun template spécifié',
    selectBackgroundImageFirst: 'Veuillez d\'abord sélectionner une image de fond.',
    noSlotDetected: 'Aucun slot détecté',
    noSlotDetectedMessage: 'Aucune zone de couleur slot n\'a été trouvée dans l\'image. Les couleurs attendues sont #00ff01, #00ff02, #00ff03, etc.',
    slotsDetected: 'slot(s) détecté(s) automatiquement !',
    unableToAnalyzeImage: 'Impossible d\'analyser l\'image',
    templateIncomplete: 'Template incomplet',
    templateIncompleteMessage: 'Veuillez ajouter une image de fond, au moins un slot et donner un nom à votre template.',
    templateSaved: 'Template sauvegardé',
    templateModified: 'Template modifié',
    templateSavedSuccess: 'a été créé avec succès !',
    templateModifiedSuccess: 'a été modifié avec succès !',
    unableToSaveTemplate: 'Impossible de sauvegarder le template.',
    
    // Template Creator UI
    createTemplate: 'Créer un template',
    editTemplate: 'Modifier un template',
    templateName: 'Nom du template',
    templateNamePlaceholder: 'Mon template personnalisé',
    help: 'Aide',
    helpMessage: 'Cliquez sur \'Ajouter un slot\' pour créer un nouvel emplacement photo. Sélectionnez un slot pour le modifier avec les contrôles qui apparaissent.\n\nLes photos seront placées dans l\'ordre des numéros affichés sur chaque slot. Vous pouvez réorganiser en supprimant et recréant les slots.',
    addSlot: 'Ajouter un slot',
    autoDetect: 'Détection auto',
    changeImage: 'Changer l\'image',
    slotExpansion: 'Expansion des slots',
    slots: 'Slots',
    colorSlots: 'Slots couleurs',
    expandSlots: 'Agrandir les slots',
    backgroundImage: 'Image de fond',
    selectImage: 'Sélectionner une image',
    
    // Template Library UI
    chooseYourStyle: 'Choisissez votre style',
    predefined: 'Prédéfinis',
    myCreations: 'Mes créations',
    usePhotoFromGallery: 'Utilisez une photo de votre galerie',
    noCustomTemplate: 'Aucun template personnalisé',
    createFirstTemplate: 'Créez votre premier template en ajoutant\nune image de votre galerie',
    upgradeToPremiumForTemplates: 'Passez à Premium pour créer vos\npropres templates personnalisés',
    
    // Premium Page
    packageNotFound: 'Package non trouvé',
    subscriptionModified: 'Votre abonnement a été modifié !',
    youAreNowPremium: 'Vous êtes maintenant Premium !',
    purchaseError: 'Une erreur est survenue lors de l\'achat.',
    requestRefund: 'Demander un remboursement',
    refundMessage: 'Vous allez être redirigé vers le site Apple pour demander un remboursement.',
    continue: 'Continuer',
    restorePurchases: 'Restaurer mes achats',
    purchasesRestored: 'Achats restaurés avec succès !',
    noPurchasesToRestore: 'Aucun achat à restaurer.',
    restoreError: 'Erreur lors de la restauration des achats.',
    weekly: 'Hebdo',
    perWeek: '/semaine',
    monthly: 'Mensuel',
    perMonth: '/mois',
    popular: 'Populaire',
    yearly: 'Annuel',
    perYear: '/an',
    bestValue: 'Meilleure valeur',
    currentSubscription: 'Abonnement actuel',
    chooseThisSubscription: 'Choisir cet abonnement',
    
    // Settings Page
    chooseYourLanguage: 'Choisir votre langue',
    noneTemplate: 'Aucun template',
    photoCountLockedByTemplate: 'Le nombre de photos est déterminé par le template choisi. Passez à Premium pour personnaliser le nombre de photos.',
    autoPhotoboothPremium: 'Le mode photobooth automatique est réservé aux utilisateurs Premium',
    cleanModePremium: 'Le mode épuré est réservé aux utilisateurs Premium',
    manage: 'Gérer',
    unlockMoreTimerOptions: 'Débloquez plus d\'options de retardateur avec Premium',
    
    // Photo Editor Page
    original: 'Original',
    vintage: 'Vintage',
    warm: 'Chaud',
    cool: 'Froid',
    sepia: 'Sépia',
    dramatic: 'Dramatique',
    stickers: 'Stickers',
    text: 'Texte',
    filters: 'Filtres',
    addText: 'Ajouter du texte',
    enterYourText: 'Entrez votre texte:',
    add: 'Ajouter',
    featureRequiresPremium: 'Cette fonctionnalité nécessite Premium',
    
    // Gallery Page
    gallery: 'Galerie',
    photo: 'photo',
    photos: 'photos',
    loading: 'Chargement...',
    noPhotos: 'Aucune photo',
    startCapturingMoments: 'Commencez à capturer des moments avec l\'appareil photo',
    takePhoto: 'Prendre une photo',
    favorites: 'Favoris',
    sessions: 'Sessions',
    deletePhoto: 'Supprimer la photo',
    deletePhotoConfirm: 'Cette action est irréversible. Continuer ?',
    
    // Meme Sheet
    addMemes: 'Ajouter des memes',
    searchMemes: 'Rechercher des memes...',
    searchingMemes: 'Recherche en cours...',
    noMemesFound: 'Aucun meme trouvé pour',
    searchMemesToAdd: 'Recherchez des memes à ajouter à votre photo',
    
    // Session Complete
    betaFeatureMessage: 'Vous pouvez déplacer, zoomer, changer la rotation des photos dans leur slot !',
    
    // Watermark
    madeInKlic: 'Fait dans Klic',
  },
  
  EN: {
    // Navigation
    camera: 'Camera',
    gallery: 'Gallery',
    settings: 'Settings',
    
    // Settings
    settingsTitle: 'Settings',
    session: 'Session',
    timer: 'Timer',
    photoCount: 'Photo count',
    photoboothMode: 'Auto photobooth',
    cleanMode: 'Clean mode',
    shakeToReveal: 'Shake to reveal',
    templateLibrary: 'Template Library',
    manage: 'Manage',
    
    // Camera settings
    cameraSettings: 'Camera',
    flash: 'Flash',
    grid: 'Grid',
    mirror: 'Mirror',
    autoSave: 'Auto save',
    
    // App settings
    appSettings: 'Application',
    hapticFeedback: 'Haptic feedback',
    language: 'Language',
    
    // Premium
    premium: 'Premium',
    premiumTitle: 'Premium',
    unlock: 'Unlock',
    manageSubscriptions: 'Manage subscriptions',
    appStore: 'App Store',
    
    // Support
    support: 'Support',
    help: 'Help',
    helpMessage: 'Need help? I know how it feels! That\'s why I created this app, to make something useful. If you have any issues, contact me directly at charly.klopoff@gmail.com ;)',
    contactMe: 'Contact me',
    privacy: 'Privacy',
    privacyPolicy: 'Privacy Policy',
    termsOfUse: 'Terms of Use',
    subscriptionRenews: 'Subscription renews automatically. Cancel anytime.',
    about: 'About',
    aboutText: 'Klic v1.0.1\nMade with love by Charly Klopfenstein',
    
    // Session Complete
    sessionComplete: 'Session complete!',
    back: 'Back',
    whatDoYouWantToDo: 'What do you want to do?',
    newSession: 'New session',
    startNewSession: 'Start a new session',
    shakeToRevealTitle: 'Shake to reveal!',
    shakeToRevealSubtitle: 'Shake your phone to progressively reveal your creation',
    polaroidText: '✨ Like a real Polaroid photo ✨',
    templateModified: 'Template modified',
    templateModifiedMessage: 'Photo count changed to {count}.\n\n"No template" has been automatically selected.',
    
    // Premium Upsell
    upgradeToPremiumShort: 'Upgrade to Premium',
    premiumDescription: 'Remove watermark, unlock more templates and create your own filters!',
    freeTrial: 'Upgrade to Premium',
    
    // Actions
    save: 'Save',
    saveToGallery: 'Save to gallery',
    savePhotoDescription: 'Save the photo',
    share: 'Share',
    shareYourCreation: 'Share your creation',
    sharePhotoDescription: 'Share the photo',
    delete: 'Delete',
    cancel: 'Cancel',
    ok: 'OK',
    close: 'Close',
    
    // Messages
    photoSaved: 'Photo saved to your gallery!',
    success: 'Success',
    error: 'Error',
    permissionRequired: 'Permission required',
    permissionRequiredMessage: 'Gallery access is required to save your photos.',
    openSettings: 'Open Settings',
    saveError: 'Save error',
    saveErrorMessage: 'Unable to save photo. Check app permissions.',
    shareError: 'Share error',
    shareErrorMessage: 'Unable to share photo. Please try again.',
    noPhotos: 'No photos',
    noPhotosToShare: 'There are no photos to share.',
    noPhotosToSave: 'There are no photos to save.',
    shareSession: 'Share session',
    saveSession: 'Save session',
    shareFirst: 'Share first',
    viewAllPhotos: 'View all photos',
    understood: 'Got it',
    choosePhoto: 'Choose photo',
    choosePhotoMessage: 'Select the photo to share:',
    sessionWith: 'Session with',
    photos: 'photos',
    individualShareRequired: 'Individual sharing required for each photo.',
    saveInstructions: 'To save to your gallery:\n1. Use "Share first" below\n2. Select "Save to Photos"\n3. Repeat for other photos in the app gallery',
    
    // Share
    sharePhotoName: 'Photo',
    photoTakenWith: 'Photo',
    
    // Memes
    addMemes: 'Add memes',
    searchMemes: 'Search memes...',
    noMemesFound: 'No memes found',
    
    // Premium Features
    createYourOwnTemplates: 'Create your own templates',
    createCustomTemplates: 'Create unlimited custom templates',
    customTemplatesDescription: 'Create your own custom templates with your favorite photos and bring your ideas to life',
    unlockInfinitePossibilities: 'Unlock infinite possibilities',
    customTemplatesFeature: 'Custom templates',
    createYourOwnTemplatesDescription: 'Create your own templates',
    premiumTemplatesFeature: 'Premium templates',
    premiumTemplatesDescription: 'Access to premium templates',
    noWatermarkFeature: 'No watermark',
    noWatermarkDescription: 'Photos without watermark',
    advancedTimersFeature: 'Advanced timers',
    advancedTimersDescription: 'More timer options',
    autoModeFeature: 'Auto mode',
    autoModeDescription: 'Automated capture',
    premiumThemesFeature: 'Premium themes',
    premiumThemesDescription: 'Customizable interface',
    customTemplatesUnlimited: 'Unlimited custom templates',
    useYourOwnPhotos: 'Use your own photos',
    createUniqueDesigns: 'Create unique designs',
    shareYourCreations: 'Share your creations',
    upgradeToPremium: 'Upgrade to Premium',
    premiumFeatures: 'Premium Features',
    choosePlan: 'Choose your plan',
    startNow: 'Start now',
    subscriptionRenews: 'Subscription renews automatically. Cancel anytime from your account settings. Terms of service and privacy policy available on our website.',
    
    // Template Names
    templateNone: 'No template',
    templatePolaroid: 'Polaroid Template',
    template2Vertical: '2 vertical photos',
    template2Horizontal: '2 horizontal photos',
    template3Vertical: '3 vertical photos',
    template3Horizontal: '3 horizontal photos',
    template4Vertical: '4 vertical photos',
    template4Horizontal: '4 horizontal photos',
    template4Square: '4 photos square',
    createdOn: 'Created on',
    
    // Template Library & Creator
    premiumFeatureTitle: 'Premium Feature',
    customTemplatesReservedPremium: 'Creating custom templates is reserved for Premium users',
    viewPremium: 'View Premium',
    permissionRequiredGallery: 'We need access to your gallery to select an image.',
    unableToCreateTemplate: 'Unable to create new template',
    premiumRequired: 'Premium required',
    templateRequiresPremium: 'This template requires a Premium subscription',
    deleteTemplate: 'Delete template',
    deleteTemplateConfirm: 'Are you sure you want to delete this template?',
    unableToDeleteTemplate: 'Unable to delete template.',
    unableToEditTemplate: 'Unable to edit this template',
    unableToSelectTemplate: 'Unable to select this template',
    
    // Template Creator
    templateProjectNotFound: 'Template project not found',
    unableToLoadTemplateProject: 'Unable to load template project',
    noTemplateSpecified: 'No template specified',
    selectBackgroundImageFirst: 'Please select a background image first.',
    noSlotDetected: 'No slot detected',
    noSlotDetectedMessage: 'No slot color zone was found in the image. Expected colors are #00ff01, #00ff02, #00ff03, etc.',
    slotsDetected: 'slot(s) detected automatically!',
    unableToAnalyzeImage: 'Unable to analyze image',
    templateIncomplete: 'Incomplete template',
    templateIncompleteMessage: 'Please add a background image, at least one slot, and give your template a name.',
    templateSaved: 'Template saved',
    templateModified: 'Template modified',
    templateSavedSuccess: 'was created successfully!',
    templateModifiedSuccess: 'was modified successfully!',
    unableToSaveTemplate: 'Unable to save template.',
    
    // Template Creator UI
    createTemplate: 'Create template',
    editTemplate: 'Edit template',
    templateName: 'Template name',
    templateNamePlaceholder: 'My custom template',
    help: 'Help',
    helpMessage: 'Click \'Add slot\' to create a new photo slot. Select a slot to modify it with the controls that appear.\n\nPhotos will be placed in the order of the numbers displayed on each slot. You can reorganize by deleting and recreating slots.',
    addSlot: 'Add slot',
    autoDetect: 'Auto detect',
    changeImage: 'Change image',
    slotExpansion: 'Slot expansion',
    slots: 'Slots',
    colorSlots: 'Color slots',
    expandSlots: 'Expand slots',
    backgroundImage: 'Background image',
    selectImage: 'Select an image',
    
    // Template Library UI
    chooseYourStyle: 'Choose your style',
    predefined: 'Predefined',
    myCreations: 'My creations',
    usePhotoFromGallery: 'Use a photo from your gallery',
    noCustomTemplate: 'No custom template',
    createFirstTemplate: 'Create your first template by adding\nan image from your gallery',
    upgradeToPremiumForTemplates: 'Upgrade to Premium to create your\nown custom templates',
    
    // Premium Page
    packageNotFound: 'Package not found',
    subscriptionModified: 'Your subscription has been modified!',
    youAreNowPremium: 'You are now Premium!',
    purchaseError: 'An error occurred during the purchase.',
    requestRefund: 'Request a refund',
    refundMessage: 'You will be redirected to the Apple website to request a refund.',
    continue: 'Continue',
    restorePurchases: 'Restore purchases',
    purchasesRestored: 'Purchases successfully restored!',
    noPurchasesToRestore: 'No purchases to restore.',
    restoreError: 'Error restoring purchases.',
    weekly: 'Weekly',
    perWeek: '/week',
    monthly: 'Monthly',
    perMonth: '/month',
    popular: 'Popular',
    yearly: 'Yearly',
    perYear: '/year',
    bestValue: 'Best value',
    currentSubscription: 'Current subscription',
    chooseThisSubscription: 'Choose this subscription',
    
    // Settings Page
    chooseYourLanguage: 'Choose your language',
    noneTemplate: 'No template',
    photoCountLockedByTemplate: 'The number of photos is determined by the chosen template. Upgrade to Premium to customize the number of photos.',
    autoPhotoboothPremium: 'Automatic photobooth mode is reserved for Premium users',
    cleanModePremium: 'Clean mode is reserved for Premium users',
    manage: 'Manage',
    unlockMoreTimerOptions: 'Unlock more timer options with Premium',
    
    // Photo Editor Page
    original: 'Original',
    vintage: 'Vintage',
    warm: 'Warm',
    cool: 'Cool',
    sepia: 'Sepia',
    dramatic: 'Dramatic',
    stickers: 'Stickers',
    text: 'Text',
    filters: 'Filters',
    addText: 'Add text',
    enterYourText: 'Enter your text:',
    add: 'Add',
    featureRequiresPremium: 'This feature requires Premium',
    
    // Gallery Page
    gallery: 'Gallery',
    photo: 'photo',
    photos: 'photos',
    loading: 'Loading...',
    noPhotos: 'No photos',
    startCapturingMoments: 'Start capturing moments with your camera',
    takePhoto: 'Take a photo',
    favorites: 'Favorites',
    sessions: 'Sessions',
    deletePhoto: 'Delete photo',
    deletePhotoConfirm: 'This action is irreversible. Continue?',
    
    // Meme Sheet
    addMemes: 'Add memes',
    searchMemes: 'Search memes...',
    searchingMemes: 'Searching...',
    noMemesFound: 'No memes found for',
    searchMemesToAdd: 'Search for memes to add to your photo',
    
    // Session Complete
    betaFeatureMessage: 'You can move, zoom, and rotate photos in their slots!',
    
    // Watermark
    madeInKlic: 'Made in Klic',
  },
  
  DE: {
    // Navigation
    camera: 'Kamera',
    gallery: 'Galerie',
    settings: 'Einstellungen',
    
    // Watermark
    madeInKlic: 'Mit Klic gemacht',
  },
  
  IT: {
    // Navigation
    camera: 'Fotocamera',
    gallery: 'Galleria',
    settings: 'Impostazioni',
    
    // Watermark
    madeInKlic: 'Fatto con Klic',
  },
  
  PT: {
    // Navigation
    camera: 'Câmera',
    gallery: 'Galeria',
    settings: 'Configurações',
    
    // Watermark
    madeInKlic: 'Feito com Klic',
  },
  
  ES: {
    // Navigation
    camera: 'Cámara',
    gallery: 'Galería',
    settings: 'Ajustes',
    
    // Settings
    settingsTitle: 'Ajustes',
    session: 'Sesión',
    timer: 'Temporizador',
    photoCount: 'Número de fotos',
    photoboothMode: 'Fotomatón automático',
    cleanMode: 'Modo limpio',
    shakeToReveal: 'Agitar para revelar',
    templateLibrary: 'Biblioteca de plantillas',
    manage: 'Gestionar',
    
    // Camera settings
    cameraSettings: 'Cámara',
    flash: 'Flash',
    grid: 'Cuadrícula',
    mirror: 'Espejo',
    autoSave: 'Guardado automático',
    
    // App settings
    appSettings: 'Aplicación',
    hapticFeedback: 'Vibración',
    language: 'Idioma',
    
    // Premium
    premium: 'Premium',
    premiumTitle: 'Premium',
    unlock: 'Desbloquear',
    manageSubscriptions: 'Gestionar suscripciones',
    appStore: 'App Store',
    
    // Support
    support: 'Soporte',
    help: 'Ayuda',
    helpMessage: '¿Necesitas ayuda? ¡Sé cómo se siente! Por eso creé esta app, para hacer algo útil. Si tienes algún problema, contáctame directamente en charly.klopoff@gmail.com ;)',
    contactMe: 'Contáctame',
    privacy: 'Privacidad',
    privacyPolicy: 'Política de privacidad',
    termsOfUse: 'Términos de uso',
    subscriptionRenews: 'La suscripción se renueva automáticamente. Cancela en cualquier momento.',
    about: 'Acerca de',
    aboutText: 'Klic v1.0.1\nHecho con amor por Charly Klopfenstein',
    
    // Session Complete
    sessionComplete: '¡Sesión completada!',
    back: 'Atrás',
    whatDoYouWantToDo: '¿Qué quieres hacer?',
    newSession: 'Nueva sesión',
    startNewSession: 'Comenzar una nueva sesión',
    shakeToRevealTitle: '¡Agita para revelar!',
    shakeToRevealSubtitle: 'Agita tu teléfono para revelar progresivamente tu creación',
    polaroidText: '✨ Como una foto Polaroid real ✨',
    templateModified: 'Plantilla modificada',
    templateModifiedMessage: 'Número de fotos cambiado a {count}.\n\n"Sin plantilla" ha sido seleccionado automáticamente.',
    
    // Premium Upsell
    upgradeToPremiumShort: 'Actualizar a Premium',
    premiumDescription: '¡Elimina la marca de agua, desbloquea más plantillas y crea tus propios filtros!',
    freeTrial: 'Actualizar a Premium',
    
    // Actions
    save: 'Guardar',
    saveToGallery: 'Guardar en la galería',
    savePhotoDescription: 'Guardar la foto',
    share: 'Compartir',
    shareYourCreation: 'Compartir tu creación',
    sharePhotoDescription: 'Compartir la foto',
    delete: 'Eliminar',
    cancel: 'Cancelar',
    ok: 'OK',
    close: 'Cerrar',
    
    // Messages
    photoSaved: '¡Foto guardada en tu galería!',
    success: 'Éxito',
    error: 'Error',
    permissionRequired: 'Permiso requerido',
    permissionRequiredMessage: 'Se requiere acceso a la galería para guardar tus fotos.',
    openSettings: 'Abrir Ajustes',
    saveError: 'Error al guardar',
    saveErrorMessage: 'No se puede guardar la foto. Verifica los permisos de la app.',
    shareError: 'Error al compartir',
    shareErrorMessage: 'No se puede compartir la foto. Inténtalo de nuevo.',
    noPhotos: 'Sin fotos',
    noPhotosToShare: 'No hay fotos para compartir.',
    noPhotosToSave: 'No hay fotos para guardar.',
    shareSession: 'Compartir sesión',
    saveSession: 'Guardar sesión',
    shareFirst: 'Compartir primera',
    viewAllPhotos: 'Ver todas las fotos',
    understood: 'Entendido',
    choosePhoto: 'Elegir foto',
    choosePhotoMessage: 'Selecciona la foto a compartir:',
    sessionWith: 'Sesión con',
    photos: 'fotos',
    individualShareRequired: 'Se requiere compartir individualmente cada foto.',
    saveInstructions: 'Para guardar en tu galería:\n1. Usa "Compartir primera" abajo\n2. Selecciona "Guardar en Fotos"\n3. Repite para otras fotos en la galería de la app',
    
    // Share
    sharePhotoName: 'Foto',
    photoTakenWith: 'Foto',
    
    // Memes
    addMemes: 'Agregar memes',
    searchMemes: 'Buscar memes...',
    noMemesFound: 'No se encontraron memes',
    
    // Premium Features
    createYourOwnTemplates: 'Crea tus propias plantillas',
    createCustomTemplates: 'Crea plantillas personalizadas ilimitadas',
    customTemplatesDescription: 'Crea tus propias plantillas personalizadas con tus fotos favoritas y da vida a tus ideas',
    unlockInfinitePossibilities: 'Desbloquea infinitas posibilidades',
    customTemplatesFeature: 'Plantillas personalizadas',
    createYourOwnTemplatesDescription: 'Crea tus propias plantillas',
    premiumTemplatesFeature: 'Plantillas premium',
    premiumTemplatesDescription: 'Acceso a plantillas premium',
    noWatermarkFeature: 'Sin marca de agua',
    noWatermarkDescription: 'Fotos sin marca de agua',
    advancedTimersFeature: 'Temporizadores avanzados',
    advancedTimersDescription: 'Más opciones de temporizador',
    autoModeFeature: 'Modo automático',
    autoModeDescription: 'Captura automatizada',
    premiumThemesFeature: 'Temas premium',
    premiumThemesDescription: 'Interfaz personalizable',
    customTemplatesUnlimited: 'Plantillas personalizadas ilimitadas',
    useYourOwnPhotos: 'Usa tus propias fotos',
    createUniqueDesigns: 'Crea diseños únicos',
    shareYourCreations: 'Comparte tus creaciones',
    upgradeToPremium: 'Actualizar a Premium',
    premiumFeatures: 'Funciones Premium',
    choosePlan: 'Elige tu plan',
    startNow: 'Comenzar',
    subscriptionRenews: 'La suscripción se renueva automáticamente. Cancela en cualquier momento desde la configuración de tu cuenta. Términos de servicio y política de privacidad disponibles en nuestro sitio web.',
    
    // Template Names
    templateNone: 'Sin plantilla',
    templatePolaroid: 'Plantilla Polaroid',
    template2Vertical: '2 fotos verticales',
    template2Horizontal: '2 fotos horizontales',
    template3Vertical: '3 fotos verticales',
    template3Horizontal: '3 fotos horizontales',
    template4Vertical: '4 fotos verticales',
    template4Horizontal: '4 fotos horizontales',
    template4Square: '4 fotos cuadradas',
    createdOn: 'Creado el',
    
    // Template Library & Creator
    premiumFeatureTitle: 'Función Premium',
    customTemplatesReservedPremium: 'La creación de plantillas personalizadas está reservada para usuarios Premium',
    viewPremium: 'Ver Premium',
    permissionRequiredGallery: 'Necesitamos acceso a tu galería para seleccionar una imagen.',
    unableToCreateTemplate: 'No se puede crear la nueva plantilla',
    premiumRequired: 'Premium requerido',
    templateRequiresPremium: 'Esta plantilla requiere una suscripción Premium',
    deleteTemplate: 'Eliminar plantilla',
    deleteTemplateConfirm: '¿Estás seguro de que quieres eliminar esta plantilla?',
    unableToDeleteTemplate: 'No se puede eliminar la plantilla.',
    unableToEditTemplate: 'No se puede editar esta plantilla',
    unableToSelectTemplate: 'No se puede seleccionar esta plantilla',
    
    // Template Creator
    templateProjectNotFound: 'Proyecto de plantilla no encontrado',
    unableToLoadTemplateProject: 'No se puede cargar el proyecto de plantilla',
    noTemplateSpecified: 'No se especificó ninguna plantilla',
    selectBackgroundImageFirst: 'Por favor selecciona primero una imagen de fondo.',
    noSlotDetected: 'No se detectó ningún slot',
    noSlotDetectedMessage: 'No se encontró ninguna zona de color slot en la imagen. Los colores esperados son #00ff01, #00ff02, #00ff03, etc.',
    slotsDetected: 'slot(s) detectado(s) automáticamente!',
    unableToAnalyzeImage: 'No se puede analizar la imagen',
    templateIncomplete: 'Plantilla incompleta',
    templateIncompleteMessage: 'Por favor agrega una imagen de fondo, al menos un slot y dale un nombre a tu plantilla.',
    templateSaved: 'Plantilla guardada',
    templateModified: 'Plantilla modificada',
    templateSavedSuccess: 'fue creada con éxito!',
    templateModifiedSuccess: 'fue modificada con éxito!',
    unableToSaveTemplate: 'No se puede guardar la plantilla.',
    
    // Template Creator UI
    createTemplate: 'Crear plantilla',
    editTemplate: 'Editar plantilla',
    templateName: 'Nombre de la plantilla',
    templateNamePlaceholder: 'Mi plantilla personalizada',
    help: 'Ayuda',
    helpMessage: 'Haz clic en \'Agregar slot\' para crear un nuevo espacio para fotos. Selecciona un slot para modificarlo con los controles que aparecen.\n\nLas fotos se colocarán en el orden de los números mostrados en cada slot. Puedes reorganizar eliminando y recreando los slots.',
    addSlot: 'Agregar slot',
    autoDetect: 'Detección auto',
    changeImage: 'Cambiar imagen',
    slotExpansion: 'Expansión de slots',
    slots: 'Slots',
    colorSlots: 'Slots de color',
    expandSlots: 'Ampliar slots',
    backgroundImage: 'Imagen de fondo',
    selectImage: 'Seleccionar una imagen',
    
    // Template Library UI
    chooseYourStyle: 'Elige tu estilo',
    predefined: 'Predefinidos',
    myCreations: 'Mis creaciones',
    usePhotoFromGallery: 'Usa una foto de tu galería',
    noCustomTemplate: 'Ninguna plantilla personalizada',
    createFirstTemplate: 'Crea tu primera plantilla agregando\nuna imagen de tu galería',
    upgradeToPremiumForTemplates: 'Actualiza a Premium para crear tus\npropias plantillas personalizadas',
    
    // Premium Page
    packageNotFound: 'Paquete no encontrado',
    subscriptionModified: '¡Tu suscripción ha sido modificada!',
    youAreNowPremium: '¡Ahora eres Premium!',
    purchaseError: 'Ocurrió un error durante la compra.',
    requestRefund: 'Solicitar reembolso',
    refundMessage: 'Serás redirigido al sitio web de Apple para solicitar un reembolso.',
    continue: 'Continuar',
    restorePurchases: 'Restaurar compras',
    purchasesRestored: '¡Compras restauradas con éxito!',
    noPurchasesToRestore: 'No hay compras para restaurar.',
    restoreError: 'Error al restaurar las compras.',
    weekly: 'Semanal',
    perWeek: '/semana',
    monthly: 'Mensual',
    perMonth: '/mes',
    popular: 'Popular',
    yearly: 'Anual',
    perYear: '/año',
    bestValue: 'Mejor valor',
    currentSubscription: 'Suscripción actual',
    chooseThisSubscription: 'Elegir esta suscripción',
    
    // Settings Page
    chooseYourLanguage: 'Elige tu idioma',
    noneTemplate: 'Sin plantilla',
    photoCountLockedByTemplate: 'El número de fotos está determinado por la plantilla elegida. Actualiza a Premium para personalizar el número de fotos.',
    autoPhotoboothPremium: 'El modo photobooth automático está reservado para usuarios Premium',
    cleanModePremium: 'El modo limpio está reservado para usuarios Premium',
    manage: 'Gestionar',
    unlockMoreTimerOptions: 'Desbloquea más opciones de temporizador con Premium',
    
    // Photo Editor Page
    original: 'Original',
    vintage: 'Vintage',
    warm: 'Cálido',
    cool: 'Frío',
    sepia: 'Sepia',
    dramatic: 'Dramático',
    stickers: 'Stickers',
    text: 'Texto',
    filters: 'Filtros',
    addText: 'Agregar texto',
    enterYourText: 'Ingresa tu texto:',
    add: 'Agregar',
    featureRequiresPremium: 'Esta función requiere Premium',
    
    // Gallery Page
    gallery: 'Galería',
    photo: 'foto',
    photos: 'fotos',
    loading: 'Cargando...',
    noPhotos: 'No hay fotos',
    startCapturingMoments: 'Comienza a capturar momentos con tu cámara',
    takePhoto: 'Tomar una foto',
    favorites: 'Favoritos',
    sessions: 'Sesiones',
    deletePhoto: 'Eliminar foto',
    deletePhotoConfirm: 'Esta acción es irreversible. ¿Continuar?',
    
    // Meme Sheet
    addMemes: 'Agregar memes',
    searchMemes: 'Buscar memes...',
    searchingMemes: 'Buscando...',
    noMemesFound: 'No se encontraron memes para',
    searchMemesToAdd: 'Busca memes para agregar a tu foto',
    
    // Session Complete
    betaFeatureMessage: '¡Puedes mover, hacer zoom y rotar las fotos en sus ranuras!',
    
    // Watermark
    madeInKlic: 'Hecho en Klic',
  },
};

let currentLanguage = 'FR';

export const initializeLanguage = async () => {
  try {
    const savedSettings = await AsyncStorage.getItem('thismoment_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.language) {
        currentLanguage = settings.language;
      }
    }
  } catch (error) {
    console.error('Error loading language:', error);
  }
};

export const setLanguage = (lang) => {
  currentLanguage = lang;
};

export const t = (key) => {
  return translations[currentLanguage]?.[key] || translations['FR'][key] || key;
};

export const getCurrentLanguage = () => currentLanguage;

// Helper pour obtenir le symbole de devise selon la langue
export const getCurrencySymbol = () => {
  const currencyMap = {
    'FR': '€',
    'EN': '$',
    'ES': '€',
  };
  return currencyMap[currentLanguage] || '€';
};

// Helper pour formater les prix selon la langue
// Note: Ces prix sont uniquement pour le fallback. 
// Les vrais prix viennent de RevenueCat et respectent la région du compte App Store.
export const formatPrice = (amount, frequency) => {
  const symbol = getCurrencySymbol();
  
  // Prix par défaut selon la langue
  const pricesByLanguage = {
    'FR': {
      weekly: 5.99,
      monthly: 9.99,
      yearly: 99.99,
    },
    'EN': {
      weekly: 5.99,
      monthly: 9.99,
      yearly: 99.99,
    },
    'ES': {
      weekly: 5.99,
      monthly: 9.99,
      yearly: 99.99,
    },
  };
  
  const prices = pricesByLanguage[currentLanguage] || pricesByLanguage['FR'];
  const price = prices[frequency] || amount;
  
  // Format selon la langue
  if (currentLanguage === 'EN') {
    return `$${price.toFixed(2)}`;
  } else {
    return `${price.toFixed(2).replace('.', ',')}${symbol}`;
  }
};

// Helper pour reformater un prix de RevenueCat selon la langue de l'app
// Exemple: "5,99 €" devient "$5.99" si la langue est EN
export const reformatPriceString = (priceString) => {
  if (!priceString) return priceString;
  
  // Extraire le montant numérique du priceString
  // Supporte: "5,99 €", "€5,99", "$5.99", "5.99 USD", etc.
  const numericMatch = priceString.match(/[\d,\.]+/);
  if (!numericMatch) return priceString;
  
  // Convertir en nombre (remplacer , par .)
  const numericValue = parseFloat(numericMatch[0].replace(',', '.'));
  if (isNaN(numericValue)) return priceString;
  
  // Reformater selon la langue de l'app
  const symbol = getCurrencySymbol();
  
  if (currentLanguage === 'EN') {
    return `$${numericValue.toFixed(2)}`;
  } else {
    return `${numericValue.toFixed(2).replace('.', ',')}${symbol}`;
  }
};

// Helper pour traduire les noms de templates basé sur leur ID
export const getTemplateName = (templateId) => {
  const templateKeyMap = {
    'none': 'templateNone',
    'polaroid-letters': 'templatePolaroid',
    'collage-2-vertical': 'template2Vertical',
    'collage-2-horizontal': 'template2Horizontal',
    'collage-3-vertical': 'template3Vertical',
    'collage-3-horizontal': 'template3Horizontal',
    'collage-4-vertical': 'template4Vertical',
    'collage-4-horizontal': 'template4Horizontal',
    'collage-4-square': 'template4Square',
  };
  
  const key = templateKeyMap[templateId];
  return key ? t(key) : templateId;
};

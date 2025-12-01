/**
 * Templates prédéfinis pour l'application
 * Ces templates ne peuvent pas être modifiés ou supprimés par l'utilisateur
 * 
 * Format des slots: { topLeft, topRight, bottomRight, bottomLeft }
 * Chaque point est { x, y } avec des valeurs normalisées entre 0 et 1
 */

// Import des images de templates
const templateImages = {
  'template1': require('../../assets/templates/template1.png'),
};

export const PREDEFINED_TEMPLATES = [
  {
    id: "none",
    name: "Aucun template",
    preview: null,
    backgroundImage: null,
    isPremium: false,
    isPredefined: true,
    isCustom: false,
    category: "basic",
    photoCount: 1,
    slots: [],
  },
  // Template Polaroid avec fond personnalisé
  {
    id: "polaroid-letters",
    name: "Template Polaroïd",
    preview: null,
    backgroundImage: templateImages['template1'],
    isPremium: false,
    isPredefined: true,
    isCustom: false,
    category: "custom",
    photoCount: 2,
    // Slots calculés pour l'image 1080x1350px
    slots: [
      {
        id: "slot-1",
        // Slot 1 - Polaroid du haut à gauche (agrandi de 5px)
        topLeft: { x: 0.1028, y: 0.2148 },      // 111,290
        topRight: { x: 0.4676, y: 0.2319 },     // 505,313
        bottomRight: { x: 0.4444, y: 0.5244 },  // 480,708
        bottomLeft: { x: 0.0787, y: 0.5037 },   // 85,680
      },
      {
        id: "slot-2",
        // Slot 2 - Polaroid du bas à droite (agrandi de 5px)
        topLeft: { x: 0.5593, y: 0.4185 },      // 604,565
        topRight: { x: 0.8527, y: 0.5311 },     // 921,717
        bottomRight: { x: 0.6648, y: 0.8452 },  // 718,1141
        bottomLeft: { x: 0.3704, y: 0.7296 },   // 400,985
      },
    ],
  },
  // 2 photos verticales
  {
    id: "collage-2-vertical",
    name: "2 photos verticales",
    preview: null,
    backgroundImage: null,
    isPremium: false,
    isPredefined: true,
    isCustom: false,
    category: "vertical",
    photoCount: 2,
    slots: [
      {
        id: "slot-1",
        topLeft: { x: 0, y: 0 },
        topRight: { x: 1, y: 0 },
        bottomRight: { x: 1, y: 0.5 },
        bottomLeft: { x: 0, y: 0.5 },
      },
      {
        id: "slot-2",
        topLeft: { x: 0, y: 0.5 },
        topRight: { x: 1, y: 0.5 },
        bottomRight: { x: 1, y: 1 },
        bottomLeft: { x: 0, y: 1 },
      },
    ],
  },
  // 2 photos horizontales
  {
    id: "collage-2-horizontal",
    name: "2 photos horizontales",
    preview: null,
    backgroundImage: null,
    isPremium: false,
    isPredefined: true,
    isCustom: false,
    category: "horizontal",
    photoCount: 2,
    slots: [
      {
        id: "slot-1",
        topLeft: { x: 0, y: 0 },
        topRight: { x: 0.5, y: 0 },
        bottomRight: { x: 0.5, y: 1 },
        bottomLeft: { x: 0, y: 1 },
      },
      {
        id: "slot-2",
        topLeft: { x: 0.5, y: 0 },
        topRight: { x: 1, y: 0 },
        bottomRight: { x: 1, y: 1 },
        bottomLeft: { x: 0.5, y: 1 },
      },
    ],
  },
  // 3 photos verticales
  {
    id: "collage-3-vertical",
    name: "3 photos verticales",
    preview: null,
    backgroundImage: null,
    isPremium: false,
    isPredefined: true,
    isCustom: false,
    category: "vertical",
    photoCount: 3,
    slots: [
      {
        id: "slot-1",
        topLeft: { x: 0, y: 0 },
        topRight: { x: 1, y: 0 },
        bottomRight: { x: 1, y: 1/3 },
        bottomLeft: { x: 0, y: 1/3 },
      },
      {
        id: "slot-2",
        topLeft: { x: 0, y: 1/3 },
        topRight: { x: 1, y: 1/3 },
        bottomRight: { x: 1, y: 2/3 },
        bottomLeft: { x: 0, y: 2/3 },
      },
      {
        id: "slot-3",
        topLeft: { x: 0, y: 2/3 },
        topRight: { x: 1, y: 2/3 },
        bottomRight: { x: 1, y: 1 },
        bottomLeft: { x: 0, y: 1 },
      },
    ],
  },
  // 3 photos horizontales
  {
    id: "collage-3-horizontal",
    name: "3 photos horizontales",
    preview: null,
    backgroundImage: null,
    isPremium: false,
    isPredefined: true,
    isCustom: false,
    category: "horizontal",
    photoCount: 3,
    slots: [
      {
        id: "slot-1",
        topLeft: { x: 0, y: 0 },
        topRight: { x: 1/3, y: 0 },
        bottomRight: { x: 1/3, y: 1 },
        bottomLeft: { x: 0, y: 1 },
      },
      {
        id: "slot-2",
        topLeft: { x: 1/3, y: 0 },
        topRight: { x: 2/3, y: 0 },
        bottomRight: { x: 2/3, y: 1 },
        bottomLeft: { x: 1/3, y: 1 },
      },
      {
        id: "slot-3",
        topLeft: { x: 2/3, y: 0 },
        topRight: { x: 1, y: 0 },
        bottomRight: { x: 1, y: 1 },
        bottomLeft: { x: 2/3, y: 1 },
      },
    ],
  },
  // 4 photos verticales
  {
    id: "collage-4-vertical",
    name: "4 photos verticales",
    preview: null,
    backgroundImage: null,
    isPremium: false,
    isPredefined: true,
    isCustom: false,
    category: "vertical",
    photoCount: 4,
    slots: [
      {
        id: "slot-1",
        topLeft: { x: 0, y: 0 },
        topRight: { x: 1, y: 0 },
        bottomRight: { x: 1, y: 0.25 },
        bottomLeft: { x: 0, y: 0.25 },
      },
      {
        id: "slot-2",
        topLeft: { x: 0, y: 0.25 },
        topRight: { x: 1, y: 0.25 },
        bottomRight: { x: 1, y: 0.5 },
        bottomLeft: { x: 0, y: 0.5 },
      },
      {
        id: "slot-3",
        topLeft: { x: 0, y: 0.5 },
        topRight: { x: 1, y: 0.5 },
        bottomRight: { x: 1, y: 0.75 },
        bottomLeft: { x: 0, y: 0.75 },
      },
      {
        id: "slot-4",
        topLeft: { x: 0, y: 0.75 },
        topRight: { x: 1, y: 0.75 },
        bottomRight: { x: 1, y: 1 },
        bottomLeft: { x: 0, y: 1 },
      },
    ],
  },
  // 4 photos horizontales
  {
    id: "collage-4-horizontal",
    name: "4 photos horizontales",
    preview: null,
    backgroundImage: null,
    isPremium: false,
    isPredefined: true,
    isCustom: false,
    category: "horizontal",
    photoCount: 4,
    slots: [
      {
        id: "slot-1",
        topLeft: { x: 0, y: 0 },
        topRight: { x: 0.25, y: 0 },
        bottomRight: { x: 0.25, y: 1 },
        bottomLeft: { x: 0, y: 1 },
      },
      {
        id: "slot-2",
        topLeft: { x: 0.25, y: 0 },
        topRight: { x: 0.5, y: 0 },
        bottomRight: { x: 0.5, y: 1 },
        bottomLeft: { x: 0.25, y: 1 },
      },
      {
        id: "slot-3",
        topLeft: { x: 0.5, y: 0 },
        topRight: { x: 0.75, y: 0 },
        bottomRight: { x: 0.75, y: 1 },
        bottomLeft: { x: 0.5, y: 1 },
      },
      {
        id: "slot-4",
        topLeft: { x: 0.75, y: 0 },
        topRight: { x: 1, y: 0 },
        bottomRight: { x: 1, y: 1 },
        bottomLeft: { x: 0.75, y: 1 },
      },
    ],
  },
  // 4 photos en carré (grille 2x2)
  {
    id: "collage-4-square",
    name: "4 photos en carré",
    preview: null,
    backgroundImage: null,
    isPremium: false,
    isPredefined: true,
    isCustom: false,
    category: "square",
    photoCount: 4,
    slots: [
      {
        id: "slot-1",
        topLeft: { x: 0, y: 0 },
        topRight: { x: 0.5, y: 0 },
        bottomRight: { x: 0.5, y: 0.5 },
        bottomLeft: { x: 0, y: 0.5 },
      },
      {
        id: "slot-2",
        topLeft: { x: 0.5, y: 0 },
        topRight: { x: 1, y: 0 },
        bottomRight: { x: 1, y: 0.5 },
        bottomLeft: { x: 0.5, y: 0.5 },
      },
      {
        id: "slot-3",
        topLeft: { x: 0, y: 0.5 },
        topRight: { x: 0.5, y: 0.5 },
        bottomRight: { x: 0.5, y: 1 },
        bottomLeft: { x: 0, y: 1 },
      },
      {
        id: "slot-4",
        topLeft: { x: 0.5, y: 0.5 },
        topRight: { x: 1, y: 0.5 },
        bottomRight: { x: 1, y: 1 },
        bottomLeft: { x: 0.5, y: 1 },
      },
    ],
  },
];

/**
 * Récupère un template prédéfini par son ID
 */
export const getPredefinedTemplate = (id) => {
  return PREDEFINED_TEMPLATES.find((t) => t.id === id);
};

/**
 * Récupère tous les templates prédéfinis
 */
export const getAllPredefinedTemplates = () => {
  return PREDEFINED_TEMPLATES;
};

/**
 * Vérifie si un template est prédéfini
 */
export const isPredefinedTemplate = (templateId) => {
  return PREDEFINED_TEMPLATES.some((t) => t.id === templateId);
};

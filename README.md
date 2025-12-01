# **Klic**

Klic transforme votre iPhone en photobooth autonome, élégant et simple d’utilisation.
Pensé pour les soirées, mariages, évènements, cafés, créateurs et tous ceux qui veulent des bandes photos propres et instantanées.

## **📸 Ce que fait Klic**

Klic lance automatiquement une session photo, génère des bandes au design soigné et exporte des fichiers HD, prêts à partager ou imprimer.
Aucune manipulation nécessaire : l’iPhone travaille seul.

## **✨ Fonctionnalités principales**

### **Mode Photobooth autonome**

Prises automatiques, minuteur intelligent, vibrations de feedback.
Fonctionne sans toucher l’écran.
Parfait pour les évènements.

### **Bandes photos professionnelles**

Templates horizontaux, verticaux, carrés.
Ratios propres (4:3, 3:2, 1:1).
Collages multiposes automatisés.
Qualité haute résolution.

### **Outils créatifs**

Stickers animés.
Effet “Polaroid / shake to reveal”.
Filtres et réglages colorimétriques.
Zoom, recadrage, alignement.

### **Moteur intelligent**

Adaptation automatique à l’appareil et au ratio.
Résolution dynamique.
Correction d’éclairage simple.

### **Version Premium (RevenueCat)**

Abonnements hebdomadaire, mensuel ou lifetime.
Déblocage des templates avancés et effets premium.
Suppression du watermark.

---

## **🧪 Stack technique**

React Native (Expo)
iOS (iPhone uniquement)
VisionCamera pour la capture
Skia pour le rendu des templates
RevenueCat pour les abonnements
MMKV pour le stockage
Jest pour les tests

---

## **📚 Architecture du projet**

**modules/** – capture, templates, export
**components/** – UI, boutons, modales
**features/** – photobooth, minuteur, éditeur
**constants/** – ratios, layouts, configuration
**services/** – RevenueCat, cache, filesystem
**assets/** – stickers, polaroids, frames
**utils/** – helpers, calculs de sizing

## **🚀 Utilisation**

Placer l’iPhone sur un support ou trépied.
Ouvrir Klic → lancer le mode Photobooth.
La session s’opère seule.
Les bandes photos sont générées automatiquement.
L’utilisateur exporte ou partage instantanément.

## **🔒 Confidentialité**

Aucune donnée personnelle stockée ou transmise.
Traitement local uniquement.
Aucun tracking.

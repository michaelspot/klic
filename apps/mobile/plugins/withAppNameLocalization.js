const { withXcodeProject } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const withAppNameLocalization = (config) => {
  return withXcodeProject(config, async (config) => {
    const projectRoot = config.modRequest.projectRoot;
    const iosPath = path.join(projectRoot, 'ios');
    const projectName = config.modRequest.projectName || 'Boothy';
    const projectPath = path.join(iosPath, projectName);

    // Vérifier si les fichiers de localisation existent déjà
    const localizations = ['en', 'fr', 'es', 'de', 'it', 'pt'];
    
    try {
      const project = config.modResults;
      const pbxGroupKey = project.findPBXGroupKey({ name: projectName });

      localizations.forEach((lang) => {
        const lprojDir = path.join(projectPath, `${lang}.lproj`);
        
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(lprojDir)) {
          fs.mkdirSync(lprojDir, { recursive: true });
        }

        const infoPlistStringsPath = path.join(lprojDir, 'InfoPlist.strings');
        
        // Ajouter le fichier au projet Xcode s'il existe
        if (fs.existsSync(infoPlistStringsPath)) {
          const fileRef = project.addResourceFile(
            `${lang}.lproj/InfoPlist.strings`,
            { target: project.getFirstTarget().uuid },
            pbxGroupKey
          );
          
          if (fileRef) {
            // Ajouter les propriétés de localisation
            const file = project.pbxFileReferenceSection()[fileRef.fileRef];
            if (file) {
              file.lastKnownFileType = 'text.plist.strings';
            }
          }
        }
      });
    } catch (error) {
      console.log('Note: Could not add localization files to Xcode project:', error.message);
    }

    return config;
  });
};

module.exports = withAppNameLocalization;

import { useState, useEffect } from 'react';
import { t, initializeLanguage, setLanguage, getCurrentLanguage } from '../utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useTranslation() {
  const [language, setLanguageState] = useState(getCurrentLanguage());

  useEffect(() => {
    initializeLanguage().then(() => {
      setLanguageState(getCurrentLanguage());
    });
  }, []);

  const changeLanguage = async (newLang) => {
    try {
      setLanguage(newLang);
      setLanguageState(newLang);
      
      // Sauvegarder dans les paramètres
      const savedSettings = await AsyncStorage.getItem('thismoment_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings.language = newLang;
      await AsyncStorage.setItem('thismoment_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return {
    t,
    language,
    changeLanguage,
  };
}

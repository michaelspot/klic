import { useState, useEffect } from "react";
import { useColorScheme } from "react-native";

/**
 * Hook pour gérer le thème de l'application en mode automatique uniquement
 * Suit automatiquement le thème système (dark/light)
 */
export function useTheme() {
  const systemColorScheme = useColorScheme(); // Thème système (dark ou light)
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");

  // Mettre à jour isDark quand le système change
  useEffect(() => {
    setIsDark(systemColorScheme === "dark");
    console.log("Thème automatique - Système:", systemColorScheme, "isDark:", systemColorScheme === "dark");
  }, [systemColorScheme]);

  return {
    isDark,
    systemColorScheme,
  };
}
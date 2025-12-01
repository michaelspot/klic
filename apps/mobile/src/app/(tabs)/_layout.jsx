import { Tabs } from "expo-router";
import { useEffect } from "react";
import {
  Camera,
  Images,
  Settings,
  Edit,
  Crown,
  CheckCircle,
  Grid,
} from "lucide-react-native";

export default function TabLayout() {
  useEffect(() => {
    console.log('[APP] TabLayout mounted');
  }, []);

  console.log('[APP] Rendering TabLayout');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "none", // Masque complètement la barre d'onglets
        },
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#6B6B6B",
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="camera/index"
        options={{
          title: "Caméra",
          tabBarIcon: ({ color, size }) => <Camera color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: "Galerie",
          tabBarIcon: ({ color, size }) => <Images color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="photo-editor"
        options={{
          href: null, // Masqué de la barre de tabs
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          title: "Premium",
          tabBarIcon: ({ color, size }) => <Crown color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="session-complete"
        options={{
          href: null, // Masqué de la barre de tabs
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Paramètres",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="template-selector"
        options={{
          href: null, // Masqué de la barre de tabs
        }}
      />
      <Tabs.Screen
        name="template-library"
        options={{
          href: null, // Masqué de la barre de tabs
        }}
      />
      <Tabs.Screen
        name="template-creator"
        options={{
          href: null, // Masqué de la barre de tabs
        }}
      />
    </Tabs>
  );
}

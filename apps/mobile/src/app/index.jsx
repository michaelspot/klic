import { Redirect } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    console.log('📍 [APP] Index screen mounted, redirecting to camera...');
  }, []);

  console.log('🏠 [APP] Rendering Index screen');
  
  return <Redirect href="/(tabs)/camera/" />;
}

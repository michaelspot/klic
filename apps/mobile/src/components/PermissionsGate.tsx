import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface PermissionsGateProps {
  children: React.ReactNode;
}

export function PermissionsGate({ children }: PermissionsGateProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Les permissions sont demandées par AppDelegate.swift au niveau natif
    // On attend juste un peu pour laisser le temps aux modules de s'initialiser
    const timer = setTimeout(() => {
      console.log('✅ App prête à démarrer');
      setIsReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Chargement...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
});

console.log('🚀🚀🚀 [APP] index.tsx loading... 🚀🚀🚀');

import ExceptionsManager from 'react-native/Libraries/Core/ExceptionsManager';
import { Alert } from 'react-native';

// Global error handler
// @ts-ignore - ErrorUtils exists at runtime but not in types
if (typeof global.ErrorUtils !== 'undefined') {
  // @ts-ignore
  const originalHandler = global.ErrorUtils.getGlobalHandler();
  // @ts-ignore
  global.ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
    console.error('❌❌❌ [APP] Global error caught:', error);
    console.error('💥 [APP] Is fatal:', isFatal);
    console.error('📋 [APP] Error stack:', error?.stack);
    console.error('📋 [APP] Error message:', error?.message);
    console.error('📋 [APP] Error name:', error?.name);
    
    // Si c'est une erreur de module natif, ne pas crasher
    if (error?.message?.includes('RCTNativeModule') || 
        error?.message?.includes('invoke') ||
        error?.message?.includes('NativeModules')) {
      console.warn('⚠️ [APP] Native module error caught, preventing crash');
      return; // Ne pas crasher
    }
    
    // Call original handler pour les autres erreurs
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
} else {
  console.log('⚠️ [APP] ErrorUtils not available, skipping global error handler');
}

if (__DEV__) {
  console.log('🔧 [APP] Running in DEV mode');
  ExceptionsManager.handleException = (error, isFatal) => {
    console.log('🐛 [APP] DEV exception:', error);
    // no-op
  };
}

console.log('📦 [APP] Loading polyfills...');
import 'react-native-url-polyfill/auto';
import './src/__create/polyfills';
global.Buffer = require('buffer').Buffer;

console.log('✅ [APP] Polyfills loaded successfully');

import 'expo-router/entry';
import { SplashScreen } from 'expo-router';
import { App } from 'expo-router/build/qualified-entry';
import { type ReactNode, memo, useEffect } from 'react';
import { AppRegistry, LogBox, SafeAreaView, Text, View } from 'react-native';
import { serializeError } from 'serialize-error';
import { DeviceErrorBoundaryWrapper } from './__create/DeviceErrorBoundary';
import { ErrorBoundaryWrapper, SharedErrorBoundary } from './__create/SharedErrorBoundary';

console.log('🎯 [APP] Expo Router loaded successfully');

if (__DEV__) {
  console.log('🔧 [APP] Running in DEV mode - Setting up dev tools');
  LogBox.ignoreAllLogs();
  LogBox.uninstall();
  function WrapperComponentProvider({
    children,
  }: {
    children: ReactNode;
  }) {
    return <DeviceErrorBoundaryWrapper>{children}</DeviceErrorBoundaryWrapper>;
  }

  AppRegistry.setWrapperComponentProvider(() => WrapperComponentProvider);
  console.log('📱 [APP] Registering app component (DEV)...');
  AppRegistry.registerComponent('main', () => App);
  console.log('✅ [APP] App registered successfully (DEV)');
} else {
  console.log('🏭 [APP] Running in PRODUCTION mode');
  // CRITICAL: Register app in production mode too!
  console.log('📱 [APP] Registering app component (PRODUCTION)...');
  AppRegistry.registerComponent('main', () => App);
  console.log('✅ [APP] App registered successfully (PRODUCTION)');
}

console.log('🎉🎉🎉 [APP] Initialization complete! 🎉🎉🎉');

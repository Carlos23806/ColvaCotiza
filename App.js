import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { PDFProvider } from './src/context/PDFContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NotificationProvider>
          <PDFProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </PDFProvider>
        </NotificationProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
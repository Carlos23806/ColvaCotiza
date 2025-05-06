import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { MainScreen } from '../screens/MainScreen';
import { ProductSelectionScreen } from '../screens/ProductSelectionScreen';
import { HistorialScreen } from '../screens/HistorialScreen';
import { ClientFormScreen } from '../screens/ClientFormScreen';
import { ProductManagementScreen } from '../screens/ProductManagementScreen';
import { UserManagementScreen } from '../screens/UserManagementScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Pantallas sin barra de navegación */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: false }} 
        />

        {/* Pantallas con barra de navegación */}
        <Stack.Screen 
          name="Main" 
          component={MainScreen} 
          options={{ title: 'Inicio' }} 
        />
        <Stack.Screen 
          name="ProductSelection" 
          component={ProductSelectionScreen} 
          options={{ title: 'Seleccionar Productos' }} 
        />
        <Stack.Screen 
          name="Historial" 
          component={HistorialScreen} 
          options={{ title: 'Historial de Cotizaciones' }} 
        />
        <Stack.Screen 
          name="ClientForm" 
          component={ClientFormScreen} 
          options={{ title: 'Datos del Cliente' }} 
        />
        <Stack.Screen 
          name="ProductManagement" 
          component={ProductManagementScreen} 
          options={{ title: 'Gestión de Productos' }} 
        />
        <Stack.Screen 
          name="UserManagement" 
          component={UserManagementScreen} 
          options={{ title: 'Gestión de Usuarios' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
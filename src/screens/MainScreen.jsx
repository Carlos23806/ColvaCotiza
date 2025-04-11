import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export const MainScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Reset navigation first, then logout - this prevents the blank screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      
      // Then do the actual logout
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const menuOptions = [
    {
      title: 'Nueva Cotización',
      description: 'Crear y gestionar nuevas cotizaciones para clientes',
      route: 'ProductSelection',
      role: ['admin', 'client']
    },
    {
      title: 'Historial de Cotizaciones',
      description: 'Ver el historial de cotizaciones realizadas',
      route: 'Historial',
      role: ['admin', 'client']
    },
    {
      title: 'Gestionar Productos',
      description: 'Administrar el inventario y catálogo de productos',
      route: 'ProductManagement',
      role: ['admin']
    },
    {
      title: 'Gestionar Usuarios',
      description: 'Administrar usuarios y sus permisos en el sistema',
      route: 'UserManagement',
      role: ['admin']
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.welcome}>Bienvenido, {user.username}</Text>
        <Text style={styles.roleText}>Rol: {user.role}</Text>

        <View style={styles.menuContainer}>
          {menuOptions
            .filter(option => option.role.includes(user.role))
            .map((option, index) => (
              <View key={index} style={styles.menuItem}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate(option.route)}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonTitle} numberOfLines={2} ellipsizeMode="tail">{option.title}</Text>
                    <Text style={styles.buttonDescription} numberOfLines={3} ellipsizeMode="tail">{option.description}</Text>
                  </View>
                </Button>
              </View>
            ))}
        </View>
      </ScrollView>
      
      <Button 
        mode="contained"
        onPress={handleLogout}
        style={[styles.logoutButton, { backgroundColor: '#0b3d93' }]}
        labelStyle={styles.logoutLabel}
      >
        Cerrar Sesión
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
    flexGrow: 1,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0b3d93',
  },
  roleText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 30,
  },
  menuContainer: {
    gap: 16,
    width: '100%',
  },
  menuItem: {
    width: '100%',
    marginBottom: 10,
  },
  button: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'transparent',
    width: '100%',
    minHeight: 80,
  },
  buttonContent: {
    height: 'auto',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 0,
  },
  buttonTextContainer: {
    alignItems: 'flex-start',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexShrink: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#2d2d2d',
    textAlign: 'left',
    flexWrap: 'wrap',
    width: '100%',
  },
  buttonDescription: {
    fontSize: 14,
    color: '#444',
    textAlign: 'left',
    lineHeight: 20,
    flexWrap: 'wrap',
    width: '100%',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    borderRadius: 4,
    paddingVertical: 8,
    width: '90%',
  },
  logoutLabel: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
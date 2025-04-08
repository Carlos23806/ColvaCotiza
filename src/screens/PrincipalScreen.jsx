import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';

export const PrincipalScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: 'Nueva Cotización',
      description: 'Crear una nueva cotización para un cliente',
      icon: 'file-document-outline',
      onPress: () => navigation.navigate('Cotizacion'),
      role: ['admin', 'client'],
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: 'account-group',
      onPress: () => navigation.navigate('Users'),
      role: ['admin'],
    },
    // Agrega más opciones según necesites
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.welcome}>Bienvenido, {user.username}</Title>
        <Paragraph style={styles.role}>Rol: {user.role}</Paragraph>
      </View>

      <View style={styles.content}>
        {menuItems
          .filter(item => item.role.includes(user.role))
          .map((item, index) => (
            <Card 
              key={index} 
              style={styles.card}
              onPress={item.onPress}
            >
              <Card.Content>
                <Title>{item.title}</Title>
                <Paragraph>{item.description}</Paragraph>
              </Card.Content>
            </Card>
          ))}
      </View>

      <Button 
        mode="outlined" 
        onPress={logout}
        style={styles.logoutButton}
      >
        Cerrar Sesión
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: "#0b3d93",
  },
  welcome: {
    color: "#fff",
    fontSize: 20,
  },
  role: {
    color: "#fff",
    opacity: 0.8,
  },
  content: {
    padding: 120,
  },
  card: {
    marginBottom: 120,
  },
  logoutButton: {
    margin: 60,
  },
});
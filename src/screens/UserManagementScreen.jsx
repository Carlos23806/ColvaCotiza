import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Portal, Dialog, RadioButton, Text } from 'react-native-paper';
import { db } from '../api/database';

export const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('client');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await db.userService.getAllUsers();
      if (data) {
        setUsers(Array.isArray(data) ? data : Object.entries(data));
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
      console.error(error);
    }
  };

  const handleRoleChange = async () => {
    try {
      const success = await db.userService.updateUser(selectedUser.id, {
        role: selectedRole
      });
      
      if (success) {
        loadUsers();
        setVisible(false);
        setSelectedUser(null);
        Alert.alert('Éxito', 'Rol actualizado correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el rol');
      console.error(error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const success = await db.userService.deleteUser(userId);
      if (success) {
        loadUsers();
        Alert.alert('Éxito', 'Usuario eliminado correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el usuario');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {users.map(([id, user]) => (
          <Card key={id} style={styles.card}>
            <Card.Content>
              <Title>{user.username}</Title>
              <Paragraph>ID: {id}</Paragraph>
              <Paragraph>Rol: {user.role}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button 
                onPress={() => {
                  setSelectedUser(user);
                  setSelectedRole(user.role);
                  setVisible(true);
                }}
                disabled={user.role === 'admin'}
              >
                Cambiar Rol
              </Button>
              <Button 
                onPress={() => handleDelete(id)}
                disabled={user.role === 'admin'}
              >
                Eliminar
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Cambiar Rol de Usuario</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group 
              onValueChange={value => setSelectedRole(value)} 
              value={selectedRole}
            >
              <View style={styles.radioOption}>
                <RadioButton value="client" />
                <Text>Cliente</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="admin" />
                <Text>Administrador</Text>
              </View>
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancelar</Button>
            <Button onPress={handleRoleChange}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
});
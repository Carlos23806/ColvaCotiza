import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator, IconButton, Portal, Modal, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { supabase } from '../api/supabase';

export const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedRole, setEditedRole] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, username, role, state');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditedUsername(user.username || '');
    setEditedRole(user.role || 'client');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editedUsername.trim()) {
        Alert.alert('Error', 'El nombre de usuario es requerido');
        return;
      }

      const { error } = await supabase
        .from('usuarios')
        .update({
          username: editedUsername.trim(),
          role: editedRole
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      Alert.alert('Éxito', 'Usuario actualizado correctamente');
      setEditModalVisible(false);
      loadUsers();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo actualizar el usuario');
    }
  };

  const toggleUserState = async (userId, currentState) => {
    try {
      const newState = currentState === 'activo' ? 'inactivo' : 'activo';
      const { error } = await supabase
        .from('usuarios')
        .update({ state: newState })
        .eq('id', userId);

      if (error) throw error;

      Alert.alert('Éxito', `Usuario ${newState === 'activo' ? 'activado' : 'desactivado'} correctamente`);
      loadUsers();
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado del usuario');
    }
  };

  const renderUser = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.username || 'Sin nombre'}</Title>
        <Paragraph>ID: {item.id || 'N/A'}</Paragraph>
        <Paragraph>Rol: {item.role || 'N/A'}</Paragraph>
        <View style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={() => toggleUserState(item.id, item.state)}
            style={[
              styles.stateButton,
              { backgroundColor: item.state === 'activo' ? '#4CAF50' : '#f44336' }
            ]}
          >
            {item.state === 'activo' ? 'Activo' : 'Inactivo'}
          </Button>
          <IconButton
            icon="pencil"
            onPress={() => handleEdit(item)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0b3d93" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContent}
        onRefresh={loadUsers}
        refreshing={refreshing}
      />

      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Editar Usuario</Title>

          <TextInput
            label="Nombre de Usuario"
            value={editedUsername}
            onChangeText={setEditedUsername}
            style={styles.input}
            mode="outlined"
          />

          <SegmentedButtons
            value={editedRole}
            onValueChange={setEditedRole}
            buttons={[
              { value: 'client', label: 'Cliente' },
              { value: 'admin', label: 'Admin' },
            ]}
            style={styles.roleSelector}
          />

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setEditModalVisible(false)}
              style={styles.button}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveEdit}
              style={styles.button}
            >
              Guardar
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 8,
    elevation: 4,
  },
  listContent: {
    padding: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
  },
  stateButton: {
    marginRight: 10,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  roleSelector: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  button: {
    minWidth: 100,
  }
});
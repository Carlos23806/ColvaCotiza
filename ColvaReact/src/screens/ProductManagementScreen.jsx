import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput, Portal, Dialog } from 'react-native-paper';
import { supabase } from '../api/supabase';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const ProductManagementScreen = () => {
  const [products, setProducts] = useState([]);
  const [visible, setVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    unidades: '',
    costo: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*');

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los productos');
      console.error(error);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.nombre || !formData.unidades || !formData.costo) {
        Alert.alert('Error', 'Todos los campos son requeridos');
        return;
      }

      const productData = {
        nombre: formData.nombre,
        unidades: parseInt(formData.unidades),
        costo: parseFloat(formData.costo)
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('productos')
          .update(productData)
          .eq('id', editingProduct.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('productos')
          .insert(productData);
          
        if (error) throw error;
      }

      setVisible(false);
      setEditingProduct(null);
      setFormData({ nombre: '', unidades: '', costo: '' });
      loadProducts();
      Alert.alert('Éxito', editingProduct ? 'Producto actualizado' : 'Producto agregado');
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error(error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      unidades: product.unidades.toString(),
      costo: product.costo.toString()
    });
    setVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      loadProducts();
      Alert.alert('Éxito', 'Producto eliminado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el producto');
      console.error(error);
    }
  };

  const renderItem = ({ item }) => (
    <Card key={item.id} style={[styles.card, { backgroundColor: '#ffffff' }]}>
      <Card.Content>
        <Title style={{ color: '#0b3d93' }}>{item.nombre}</Title>
        <Paragraph style={{ color: '#000000' }}>Unidades: {item.unidades}</Paragraph>
        <Paragraph style={{ color: '#000000' }}>Precio: {formatCurrency(item.costo)}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button style={[styles.button, { borderBlockColor: '#0b3d93', borderWidth: 1 }]} textColor='#0b3d93' onPress={() => handleEdit(item)}>Editar</Button>
        <Button style={[styles.button, { backgroundColor: '#0b3d93' }]} textColor='#ffffff' onPress={() => handleDelete(item.id)}>Eliminar</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Button 
        mode="contained" 
        onPress={() => {
          setEditingProduct(null);
          setFormData({ nombre: '', unidades: '', costo: '' });
          setVisible(true);
        }}
        style={[styles.addButton, { backgroundColor: '#0b3d93' }]}
        textColor='#ffffff'
      >
        Agregar Producto
      </Button>

      <ScrollView>
        {products.map(product => renderItem({ item: product }))}
      </ScrollView>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>
            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nombre"
              value={formData.nombre}
              onChangeText={text => setFormData({...formData, nombre: text})}
              style={styles.input}
            />
            <TextInput
              label="Unidades"
              value={formData.unidades}
              onChangeText={text => setFormData({...formData, unidades: text})}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Precio"
              value={formData.costo}
              onChangeText={text => setFormData({...formData, costo: text})}
              keyboardType="numeric"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancelar</Button>
            <Button onPress={handleSave}>Guardar</Button>
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
  addButton: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
});
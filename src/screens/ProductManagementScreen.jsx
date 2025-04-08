import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput, Portal, Dialog } from 'react-native-paper';
import { supabase } from '../api/supabase';

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

  return (
    <View style={styles.container}>
      <Button 
        mode="contained" 
        onPress={() => {
          setEditingProduct(null);
          setFormData({ nombre: '', unidades: '', costo: '' });
          setVisible(true);
        }}
        style={styles.addButton}
      >
        Agregar Producto
      </Button>

      <ScrollView>
        {products.map(product => (
          <Card key={product.id} style={styles.card}>
            <Card.Content>
              <Title>{product.nombre}</Title>
              <Paragraph>Unidades: {product.unidades}</Paragraph>
              <Paragraph>Precio: ${product.costo}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => handleEdit(product)}>Editar</Button>
              <Button onPress={() => handleDelete(product.id)}>Eliminar</Button>
            </Card.Actions>
          </Card>
        ))}
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
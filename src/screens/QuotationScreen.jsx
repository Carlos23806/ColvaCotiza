import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, TextInput, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export const QuotationScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [totals, setTotals] = useState({ subtotal: 0, iva: 0, total: 0 });
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    // Simulación de carga de productos
    setProducts([
      { id: 1, name: 'Producto 1', price: 100 },
      { id: 2, name: 'Producto 2', price: 200 },
      { id: 3, name: 'Producto 3', price: 300 },
    ]);
  };

  const updateQuantity = (productId, quantity) => {
    const newSelectedProducts = {
      ...selectedProducts,
      [productId]: {
        ...selectedProducts[productId],
        quantity: parseInt(quantity) || 0
      }
    };
    setSelectedProducts(newSelectedProducts);
    calculateTotals(newSelectedProducts);
  };

  const calculateTotals = (selections) => {
    let subtotal = 0;
    Object.entries(selections).forEach(([productId, selection]) => {
      const product = products.find(p => p.id === parseInt(productId));
      if (product && selection.quantity) {
        subtotal += product.price * selection.quantity;
      }
    });
    const iva = subtotal * 0.19;
    setTotals({
      subtotal,
      iva,
      total: subtotal + iva
    });
  };

  const handleContinue = () => {
    const selections = Object.entries(selectedProducts)
      .filter(([_, selection]) => selection.quantity > 0)
      .map(([productId, selection]) => ({
        productId: parseInt(productId),
        quantity: selection.quantity,
        ...products.find(p => p.id === parseInt(productId))
      }));

    if (selections.length === 0) {
      alert('Seleccione al menos un producto');
      return;
    }

    navigation.navigate('ClientForm', {
      selections,
      totals
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Seleccione los productos</Title>
      
      {products.map(product => (
        <Card key={product.id} style={styles.card}>
          <Card.Content>
            <Title>{product.name}</Title>
            <Paragraph>Precio: ${product.price}</Paragraph>
            <TextInput
              label="Cantidad"
              keyboardType="numeric"
              value={selectedProducts[product.id]?.quantity?.toString() || ''}
              onChangeText={(text) => updateQuantity(product.id, text)}
              style={styles.input}
            />
          </Card.Content>
        </Card>
      ))}

      <Card style={styles.totalsCard}>
        <Card.Content>
          <Paragraph>Subtotal: ${totals.subtotal}</Paragraph>
          <Paragraph>IVA (19%): ${totals.iva}</Paragraph>
          <Title>Total: ${totals.total}</Title>
        </Card.Content>
      </Card>

      <Button 
        mode="contained" 
        onPress={handleContinue}
        style={styles.button}
      >
        Continuar
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginTop: 8,
  },
  totalsCard: {
    marginVertical: 16,
    backgroundColor: '#f5f5f5',
  },
  button: {
    marginVertical: 16,
  },
});
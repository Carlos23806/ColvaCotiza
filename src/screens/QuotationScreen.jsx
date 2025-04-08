import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, TextInput, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';

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

  const handleAddEnvironment = () => {
    // Logic for adding environment
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {products.map(product => (
          <View key={product.id} style={styles.environmentContainer}>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.productContainer}>
                  <Title>{product.name}</Title>
                  <Paragraph>Precio: ${product.price}</Paragraph>
                  <TextInput
                    label="Cantidad"
                    keyboardType="numeric"
                    value={selectedProducts[product.id]?.quantity?.toString() || ''}
                    onChangeText={(text) => updateQuantity(product.id, text)}
                    style={styles.input}
                  />
                </View>
              </Card.Content>
            </Card>
          </View>
        ))}
        <View style={styles.addButtonContainer}>
          <Button 
            mode="contained"
            onPress={handleAddEnvironment}
            style={[styles.addButton]}
            buttonColor="#0b3d93"
            textColor="white"
          >
            Agregar Ambiente
          </Button>
        </View>
      </ScrollView>

      <View style={styles.continueButtonContainer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          style={[styles.continueButton]}
          buttonColor="#0b3d93"
          textColor="white"
        >
          Continuar
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  environmentContainer: {
    marginBottom: 15,
  },
  card: {
    marginBottom: 10,
    elevation: 4,
  },
  productContainer: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  addButtonContainer: {
    paddingVertical: 20,
    marginBottom: 80, // Aumentado para dar más espacio
  },
  addButton: {
    marginVertical: 10,
    borderRadius: 8,
  },
  continueButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'white',
    elevation: 8,
    marginTop: 20, // Añadido margen superior
  },
  continueButton: {
    borderRadius: 8,
  },
  input: {
    marginTop: 8,
  },
});
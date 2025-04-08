import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Card } from 'react-native-paper';
import { supabase } from '../api/supabase';

export const ProductSelectionScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [environments, setEnvironments] = useState([{ id: 1, selections: {} }]);
  const [availableQuantities, setAvailableQuantities] = useState({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('productos') // Corregido: usando el nombre correcto de la tabla
        .select('*');
      
      if (error) throw error;
      
      setProducts(data);
      const quantities = {};
      data.forEach(product => {
        quantities[product.id] = product.unidades;
      });
      setAvailableQuantities(quantities);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      Alert.alert('Error', error.message);
    }
  };

  const addEnvironment = () => {
    if (environments.length < 5) {
      setEnvironments([...environments, {
        id: environments.length + 1,
        selections: {}
      }]);
    }
  };

  const updateSelection = (environmentId, productId, quantity) => {
    const numQuantity = quantity ? parseInt(quantity) : 0;
    // Validate quantity
    if (numQuantity < 0) return;

    // Calculate total used in other environments
    const usedInOtherEnvironments = environments.reduce((total, env) => {
      if (env.id !== environmentId && env.selections[productId]) {
        return total + parseInt(env.selections[productId]);
      }
      return total;
    }, 0);

    const product = products.find(p => p.id === productId);
    const maxAvailable = product.unidades - usedInOtherEnvironments;

    if (numQuantity > maxAvailable) {
      Alert.alert('Error', 'Cantidad excede el disponible');
      return;
    }

    setEnvironments(environments.map(env => {
      if (env.id === environmentId) {
        return {
          ...env,
          selections: {
            ...env.selections,
            [productId]: quantity
          }
        };
      }
      return env;
    }));
  };

  const getAvailableForProduct = (productId, environmentId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;

    const usedInOtherEnvironments = environments.reduce((total, env) => {
      if (env.id !== environmentId && env.selections[productId]) {
        return total + parseInt(env.selections[productId] || 0);
      }
      return total;
    }, 0);

    return product.unidades - usedInOtherEnvironments;
  };

  const handleContinue = () => {
    // Verificar si hay al menos un producto seleccionado
    const hasSelections = environments.some(env => 
      Object.values(env.selections).some(quantity => parseInt(quantity) > 0)
    );

    if (!hasSelections) {
      Alert.alert('Error', 'Debe seleccionar al menos un producto');
      return;
    }

    // Calcular totales
    let subtotal = 0;
    environments.forEach(env => {
      Object.entries(env.selections).forEach(([productId, quantity]) => {
        const product = products.find(p => p.id === parseInt(productId));
        if (product && quantity) {
          subtotal += product.costo * parseInt(quantity);
        }
      });
    });

    const iva = subtotal * 0.19;
    const total = subtotal + iva;

    // Navegar al formulario del cliente
    navigation.navigate('ClientForm', {
      selections: environments.reduce((acc, env) => {
        acc[env.id] = Object.entries(env.selections).reduce((envAcc, [productId, quantity]) => {
          if (quantity && parseInt(quantity) > 0) {
            const product = products.find(p => p.id === parseInt(productId));
            envAcc[productId] = {
              quantity: parseInt(quantity),
              price: product.costo
            };
          }
          return envAcc;
        }, {});
        return acc;
      }, {}),
      totals: {
        subtotal,
        iva,
        total
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {environments.map(env => (
          <Card key={env.id} style={styles.environmentCard}>
            <Card.Title title={`Ambiente ${env.id}`} />
            <Card.Content>
              {products.map(product => {
                const available = getAvailableForProduct(product.id, env.id);
                return (
                  <View key={product.id} style={styles.productRow}>
                    <Text>{product.nombre}</Text>
                    <Text>Disponible: {available}</Text>
                    {available > 0 && (
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={env.selections[product.id] || ''}
                        onChangeText={(text) => updateSelection(env.id, product.id, text)}
                      />
                    )}
                  </View>
                );
              })}
            </Card.Content>
          </Card>
        ))}
        
        {environments.length < 5 && (
          <Button 
            mode="contained" 
            onPress={addEnvironment}
            style={styles.addButton}
          >
            Agregar Ambiente
          </Button>
        )}
      </ScrollView>

      <Button
        mode="contained"
        onPress={handleContinue}
        style={styles.continueButton} 
      >
        Continuar
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  environmentCard: {
    marginBottom: 16,
    padding: 16,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    width: 80,
  },
  addButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  continueButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#0b3d93',
  },
});
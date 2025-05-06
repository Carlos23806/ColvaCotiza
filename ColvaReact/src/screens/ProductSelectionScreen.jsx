import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Card } from 'react-native-paper';
import { supabase } from '../api/supabase';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const ProductSelectionScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [environments, setEnvironments] = useState([{ id: 1, selections: {} }]);
  const [availableQuantities, setAvailableQuantities] = useState({});
  const [totals, setTotals] = useState({ subtotal: 0, iva: 0, total: 0 });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [environments, products]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
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
    if (numQuantity < 0) return;
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

  const calculateTotals = () => {
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
    setTotals({ subtotal, iva, total });
  };

  const handleContinue = () => {
    const hasSelections = environments.some(env =>
      Object.values(env.selections).some(quantity => parseInt(quantity) > 0)
    );
    if (!hasSelections) {
      Alert.alert('Error', 'Debe seleccionar al menos un producto');
      return;
    }
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
      totals
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {environments.map(env => (
          <Card key={env.id} style={styles.environmentCard}>
            <Card.Title
              title={`Ambiente ${env.id}`}
              titleStyle={styles.cardTitle}
            />
            <Card.Content style={styles.cardContent}>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View>
                  <View style={styles.headerRow}>
                    <Text style={[styles.headerText, styles.colProducto]}>Producto</Text>
                    <Text style={[styles.headerText, styles.colDisponible]}>Disponible</Text>
                    <Text style={[styles.headerText, styles.colPrecio]}>Precio</Text>
                    <Text style={[styles.headerText, styles.colCantidad]}>Cantidad</Text>
                  </View>
                  
                  {products.map(product => {
                    const available = getAvailableForProduct(product.id, env.id);
                    return (
                      <View key={product.id} style={styles.productRow}>
                        <Text style={[styles.productText, styles.colProducto]} numberOfLines={2}>
                          {product.nombre}
                        </Text>
                        <Text style={[styles.productText, styles.colDisponible]}>
                          {available}
                        </Text>
                        <Text style={[styles.productText, styles.colPrecio]}>
                          {formatCurrency(product.costo)}
                        </Text>
                        <View style={styles.colCantidad}>
                          {available > 0 ? (
                            <TextInput
                              style={styles.input}
                              textColor='#000000'
                              keyboardType="numeric"
                              value={env.selections[product.id] || ''}
                              onChangeText={(text) => updateSelection(env.id, product.id, text)}
                              theme={{ colors: { text: '#000000' } }}
                            />
                          ) : (
                            <Text style={styles.unavailableText}>No disponible</Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </Card.Content>
          </Card>
        ))}
        {environments.length < 5 && (
          <Button
            mode="contained"
            onPress={addEnvironment}
            style={[styles.addButton, { backgroundColor: '#0b3d93' }]}
            textColor='#ffffff'
          >
            Agregar Ambiente
          </Button>
        )}
      </ScrollView>

      {/* Totales */}
      <View style={styles.totalsContainer}>
        <Text style={styles.totalText}>Subtotal: {formatCurrency(totals.subtotal)}</Text>
        <Text style={styles.totalText}>IVA (19%): {formatCurrency(totals.iva)}</Text>
        <Text style={[styles.totalText, styles.totalBold]}>Total: {formatCurrency(totals.total)}</Text>
      </View>

      <Button
        mode="contained"
        onPress={handleContinue}
        style={[styles.continueButton, { borderBlockColor: '#0b3d93', borderWidth: 1 }]}
        textColor='#0b3d93'
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
    backgroundColor: '#ffffff',
  },
  environmentCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardTitle: {
    color: '#000000',
    fontWeight: 'bold',
  },
  cardContent: {
    backgroundColor: '#ffffff',
    padding: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  headerText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productText: {
    color: '#000000',
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  colProducto: {
    width: 200,
    paddingHorizontal: 10,
  },
  colDisponible: {
    width: 100,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  colPrecio: {
    width: 150,
    textAlign: 'right',
    paddingHorizontal: 10,
  },
  colCantidad: {
    width: 100,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  input: {
    width: 80,
    height: 40,
    backgroundColor: '#ffffff',
    textAlign: 'center',
    color: '#000000',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 4,
  },
  unavailableText: {
    color: '#999999',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  addButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  totalsContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 16,
    color: '#000000',
    marginVertical: 2,
    textAlign: 'center',
  },
  totalBold: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: '#ffffff',
  },
  horizontalScrollContent: {
    flexDirection: 'row',
    minWidth: 400, // Ajusta según el mínimo deseado para forzar scroll si es necesario
  },
});
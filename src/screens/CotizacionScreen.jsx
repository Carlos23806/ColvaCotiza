import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Button } from 'react-native-paper';

export const CotizacionScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Cotizaciones</Title>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('ProductSelection')}
        style={styles.button}
      >
        Nueva Cotización
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Historial')}
        style={styles.button}
      >
        Ver Historial
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
  },
});

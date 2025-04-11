import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Portal, Dialog, DataTable, FAB } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { db } from '../api/database';
import { generatePDF, openPDF } from '../utils/pdfGenerator';

export const HistorialScreen = ({ navigation }) => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [visible, setVisible] = useState(false);
  const [pdfPath, setPdfPath] = useState(null);
  const { user } = useAuth();

  const loadCotizaciones = useCallback(async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Usuario no identificado');
      return;
    }
    try {
      const data = await db.getCotizaciones(user.id);
      setCotizaciones(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el historial');
    }
  }, [user]);

  useEffect(() => {
    loadCotizaciones();
    const interval = setInterval(loadCotizaciones, 30000);
    return () => clearInterval(interval);
  }, [loadCotizaciones]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadCotizaciones);
    return unsubscribe;
  }, [navigation, loadCotizaciones]);

  const handleDownloadPDF = async (cotizacion) => {
    try {
      const detallesCotizacion = await db.getCotizacionDetalles(cotizacion.id);
      const result = await generatePDF(cotizacion, detallesCotizacion);
      
      if (result.success) {
        setPdfPath(result.filePath);
        Alert.alert('Éxito', result.message);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      Alert.alert('Error', error.message || 'No se pudo generar el PDF');
    }
  };

  const handleOpenPDF = async () => {
    if (!pdfPath) {
      Alert.alert('Error', 'Primero debe generar el PDF');
      return;
    }
    try {
      const opened = await openPDF(pdfPath);
      if (!opened) {
        throw new Error('No se pudo abrir el PDF');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el PDF');
    }
  };

  const showDetalles = async (cotizacion) => {
    try {
      setVisible(true);
      setSelectedCotizacion(cotizacion);
      const detallesCotizacion = await db.getCotizacionDetalles(cotizacion.id);
      if (!detallesCotizacion || detallesCotizacion.length === 0) {
        throw new Error('No se encontraron detalles para esta cotización');
      }
      setDetalles(detallesCotizacion);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      Alert.alert('Error', error.message || 'No se pudieron cargar los detalles');
      setVisible(false);
    }
  };

  const renderDetallesDialog = () => (
    <Portal>
      <Dialog visible={visible} onDismiss={() => setVisible(false)} style={styles.dialog}>
        <Dialog.Title>Detalles de Cotización #{selectedCotizacion?.numero_cliente}</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Ambiente</DataTable.Title>
                <DataTable.Title>Producto</DataTable.Title>
                <DataTable.Title numeric>Cantidad</DataTable.Title>
                <DataTable.Title numeric>Precio</DataTable.Title>
              </DataTable.Header>

              {detalles.map((detalle, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell>{detalle.ambiente}</DataTable.Cell>
                  <DataTable.Cell>{detalle.productos?.nombre}</DataTable.Cell>
                  <DataTable.Cell numeric>{detalle.cantidad}</DataTable.Cell>
                  <DataTable.Cell numeric>${detalle.precio_unitario}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>

            <View style={styles.totals}>
              <Paragraph>Subtotal: ${selectedCotizacion?.subtotal.toFixed(2)}</Paragraph>
              <Paragraph>IVA: ${selectedCotizacion?.iva.toFixed(2)}</Paragraph>
              <Title>Total: ${selectedCotizacion?.total.toFixed(2)}</Title>
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={() => setVisible(false)} textColor='#0b3d93'>Cerrar</Button>
          <Button 
            mode="contained"
            onPress={() => handleDownloadPDF(selectedCotizacion)}
            style={[styles.button, { backgroundColor: '#0b3d93' }]}
            textColor='#ffffff'
          >
            Descargar PDF
          </Button>
          <Button 
            onPress={handleOpenPDF}
            disabled={!pdfPath}
            textColor='#4a90e2'
          >
            Abrir PDF
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.textColor}>Cotización #{item.numero_cliente}</Title>
        <Paragraph style={styles.textColor}>Fecha: {new Date(item.fecha).toLocaleDateString()}</Paragraph>
        <Paragraph style={styles.textColor}>Cliente: {item.cliente_nombres} {item.cliente_apellidos}</Paragraph>
        <Paragraph style={styles.textColor}>Total: ${item.total.toFixed(2)}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="outlined"
          onPress={() => showDetalles(item)}
          style={[styles.button, { borderColor: '#0b3d93', backgroundColor: '#ffffff' }]}
          textColor="#0b3d93"
        >
          Ver Detalles
        </Button>
        <Button 
          mode="contained"
          onPress={() => handleDownloadPDF(item)}
          style={[styles.buttons, { backgroundColor: '#0b3d93' }]}
          textColor="#ffffff"
        >
          Descargar PDF
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cotizaciones}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        refreshing={false}
        onRefresh={loadCotizaciones}
      />
      {renderDetallesDialog()}
      <FAB
        style={[styles.fab, { backgroundColor: '#0b3d93' }]}
        icon="plus"
        onPress={() => navigation.navigate('Quotation')}
      />
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 10,
  },
  card: {
    marginBottom: 10,
    borderRadius: 8,
    borderBlockColor: '#cccccc',
    borderWidth: 1,
    backgroundColor: '#ffffff',
  },
  dialog: {
    maxHeight: '80%',
  },
  totals: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0ee',
    marginTop: 16,
  },
  button: {
    marginVertical: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  buttons: {
    marginVertical: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  textColor: {
    color: '#000',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Portal, Dialog, DataTable } from 'react-native-paper';
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
          <Button onPress={() => setVisible(false)}>Cerrar</Button>
          <Button onPress={() => handleDownloadPDF(selectedCotizacion)}>Descargar PDF</Button>
          <Button 
            onPress={handleOpenPDF}
            disabled={!pdfPath}
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
        <Title>Cotización #{item.numero_cliente}</Title>
        <Paragraph>Fecha: {new Date(item.fecha).toLocaleDateString()}</Paragraph>
        <Paragraph>Cliente: {item.cliente_nombres} {item.cliente_apellidos}</Paragraph>
        <Paragraph>Total: ${item.total.toFixed(2)}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => showDetalles(item)}>Ver Detalles</Button>
        <Button onPress={() => handleDownloadPDF(item)}>Descargar PDF</Button>
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
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  card: {
    marginBottom: 10,
  },
  dialog: {
    maxHeight: '80%',
  },
  totals: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 16,
  },
});

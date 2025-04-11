import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { db } from '../api/database';
import { generatePDF } from '../utils/pdfGenerator';

// Definir tipos de documento al inicio
const TIPOS_DOCUMENTO = [
  { label: 'Cédula de Ciudadanía', value: 'CC' },
  { label: 'Cédula de Extranjería', value: 'CE' },
  { label: 'Pasaporte', value: 'PA' },
  { label: 'NIT', value: 'NIT' },
];

export const ClientFormScreen = ({ navigation, route }) => {
  const { selections, totals } = route.params;
  const { user } = useAuth();
  const [showDocTypes, setShowDocTypes] = useState(false);
  const [formData, setFormData] = useState({
    tipo_documento: '',
    numero_documento: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.tipo_documento) {
      newErrors.tipo_documento = 'Selecciona un tipo de documento';
    }
    
    if (!formData.numero_documento) {
      newErrors.numero_documento = 'Ingresa el número de documento';
    }

    if (!formData.nombres) {
      newErrors.nombres = 'Ingresa los nombres';
    }

    if (!formData.apellidos) {
      newErrors.apellidos = 'Ingresa los apellidos';
    }

    if (!formData.telefono) {
      newErrors.telefono = 'Ingresa el teléfono';
    } else if (!/^\d{7,10}$/.test(formData.telefono)) {
      newErrors.telefono = 'Teléfono inválido (7-10 dígitos)';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    return {
      errors: newErrors,
      isValid: Object.keys(newErrors).length === 0,
    };
  };

  const handleSubmit = async () => {
    try {
      const { errors, isValid } = validateForm();
      setErrors(errors);
      if (!isValid) {
        return;
      }

      const cotizacionId = await db.createQuotation(user.id, formData, totals, selections);
      
      try {
        const detalles = await db.getCotizacionDetalles(cotizacionId);
        const cotizacion = await db.getCotizacion(cotizacionId);
        
        const pdfResult = await generatePDF(cotizacion, detalles);
        
        if (pdfResult.success) {
          Alert.alert(
            'Cotización Generada',
            `La cotización se ha guardado exitosamente.\n${pdfResult.message}`,
            [{ 
              text: 'OK',
              onPress: () => navigation.navigate('Principal')
            }]
          );
        } else {
          throw new Error(pdfResult.message);
        }
      } catch (error) {
        console.error('Error post-creación:', error);
        Alert.alert(
          'Cotización Guardada',
          'La cotización se guardó pero hubo un error al generar el PDF. Puede descargarlo desde el historial.',
          [{ 
            text: 'OK',
            onPress: () => navigation.navigate('Principal')
          }]
        );
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      Alert.alert('Error', error.message || 'Error al crear la cotización');
    }
  };

  const selectTipoDocumento = (tipo) => {
    setFormData({ ...formData, tipo_documento: tipo.value });
    setShowDocTypes(false);
  };

  const primaryColor = '#0b3d93';

  return (
    <View style={styles.container}>
      <Button
        mode="outlined"
        onPress={() => setShowDocTypes(true)}
        style={{ ...styles.input, borderBlockColor: primaryColor, borderWidth: 1 }}
        textColor={primaryColor}
      >
        {formData.tipo_documento ? 
          TIPOS_DOCUMENTO.find(t => t.value === formData.tipo_documento)?.label :
          'Seleccione tipo de documento'}
      </Button>
      
      {showDocTypes && (
        <View style={styles.docTypeList}>
          {TIPOS_DOCUMENTO.map((tipo) => (
            <Button
              key={tipo.value}
              mode="text"
              onPress={() => selectTipoDocumento(tipo)}
              style={styles.docTypeButton}
              textColor={primaryColor}
            >
              {tipo.label}
            </Button>
          ))}
        </View>
      )}
      <HelperText type="error" visible={!!errors.tipo_documento}>
        {errors.tipo_documento}
      </HelperText>

      <TextInput
        label="Número de Documento"
        value={formData.numero_documento}
        onChangeText={(text) => setFormData({ ...formData, numero_documento: text })}
        keyboardType="numeric"
        maxLength={15}
        error={!!errors.numero_documento}
        style={styles.input}
        textColor="#000000"
        mode="flat"
        theme={{ colors: { primary: primaryColor, text: '#000000', placeholder: primaryColor, onSurfaceVariant: primaryColor } }}
        underlineColor="#cccccc"
        activeUnderlineColor={primaryColor}
      />
      <HelperText type="error" visible={!!errors.numero_documento}>
        {errors.numero_documento}
      </HelperText>

      <TextInput
        label="Nombres"
        value={formData.nombres}
        onChangeText={(text) => setFormData({ ...formData, nombres: text })}
        error={!!errors.nombres}
        style={styles.input}
        textColor="#000000"
        mode="flat"
        theme={{ colors: { primary: primaryColor, text: '#000000', placeholder: primaryColor, onSurfaceVariant: primaryColor } }}
        underlineColor="#cccccc"
        activeUnderlineColor={primaryColor}
      />
      <HelperText type="error" visible={!!errors.nombres}>
        {errors.nombres}
      </HelperText>

      <TextInput
        label="Apellidos"
        value={formData.apellidos}
        onChangeText={(text) => setFormData({ ...formData, apellidos: text })}
        error={!!errors.apellidos}
        style={styles.input}
        textColor="#000000"
        mode="flat"
        theme={{ colors: { primary: primaryColor, text: '#000000', placeholder: primaryColor, onSurfaceVariant: primaryColor } }}
        underlineColor="#cccccc"
        activeUnderlineColor={primaryColor}
      />
      <HelperText type="error" visible={!!errors.apellidos}>
        {errors.apellidos}
      </HelperText>

      <TextInput
        label="Teléfono"
        value={formData.telefono}
        onChangeText={(text) => setFormData({ ...formData, telefono: text })}
        keyboardType="phone-pad"
        maxLength={10}
        error={!!errors.telefono}
        style={styles.input}
        textColor="#000000"
        mode="flat"
        theme={{ colors: { primary: primaryColor, text: '#000000', placeholder: primaryColor, onSurfaceVariant: primaryColor } }}
        underlineColor="#cccccc"
        activeUnderlineColor={primaryColor}
      />
      <HelperText type="error" visible={!!errors.telefono}>
        {errors.telefono}
      </HelperText>

      <TextInput
        label="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        error={!!errors.email}
        style={styles.input}
        textColor="#000000"
        mode="flat"
        theme={{ colors: { primary: primaryColor, text: '#000000', placeholder: primaryColor, onSurfaceVariant: primaryColor } }}
        underlineColor="#cccccc"
        activeUnderlineColor={primaryColor}
      />
      <HelperText type="error" visible={!!errors.email}>
        {errors.email}
      </HelperText>

      <Button 
        mode="contained" 
        onPress={handleSubmit} 
        style={[styles.button, { backgroundColor: primaryColor }]}
        textColor="#ffffff"
      >
        Generar Cotización
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
  input: {
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 20,
  },
  docTypeList: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  docTypeButton: {
    borderRadius: 0,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});

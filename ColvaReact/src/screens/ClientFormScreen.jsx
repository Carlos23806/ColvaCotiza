import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { db } from '../api/database';
import { generatePDF } from '../utils/pdfGenerator';
import { useNotification } from '../context/NotificationContext';
import { usePDF } from '../context/PDFContext';

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
  const { notify } = useNotification();
  const { addDownloadedPDF } = usePDF();
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (isSubmitting) return; // Prevenir múltiples envíos
    
    try {
      setIsSubmitting(true);
      const { errors, isValid } = validateForm();
      setErrors(errors);
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      // Crear la cotización y obtener el ID
      const cotizacionId = await db.createQuotation(user.id, formData, totals, selections);
      
      try {
        // Obtener los datos completos de la cotización
        const cotizacion = await db.getCotizacion(cotizacionId);
        const detalles = await db.getCotizacionDetalles(cotizacionId);
        
        const pdfResult = await generatePDF(cotizacion, detalles);
        
        if (pdfResult.success) {
          notify({
            message: '¡Cotización generada!',
            description: '¡La cotización se ha creado exitosamente!',
            type: 'success',
            duration: 2000,
          });
          
          // Programar la redirección después de que se cierre el PDF
          const redirectTimeout = setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }]
            });
          }, 2500); // Dar tiempo para que se muestre la notificación

          return () => clearTimeout(redirectTimeout);
        } else {
          throw new Error(pdfResult.message);
        }
      } catch (error) {
        notify({
          message: 'Cotización guardada',
          description: 'La cotización se guardó pero hubo un problema al generar el PDF. Puedes intentar abrirlo desde el historial.',
          type: 'warning',
          duration: 2000,
          onHide: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }]
            });
          }
        });
      }
    } catch (error) {
      notify({
        message: 'Error',
        description: error.message || 'Error al crear la cotización',
        type: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTipoDocumentoChange = (value) => {
    setFormData(prev => ({
      ...prev,
      tipo_documento: value
    }));
  };

  const primaryColor = '#0b3d93';

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          label="Tipo de Documento"
          value={TIPOS_DOCUMENTO.find(t => t.value === formData.tipo_documento)?.label || ''}
          placeholder="Seleccione tipo de documento"
          error={!!errors.tipo_documento}
          style={styles.input}
          mode="flat"
          editable={false}
          right={<TextInput.Icon icon="chevron-down" onPress={() => setShowDocTypes(!showDocTypes)} />}
          theme={{ 
            colors: { 
              primary: primaryColor,
              text: '#000000',
              placeholder: '#666666',
              background: 'transparent',
              onSurfaceVariant: primaryColor 
            } 
          }}
          underlineColor="#cccccc"
          activeUnderlineColor={primaryColor}
        />
        <HelperText type="error" visible={!!errors.tipo_documento}>
          {errors.tipo_documento}
        </HelperText>

        {showDocTypes && (
          <View style={styles.docTypeList}>
            {TIPOS_DOCUMENTO.map((tipo) => (
              <Button
                key={tipo.value}
                mode="text"
                onPress={() => {
                  handleTipoDocumentoChange(tipo.value);
                  setShowDocTypes(false);
                }}
                style={styles.docTypeButton}
                textColor={primaryColor}
              >
                {tipo.label}
              </Button>
            ))}
          </View>
        )}

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
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Generando...' : 'Generar Cotización'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  input: {
    marginBottom: 5,
    backgroundColor: 'transparent',
    height: 56, // Asegurar altura consistente
  },
  button: {
    marginTop: 20,
    marginBottom: 20,
  },
  docTypeList: {
    backgroundColor: '#fff',
    borderRadius: 4,
    elevation: 4,
    marginBottom: 16,
    zIndex: 1000,
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
  },
  docTypeButton: {
    borderRadius: 0,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    height: 48,
  },
});

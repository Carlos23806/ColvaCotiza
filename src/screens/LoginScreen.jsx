import React, { useState } from 'react';
import { View, Image, TextInput, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNotification } from '../context/NotificationContext';
import { validateId, validatePassword } from '../utils/validations';

export const LoginScreen = ({ navigation }) => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { notify } = useNotification();

  const handleLogin = async () => {
    try {
      const idError = validateId(idNumber);
      if (idError) {
        notify({ message: 'Error de validación', description: idError, type: 'warning' });
        return;
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        notify({ message: 'Error de validación', description: passwordError, type: 'warning' });
        return;
      }

      await login(idNumber, password);
      notify({ 
        message: '¡Bienvenido!', 
        description: 'Has iniciado sesión correctamente',
        type: 'success' 
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      notify({ 
        message: 'Error de inicio de sesión', 
        description: error.message, 
        type: 'danger',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo_colvatel.jpg')}
        style={styles.logo}
      />
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Número de Identificación</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="account" size={24} color="#0b3d93" />
          <TextInput
            style={styles.input}
            value={idNumber}
            onChangeText={setIdNumber}
            placeholder="Número de Identificación"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="lock" size={24} color="#0b3d93" />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="Contraseña"
          />
          <MaterialCommunityIcons
            name={showPassword ? "eye" : "eye-off"}
            size={24}
            color="#0b3d93"
            onPress={() => setShowPassword(!showPassword)}
          />
        </View>
      </View>

      <Button
        mode="contained"
        style={[styles.button, { backgroundColor: '#0b3d93' }]}
        labelStyle={{ color: '#ffffff' }}
        onPress={handleLogin}
      >
        Ingresar
      </Button>

      <Text 
        style={[styles.registerLink, { color: '#0b3d93' }]}
        onPress={() => navigation.navigate('Register')}
      >
        ¿No tienes una cuenta?, Registrate
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 50,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#000',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    marginLeft: 10,
  },
  button: {
    marginTop: 20,
    borderRadius: 8,
    elevation: 2,
  },
  registerLink: {
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
});
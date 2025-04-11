import React, { useState } from 'react';
import { View, Image, TextInput, StyleSheet, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export const RegisterScreen = ({ navigation }) => {
  const [idNumber, setIdNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    try {
      if (!idNumber || !username || !password || !confirmPassword) {
        Alert.alert('Error', 'Por favor complete todos los campos');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }

      // Validar que el ID sea numérico
      if (!/^\d+$/.test(idNumber)) {
        Alert.alert('Error', 'El número de identificación debe contener solo números');
        return;
      }

      // Validar longitud mínima de contraseña
      if (password.length < 6) {
        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
        return;
      }

      await register({
        id: idNumber,
        username: username.trim(),
        password,
        role: 'client',
      });

      Alert.alert(
        'Éxito', 
        'Usuario registrado correctamente',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }] // Asegurarse de que 'Login' está definido en AppNavigator
      );
    } catch (error) {
      console.error('Error en pantalla de registro:', error);
      Alert.alert('Error de registro', error.message || 'Error al crear el usuario');
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
        <Text style={styles.label}>Nombres</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="account-circle" size={24} color="#0b3d93" />
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Nombres"
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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirmar Contraseña</Text>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="lock" size={24} color="#0b3d93" />
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholder="Confirmar Contraseña"
          />
          <MaterialCommunityIcons
            name={showConfirmPassword ? "eye" : "eye-off"}
            size={24}
            color="#0b3d93"
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </View>
      </View>

      <Button
        mode="contained"
        style={styles.button}
        onPress={handleRegister}
        textColor='#ffffff'
      >
        Registrarse
      </Button>

      <Text 
        style={styles.loginLink}
        onPress={() => navigation.navigate('Login')}
      >
        ¿Ya tienes una cuenta? Inicia sesión
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#0b3d93',
    marginTop: 20,
  },
  loginLink: {
    color: '#0b3d93',
    textAlign: 'center',
    marginTop: 20,
  },
});

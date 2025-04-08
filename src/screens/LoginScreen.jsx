import React, { useState } from 'react';
import { View, Image, TextInput, StyleSheet, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export const LoginScreen = ({ navigation }) => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const userData = await login(idNumber, password);
      if (userData) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }], // Asegurarse de que 'Main' está definido en AppNavigator
        });
      }
    } catch (error) {
      const errorMessage = error?.message || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      Alert.alert('Error de inicio de sesión', errorMessage);
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
          <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
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
          <MaterialCommunityIcons name="lock" size={24} color={colors.primary} />
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
            color={colors.primary}
            onPress={() => setShowPassword(!showPassword)}
          />
        </View>
      </View>

      <Button
        mode="contained"
        style={[styles.button, { backgroundColor: colors.primary }]}
        labelStyle={{ color: colors.background }}
        onPress={handleLogin}
      >
        Ingresar
      </Button>

      <Text 
        style={[styles.registerLink, { color: colors.primary }]}
        onPress={() => navigation.navigate('Register')}
      >
        ¿No tienes una cuenta?, crear una
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    borderColor: colors.gray,
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
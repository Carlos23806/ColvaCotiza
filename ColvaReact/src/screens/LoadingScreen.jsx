import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export const LoadingScreen = ({ navigation }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        navigation.replace(user ? 'Main' : 'Login');
      }
    }, 2000); // 2 segundos de tiempo de carga

    return () => clearTimeout(timer);
  }, [loading, user, navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo_colvatel.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appName}>COLVA APP</Text>
      <ActivityIndicator 
        size="large" 
        color="#0b3d93" 
        style={styles.spinner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 50,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0b3d93',
  },
  spinner: {
    marginTop: 20
  }
});
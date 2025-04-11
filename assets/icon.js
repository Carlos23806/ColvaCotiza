// assets/icon.js
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createIconSetFromIcoMoon } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';

export default function GenerateIcon() {
  const viewRef = React.useRef();

  React.useEffect(() => {
    const generateIcon = async () => {
      try {
        const uri = await captureRef(viewRef, {
          width: 1024,
          height: 1024,
          quality: 1,
          format: 'png',
        });
        
        console.log('Icon generated:', uri);
        // You can save this URI or use it directly in your app.json
      } catch (error) {
        console.error('Failed to generate icon:', error);
      }
    };

    generateIcon();
  }, []);

  return (
    <View ref={viewRef} style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>C</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 1024, 
    height: 1024,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 900,
    height: 900,
    backgroundColor: '#3498db',
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 500,
    fontWeight: 'bold',
    color: 'white',
  },
});
// app.config.js
export default {
  name: 'ColvaApp',
  slug: 'colvaapp-nuevo-unique', // Actualizado para coincidir con el slug en EAS
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/logo_colvatel.jpg', // Create this simple icon file
  splash: {
    image: './assets/images/logo_colvatel.jpg', // Create this simple splash file
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.colva.colvaapp'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/logo_colvatel.jpg', // Create this simple adaptive icon
      backgroundColor: '#FFFFFF'
    },
    package: 'com.colva.colvaapp'
  },
  web: {
    favicon: './assets/images/logo_colvatel.jpg' // Create this simple favicon
  },
  extra: {
    eas: {
      projectId: "8246f9ae-1348-4577-9636-fc4d11fc6235" // Get this from the Expo dashboard
    }
  }
};
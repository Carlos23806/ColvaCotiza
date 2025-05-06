import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

class DownloadManager {
  static async requestPermissions() {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.error('Error solicitando permisos:', err);
      return false;
    }
  }

  static async saveFile(fileUri, filename, mimeType = 'application/pdf') {
    try {
      const granted = await this.requestPermissions();
      if (!granted) {
        throw new Error('PERMISSION_DENIED');
      }

      // Crear directorio temporal si no existe
      const tempDir = `${FileSystem.cacheDirectory}temp/`;
      await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
      
      // Copiar archivo a directorio temporal
      const tempPath = `${tempDir}${filename}`;
      await FileSystem.copyAsync({
        from: fileUri,
        to: tempPath
      });

      // Guardar en la galería
      const asset = await MediaLibrary.createAssetAsync(tempPath);
      
      // Mover a carpeta de descargas
      const album = await MediaLibrary.getAlbumAsync('Downloads');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('Downloads', asset, false);
      }

      // Limpiar archivo temporal
      await FileSystem.deleteAsync(tempPath, { idempotent: true });

      return {
        success: true,
        filePath: asset.uri,
        message: 'Archivo guardado en Descargas'
      };
    } catch (error) {
      console.error('Error saving file:', error);
      return {
        success: false,
        error: error.message === 'PERMISSION_DENIED' ? 'PERMISSION_DENIED' : 'SAVE_ERROR',
        message: error.message || 'Error al guardar el archivo'
      };
    }
  }

  static async openFile(filePath) {
    try {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Abrir PDF'
      });
      return true;
    } catch (error) {
      console.error('Error opening file:', error);
      throw error;
    }
  }
}

export default DownloadManager;

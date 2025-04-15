import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform, Image } from 'react-native';
import { Asset } from 'expo-asset';
import { pdfStyles } from '../constants/pdfStyles';

const getTemporaryPath = (filename) => {
  return `${FileSystem.cacheDirectory}${filename}`;
};

const getLogoBase64 = async () => {
  try {
    // Cargar el asset
    const asset = Asset.fromModule(require('../../assets/images/logo_colvatel.jpg'));
    await asset.downloadAsync();
    
    // Leer el archivo como base64
    const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return base64;
  } catch (error) {
    console.error('Error cargando logo:', error);
    return null;
  }
};

export const generatePDF = async (cotizacion, detalles) => {
  try {
    // Obtener el logo en base64
    const logoBase64 = await getLogoBase64();
    const logoHtml = logoBase64 
      ? `<img src="data:image/jpeg;base64,${logoBase64}" class="logo" alt="Logo Colvatel" />`
      : ''; // Si falla la carga del logo, no mostrarlo

    const html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${pdfStyles.css}</style>
        </head>
        <body>
          <div class="header">
            ${logoHtml}
            <h1 class="title">Cotización #${cotizacion.id || 'Nueva'}</h1>
          </div>

          <div class="info-section">
            <p><strong>Fecha:</strong> ${new Date(cotizacion.fecha).toLocaleDateString()}</p>
            <p><strong>Cliente:</strong> ${cotizacion.cliente_nombres || ''} ${cotizacion.cliente_apellidos || ''}</p>
            <p><strong>Documento:</strong> ${cotizacion.cliente_tipo_doc || ''} ${cotizacion.cliente_num_doc || ''}</p>
            <p><strong>Teléfono:</strong> ${cotizacion.cliente_telefono || ''}</p>
            <p><strong>Email:</strong> ${cotizacion.cliente_email || 'No especificado'}</p>
          </div>

          ${generateDetallesHTML(detalles)}

          <div class="totals">
            <p><strong>Subtotal:</strong> $${(cotizacion.subtotal || 0).toFixed(2)}</p>
            <p><strong>IVA (19%):</strong> $${(cotizacion.iva || 0).toFixed(2)}</p>
            <p class="total-amount">Total: $${(cotizacion.total || 0).toFixed(2)}</p>
          </div>
        </body>
      </html>
    `;

    // Generar el PDF en caché
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false
    });

    // Preparar el nombre del archivo
    const fileName = `cotizacion_${cotizacion.id}_${Date.now()}.pdf`;
    const newFileUri = `${FileSystem.documentDirectory}${fileName}`;

    // Copiar a un directorio más permanente
    await FileSystem.copyAsync({
      from: uri,
      to: newFileUri
    });

    // Limpiar el archivo temporal
    await FileSystem.deleteAsync(uri, { idempotent: true });

    if (Platform.OS === 'android') {
      // En Android, abrir con la app de Files por defecto
      const contentUri = await FileSystem.getContentUriAsync(newFileUri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: 'application/pdf',
      });
    } else {
      // En iOS usar el Share normal
      await Sharing.shareAsync(newFileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Ver PDF de cotización'
      });
    }

    return {
      success: true,
      filePath: newFileUri,
      message: 'PDF generado correctamente'
    };

  } catch (error) {
    console.error('Error generando PDF:', error);
    return {
      success: false,
      message: error.message || 'Error al generar el PDF'
    };
  }
};

export const downloadPDF = async (uri, filename) => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Se requieren permisos para guardar el archivo');
    }

    const asset = await MediaLibrary.createAssetAsync(uri);
    
    // En Android, mover a la carpeta Download
    if (Platform.OS === 'android') {
      const album = await MediaLibrary.getAlbumAsync('Download');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('Download', asset, false);
      }
    }

    return {
      success: true,
      uri: asset.uri,
      message: 'PDF guardado en Descargas'
    };
  } catch (error) {
    console.error('Error guardando PDF:', error);
    return {
      success: false,
      message: error.message || 'Error al guardar el PDF'
    };
  }
};

export const sharePDF = async (uri) => {
  try {
    if (Platform.OS === 'android') {
      const contentUri = await FileSystem.getContentUriAsync(uri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1,
        type: 'application/pdf',
      });
    } else {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Ver PDF de cotización'
      });
    }
    return true;
  } catch (error) {
    console.error('Error compartiendo PDF:', error);
    throw error;
  }
};

// Función helper para generar y compartir directamente
export const generateAndSharePDF = async (cotizacion, detalles) => {
  try {
    const result = await generatePDF(cotizacion, detalles);
    
    if (!result.success) {
      throw new Error(result.message);
    }

    await sharePDF(result.filePath);
    
    return {
      success: true,
      uri: result.filePath,
      message: 'PDF compartido exitosamente'
    };
  } catch (error) {
    console.error('Error en generación y compartido:', error);
    return {
      success: false,
      message: error.message || 'Error al procesar el PDF'
    };
  }
};

const generateDetallesHTML = (detalles) => {
  // Agrupar por ambiente
  const ambientes = detalles.reduce((acc, det) => {
    if (!acc[det.ambiente]) acc[det.ambiente] = [];
    acc[det.ambiente].push(det);
    return acc;
  }, {});

  return Object.entries(ambientes).map(([ambiente, productos]) => `
    <div>
      <h3>Ambiente ${ambiente}</h3>
      <table>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio Unitario</th>
          <th>Total</th>
        </tr>
        ${productos.map(p => `
          <tr>
            <td>${p.productos?.nombre || 'N/A'}</td>
            <td>${p.cantidad}</td>
            <td>$${p.precio_unitario.toFixed(2)}</td>
            <td>$${(p.cantidad * p.precio_unitario).toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `).join('');
};

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const generatePDF = async (cotizacion, detalles) => {
  try {
    const html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 1.2em; }
            .header { margin-bottom: 30px; }
            .cliente { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Cotización #${cotizacion.numero_cliente}</h1>
            <p>Fecha: ${new Date(cotizacion.fecha).toLocaleDateString()}</p>
          </div>
          
          <div class="cliente">
            <h2>Datos del Cliente</h2>
            <p><strong>Nombre:</strong> ${cotizacion.cliente_nombres} ${cotizacion.cliente_apellidos}</p>
            <p><strong>Documento:</strong> ${cotizacion.cliente_tipo_doc} ${cotizacion.cliente_num_doc}</p>
            <p><strong>Teléfono:</strong> ${cotizacion.cliente_telefono}</p>
            <p><strong>Email:</strong> ${cotizacion.cliente_email}</p>
          </div>

          ${generateDetallesHTML(detalles)}

          <div class="totales">
            <p>Subtotal: $${cotizacion.subtotal.toFixed(2)}</p>
            <p>IVA (19%): $${cotizacion.iva.toFixed(2)}</p>
            <p class="total">Total: $${cotizacion.total.toFixed(2)}</p>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({
      html,
      width: 612,
      height: 792,
    });

    if (Platform.OS === 'android') {
      // Usar el directorio de documentos de la aplicación
      const fileName = `cotizacion_${cotizacion.id}_${Date.now()}.pdf`;
      const pdfDir = `${FileSystem.documentDirectory}pdfs/`;
      const pdfPath = `${pdfDir}${fileName}`;

      // Crear directorio si no existe
      const dirInfo = await FileSystem.getInfoAsync(pdfDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(pdfDir, { intermediates: true });
      }

      // Copiar el archivo al directorio de PDFs
      await FileSystem.copyAsync({
        from: uri,
        to: pdfPath
      });

      // Limpiar el archivo temporal
      await FileSystem.deleteAsync(uri, { idempotent: true });

      // Compartir el archivo inmediatamente
      await Sharing.shareAsync(pdfPath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Ver PDF de cotización',
        UTI: 'com.adobe.pdf'
      });

      return {
        success: true,
        message: 'PDF generado correctamente',
        filePath: pdfPath
      };
    } else {
      // Para iOS
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf'
      });
      return {
        success: true,
        message: 'PDF generado correctamente',
        filePath: uri
      };
    }
  } catch (error) {
    console.error('Error en generatePDF:', error);
    return {
      success: false,
      message: 'Error al generar el PDF: ' + error.message
    };
  }
};

export const openPDF = async (filePath) => {
  try {
    await Sharing.shareAsync(filePath, {
      mimeType: 'application/pdf',
      dialogTitle: 'Ver PDF de cotización',
      UTI: 'com.adobe.pdf'
    });
    return true;
  } catch (error) {
    console.error('Error opening PDF:', error);
    return false;
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

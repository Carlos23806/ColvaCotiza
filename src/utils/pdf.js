import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const pdfGenerator = {
  generateCotizacionPDF: async (cotizacion, detalles, userData) => {
    try {
      const fecha = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });
      
      // Generar tabla de productos
      const productosHTML = detalles.map(item => `
        <tr>
          <td>${item.ambiente}</td>
          <td>${item.nombre_producto}</td>
          <td>${item.cantidad}</td>
          <td>$${item.precio_unitario.toLocaleString('es-CO')}</td>
          <td>$${(item.cantidad * item.precio_unitario).toLocaleString('es-CO')}</td>
        </tr>
      `).join('');

      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              .header { text-align: center; margin-bottom: 30px; }
              .cotizacion-info { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .totales { margin-top: 20px; text-align: right; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>COLVA APP</h1>
              <h2>Cotización #${cotizacion.id}</h2>
              <p>${fecha}</p>
            </div>

            <div class="cotizacion-info">
              <h3>Datos del Cliente</h3>
              <p>Nombre: ${cotizacion.cliente_nombres} ${cotizacion.cliente_apellidos}</p>
              <p>Documento: ${cotizacion.cliente_tipo_doc} ${cotizacion.cliente_num_doc}</p>
              <p>Teléfono: ${cotizacion.cliente_telefono}</p>
              <p>Email: ${cotizacion.cliente_email}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Ambiente</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${productosHTML}
              </tbody>
            </table>

            <div class="totales">
              <p>Subtotal: $${cotizacion.subtotal.toLocaleString('es-CO')}</p>
              <p>IVA (19%): $${cotizacion.iva.toLocaleString('es-CO')}</p>
              <h3>Total: $${cotizacion.total.toLocaleString('es-CO')}</h3>
            </div>

            <div class="footer">
              <p>Cotización generada por: ${userData.username}</p>
            </div>
          </body>
        </html>
      `;

      const options = {
        html,
        fileName: `Cotizacion_${cotizacion.id}`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      return file.filePath;
    } catch (error) {
      throw new Error('Error al generar el PDF: ' + error.message);
    }
  }
};
import { db } from '../api/database';

export const quotationService = {
  calculateAmounts(items) {
    const subtotal = items.reduce((sum, item) => 
      sum + (item.cantidad * item.precio_unitario), 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;

    return {
      subtotal,
      iva,
      total,
    };
  },

  validateStock(producto, cantidad) {
    if (producto.unidades < cantidad) {
      throw new Error(`Stock insuficiente para ${producto.nombre}`);
    }
    return true;
  },

  async createQuotation(userId, clientData, items) {
    try {
      const amounts = this.calculateAmounts(items);
      
      // Organizar items por ambiente
      const details = items.reduce((acc, item) => {
        if (!acc[item.ambiente]) {
          acc[item.ambiente] = {};
        }
        acc[item.ambiente][item.producto_id] = {
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
        };
        return acc;
      }, {});

      return await db.createQuotation(userId, clientData, amounts, details);
    } catch (error) {
      throw new Error(`Error al crear cotización: ${error.message}`);
    }
  },
};

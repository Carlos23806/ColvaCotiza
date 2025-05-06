import { supabase } from '../api/database';

export const productService = {
  async getAllProducts() {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre');

    if (error) {
      throw new Error('Error al obtener productos');
    }
    return data;
  },

  async addProduct(nombre, unidades, costo) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert({
          nombre: nombre.trim(),
          unidades: parseInt(unidades, 10),
          costo: parseFloat(costo),
        })
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Ya existe un producto con ese nombre');
        }
        throw error;
      }

      return data?.id;
    } catch (error) {
      throw error;
    }
  },

  async updateProductUnits(nombre, nuevasUnidades) {
    const { data, error } = await supabase
      .from('productos')
      .update({
        unidades: Math.max(0, parseInt(nuevasUnidades, 10)),
        updated_at: new Date().toISOString(),
      })
      .eq('nombre', nombre)
      .select('unidades')
      .single();

    if (error) {
      throw new Error('Error al actualizar unidades');
    }
    return data?.unidades;
  },

  async checkStock(nombre, cantidad) {
    const { data, error } = await supabase
      .from('productos')
      .select('unidades')
      .eq('nombre', nombre)
      .single();

    if (error) {
      throw new Error('Error al verificar stock');
    }
    return data && data.unidades >= parseInt(cantidad, 10);
  },
};

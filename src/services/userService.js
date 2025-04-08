import { supabase } from '../api/database';

export const userService = {
  async validateUser(idNumber, password) {
    const { data, error } = await supabase
      .from('usuarios') // Cambiado de 'users' a 'usuarios'
      .select('*')
      .eq('id', idNumber)
      .single();

    if (error) {
      throw new Error('Error de autenticación');
    }
    return data && data.password === password ? data : null;
  },

  async addUser(idNumber, username, password, role = 'client') {
    const { data, error } = await supabase
      .from('usuarios') // Cambiado de 'users' a 'usuarios'
      .insert({
        id: idNumber,
        username,
        password,
        role,
      })
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe un usuario con este número de identificación');
      }
      throw error;
    }

    return data;
  },

  async getUserRole(idNumber) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('role')
      .eq('id', idNumber)
      .single();

    if (error) {
      throw new Error('Error al obtener rol de usuario');
    }
    return data?.role;
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('usuarios') // Cambiado de 'users' a 'usuarios'
      .select('*');

    if (error) {
      throw new Error('Error al obtener usuarios');
    }
    return data.map(user => [user.id, user]);
  },

  async deleteUser(idNumber) {
    if (idNumber === 'admin') {
      return false;
    }

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', idNumber);

    if (error) {
      throw new Error('Error al eliminar usuario');
    }
    return true;
  },

  async updateUser(idNumber, { username, password, role }) {
    const updates = {};
    if (username) {
      updates.username = username;
    }
    if (password) {
      updates.password = password;
    }
    if (role && idNumber !== 'admin') {
      updates.role = role;
    }

    if (Object.keys(updates).length === 0) {
      return true;
    }

    const { error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', idNumber);

    if (error) {
      throw new Error('Error al actualizar usuario');
    }
    return true;
  },

  async getUserData(idNumber) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', idNumber)
      .single();

    if (error) {
      throw new Error('Error al obtener datos de usuario');
    }
    return data;
  },
};

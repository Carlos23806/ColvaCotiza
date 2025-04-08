import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../api/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (numeroIdentificacion, password) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', numeroIdentificacion)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Usuario no encontrado');
      }

      if (data.state === 'inactivo') {
        throw new Error('Usuario inactivo. Por favor contacte al administrador.');
      }

      if (data.password !== password) {
        throw new Error('Contraseña incorrecta');
      }

      setUser(data);
      return data;

    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ id, username, password, role }) => {
    try {
      // Primero verificamos si el usuario ya existe
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios') // Cambiado de 'users' a 'usuarios'
        .select('id')
        .eq('id', id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing user:', checkError);
        throw new Error('Error al verificar usuario');
      }

      if (existingUser) {
        throw new Error('Este número de identificación ya está registrado');
      }

      // Si no existe, creamos el nuevo usuario
      const { data, error } = await supabase
        .from('usuarios') // Cambiado de 'users' a 'usuarios'
        .insert([
          { 
            id: parseInt(id), // Aseguramos que el ID sea numérico
            username: username.trim(), 
            password, 
            role: role || 'client' 
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        if (error.code === '23505') {
          throw new Error('Este usuario ya existe');
        }
        throw new Error('Error al crear el usuario: ' + error.message);
      }

      return data;
    } catch (error) {
      console.error('Complete registration error:', error);
      throw error; // Propagamos el error con el mensaje detallado
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error('Error al cerrar sesión. Por favor intente nuevamente');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../api/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (numeroIdentificacion, password) => {
    try {
      setLoading(true);
      
      if (!numeroIdentificacion || !password) {
        throw new Error('Por favor ingresa todos los campos');
      }

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', numeroIdentificacion)
        .eq('password', password)
        .single();

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error('Error al verificar credenciales');
      }

      if (!data) {
        throw new Error('Usuario no encontrado');
      }

      setUser(data);
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw new Error('Credenciales incorrectas, por favor verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ id, username, password, role }) => {
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
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

      const { data, error } = await supabase
        .from('usuarios')
        .insert([
          { 
            id: parseInt(id),
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
      throw error;
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
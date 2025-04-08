import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../api/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Login
  const login = async (id, password) => {
    try {
      const { data: userInDB, error: dbError } = await supabase
        .from('usuarios')
        .select()
        .eq('id', id)
        .eq('password', password)
        .single();

      if (dbError) throw new Error('Error al buscar usuario');
      if (!userInDB) throw new Error('Usuario no encontrado');

      setUser(userInDB);
      return userInDB;

    } catch (error) {
      console.error('Error en login:', error);
      throw new Error('Error al iniciar sesión');
    }
  };

  // Registro
  const register = async ({ id, username, password }) => {
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error('Error al verificar usuario existente');
      }

      if (existingUser) {
        throw new Error('Este ID ya está registrado');
      }

      const { data, error } = await supabase
        .from('usuarios')
        .insert([
          {
            id: parseInt(id),
            username: username.trim(),
            password,
            role: 'client'
          }
        ])
        .select()
        .single();

      if (error) {
        throw new Error('Error al crear el usuario');
      }

      return data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

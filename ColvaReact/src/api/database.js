import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://rxiydekhbydlnudomfsp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4aXlkZWtoYnlkbG51ZG9tZnNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMDQwODEsImV4cCI6MjA1ODY4MDA4MX0.RlY0mQAOT431YezSh06CtpJ66isrfr2lDb42AqEpePs';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const db = {
  async initializeDatabase() {
    try {
      console.log('Inicializando base de datos...');
      const { data: users, error: userError } = await supabase
        .from('usuarios')
        .select('*');
      
      if (userError) {
        console.error('Error al verificar usuarios:', userError);
        throw userError;
      }

      if (!users?.length) {
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert({
            id: 1072649746,
            username: 'admin',
            password: 'admin123',
            role: 'admin',
          });

        if (insertError) {
          console.error('Error al crear usuario admin:', insertError);
          throw insertError;
        }
      }

      // Verificar productos solo si la tabla usuarios está bien
      const { data: products, error: productError } = await supabase
        .from('productos')
        .select('*');

      if (productError) {
        console.error('Error al verificar productos:', productError);
        throw productError;
      }

      if (!products?.length) {
        const { error: insertError } = await supabase
          .from('productos')
          .insert([
            {
              nombre: 'Google Assistant Nest',
              unidades: 140,
              costo: 223076.00,
            },
            {
              nombre: 'Foco LED RGB Controlado',
              unidades: 30,
              costo: 61876.00,
            },
            {
              nombre: 'Control Remoto Universal',
              unidades: 25,
              costo: 91636.00,
            },
          ]);

        if (insertError) {
          console.error('Error al crear productos:', insertError);
          throw insertError;
        }
      }
      
      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error en inicialización:', error);
      throw error;
    }
  },

  async getStoredUser() {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  },

  async login(idNumber, password) {
    try {
      if (!idNumber || !password) {
        throw new Error('Por favor ingresa todos los campos requeridos');
      }

      const userData = await validateUser(parseInt(idNumber), password);

      if (!userData) {
        throw new Error('Usuario no encontrado o contraseña incorrecta');
      }

      if (userData) {
        // Guardar usuario en AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }

      return userData;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error in logout:', error);
    }
  },

  async getProducts() {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre');

    if (error) {
      throw new Error('Error al obtener productos');
    }
    return data;
  },

  async addProduct(productData) {
    const { data, error } = await supabase
      .from('productos')
      .insert(productData);

    if (error) throw error;
    return data;
  },

  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from('productos')
      .update(productData)
      .eq('id', id);

    if (error) throw error;
    return data;
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async register(userData) {
    try {
      // Validaciones
      if (!userData.id || !userData.username || !userData.password) {
        throw new Error('Todos los campos son obligatorios');
      }

      // Verificar si el usuario ya existe
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .or(`id.eq.${userData.id},username.eq.${userData.username}`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error al verificar usuario existente:', checkError);
        throw new Error('Error al verificar disponibilidad');
      }

      if (existingUser) {
        throw new Error('El número de identificación o nombre de usuario ya está registrado');
      }

      // Insertar nuevo usuario con el rol correcto
      const newUser = await createUser({
        id: parseInt(userData.id),
        username: userData.username,
        password: userData.password,
        role: 'client',
      });

      return newUser;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  async createQuotation(userId, clientData, amounts, details) {
    // Validaciones
    if (!clientData.tipo_documento || !clientData.numero_documento || 
        !clientData.nombres || !clientData.apellidos) {
      throw new Error('Los datos del cliente están incompletos');
    }

    const { data: quotation, error: quotationError } = await supabase
      .from('cotizaciones')
      .insert({
        usuario_id: userId,
        cliente_tipo_doc: clientData.tipo_documento,
        cliente_num_doc: clientData.numero_documento,
        cliente_nombres: clientData.nombres,
        cliente_apellidos: clientData.apellidos,
        cliente_telefono: clientData.telefono,
        cliente_email: clientData.email,
        subtotal: amounts.subtotal,
        iva: amounts.iva,
        total: amounts.total,
      })
      .select()
      .single();

    if (quotationError) throw new Error('Error al crear cotización');

    const quotationDetails = Object.entries(details).flatMap(([ambiente, productos]) =>
      Object.entries(productos).map(([productoId, detalle]) => ({
        cotizacion_id: quotation.id,
        ambiente: ambiente,
        producto_id: parseInt(productoId),
        cantidad: detalle.quantity,
        precio_unitario: detalle.price,
      }))
    );

    const { error: detailsError } = await supabase
      .from('cotizacion_detalles')
      .insert(quotationDetails);

    if (detailsError) throw new Error('Error al crear detalles de cotización');

    return quotation.id;
  },

  async getCotizaciones(userId) {
    // Primero obtenemos todas las cotizaciones del usuario ordenadas por fecha
    const { data: cotizaciones, error } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('usuario_id', userId)
      .order('fecha', { ascending: false });

    if (error) throw new Error('Error al obtener cotizaciones');

    // Ahora procesamos los datos para agregar el número de cotización del cliente
    const cotizacionesConContador = await Promise.all(
      cotizaciones.map(async (cotizacion) => {
        // Contamos cuántas cotizaciones anteriores tiene este usuario
        const { count, error: countError } = await supabase
          .from('cotizaciones')
          .select('*', { count: 'exact' })
          .eq('usuario_id', userId)
          .lte('fecha', cotizacion.fecha); // Menor o igual a la fecha de esta cotización

        if (countError) throw new Error('Error al contar cotizaciones');

        return {
          ...cotizacion,
          numero_cliente: count // Este será el número de la cotización para el cliente
        };
      })
    );

    return cotizacionesConContador;
  },

  async getCotizacionDetalles(cotizacionId) {
    try {
      // Primero obtenemos los detalles básicos
      const { data: detalles, error } = await supabase
        .from('cotizacion_detalles')
        .select('*')
        .eq('cotizacion_id', cotizacionId);

      if (error) {
        console.error('Error al obtener detalles:', error);
        throw new Error('Error al obtener detalles de la cotización');
      }

      // Luego obtenemos los productos relacionados
      const productIds = detalles.map(d => d.producto_id);
      const { data: productos, error: productError } = await supabase
        .from('productos')
        .select('*')
        .in('id', productIds);

      if (productError) {
        console.error('Error al obtener productos:', productError);
        throw new Error('Error al obtener información de productos');
      }

      // Combinamos la información
      const detallesCompletos = detalles.map(detalle => ({
        ...detalle,
        productos: productos.find(p => p.id === detalle.producto_id)
      }));

      return detallesCompletos;

    } catch (error) {
      console.error('Error en getCotizacionDetalles:', error);
      throw error;
    }
  },

  async getCotizacion(cotizacionId) {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('id', cotizacionId)
      .single();

    if (error) throw new Error('Error al obtener la cotización');
    return data;
  },
};

export const validateUser = async (id, password) => {
  try {
    const { data, error } = await supabase
      .from('usuarios') // Cambiado de 'users' a 'usuarios'
      .select('*')
      .eq('id', id)
      .eq('password', password)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error validating user:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('usuarios') // Cambiado de 'users' a 'usuarios'
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const validateId = (id) => {
  if (!id) return 'El número de identificación es requerido';
  if (!/^\d+$/.test(id)) return 'El número de identificación solo debe contener números';
  if (id.length < 5) return 'El número de identificación debe tener al menos 5 dígitos';
  return null;
};

export const validateUsername = (username) => {
  if (!username) return 'El nombre es requerido';
  if (username.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return null;
};

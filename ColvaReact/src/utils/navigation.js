export const checkUserAccess = (user, route) => {
  if (!user) return false;

  const adminRoutes = ['ProductManagement', 'UserManagement'];
  if (adminRoutes.includes(route) && user.role !== 'admin') {
    return false;
  }

  return true;
};

export const getInitialRoute = (user) => {
  if (!user) return 'Login';
  return 'Main';
};
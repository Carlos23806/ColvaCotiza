// Using React Native compatible crypto approach
const generateSalt = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let salt = '';
  for (let i = 0; i < length; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
};

const sha256 = async (message) => {
  // Convert string to UTF-8 encoded array
  const msgBuffer = new TextEncoder().encode(message);
  // Hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  // Convert to hex string
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const hashPassword = async (password) => {
  const salt = generateSalt();
  const hash = await sha256(password + salt);
  return `${hash}.${salt}`;
};

export const verifyPassword = async (password, hashedPassword) => {
  const [hash, salt] = hashedPassword.split('.');
  const computedHash = await sha256(password + salt);
  return hash === computedHash;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Au moins 6 caractères
  return password && password.length >= 6;
};

const validateRequired = (fields, data) => {
  const errors = [];
  
  fields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${field} est requis`);
    }
  });
  
  return errors;
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim();
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRequired,
  sanitizeString
};

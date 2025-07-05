require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || '#Mon#Mot#Secret#De##JWT#',
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bibliotheque',
    port: parseInt(process.env.DB_PORT) || 3306
  },
  server: {
    port: process.env.PORT || 4001
  },
  environment: process.env.NODE_ENV || 'development'
};

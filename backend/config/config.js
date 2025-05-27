require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'lated',
    password: process.env.DB_PASSWORD ||'latedservices',
    database: process.env.DB_NAME ||'lated_services',
    host: process.env.DB_HOST ||'10.4.27.11',
    dialect: 'postgres',
  },
  test: {
    username: process.env.DB_USER ||'lated',
    password: process.env.DB_PASSWORD ||'latedservices',
    database: process.env.DB_NAME ||'lated_services',
    host: process.env.DB_HOST ||'10.4.27.11',
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USER ||'lated',
    password: process.env.DB_PASSWORD ||'latedservices',
    database: process.env.DB_NAME ||'lated_services',
    host: process.env.DB_HOST ||'10.4.27.11',
    dialect: 'postgres',
  },
};

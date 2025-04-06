const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize({
    dialect: 'mariadb',
    host: process.env.HOST_DB,
    username: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DATABASE_NAME,
    logging: console.log
  });
  
  module.exports = sequelize;
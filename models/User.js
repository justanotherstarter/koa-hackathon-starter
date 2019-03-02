const Sequelize = require('sequelize')
const db = require('../lib/db')

module.exports = db.define('user', {
  fullName: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING
})

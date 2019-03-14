const Sequelize = require('sequelize')
const db = require('../lib/db')

module.exports = db.define('blacklistedtoken', {
  token: {
    type: Sequelize.TEXT,
    required: true,
    unique: true
  }
})

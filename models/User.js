const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const db = require('../lib/db')

const User = db.define('user', {
  username: { type: Sequelize.STRING, required: true, unique: true },
  email: { type: Sequelize.STRING, required: true, unique: true },
  password: { type: Sequelize.STRING, required: true }
})

User.beforeSave(user => {
  return bcrypt
    .hash(user.dataValues.password, 16)
    .then(password => (user.password = password))
    .catch(e => {
      throw e
    })
})

User.beforeUpdate(user => {
  return bcrypt
    .hash(user.dataValues.password, 16)
    .then(password => (user.password = password))
    .catch(e => {
      throw e
    })
})

module.exports = User

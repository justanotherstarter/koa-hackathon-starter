const Sequelize = require('sequelize')
const PasswordResetAttempt = require('../models/PasswordResetAttempt')
const bcrypt = require('bcrypt')
const db = require('../lib/db')

const User = db.define('user', {
  username: { type: Sequelize.STRING, required: true, unique: true },
  email: { type: Sequelize.STRING, required: true, unique: true },
  password: { type: Sequelize.STRING, required: true },
  emailVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
  emailVerificationToken: { type: Sequelize.STRING, required: true }
})

User.hasMany(PasswordResetAttempt)

User.beforeSave(user => {
  return bcrypt
    .hash(user.dataValues.password, 16)
    .then(password => {
      user.dataValues.password = password
      return bcrypt.hash(user.dataValues.emailVerificationToken, 16)
    })
    .then(emailVerificationToken => {
      user.dataValues.emailVerificationToken = emailVerificationToken
    })
    .catch(e => {
      throw e
    })
})

User.beforeUpdate(user => {
  return user.dataValues.password !== user._previousDataValues.password
    ? bcrypt
        .hash(user.dataValues.password, 16)
        .then(password => (user.dataValues.password = password))
        .catch(e => {
          throw e
        })
    : null
})

module.exports = User

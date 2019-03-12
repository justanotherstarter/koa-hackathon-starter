const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const db = require('../lib/db')

const PasswordResetAttempt = db.define('passwordreset', {
  used: { type: Sequelize.BOOLEAN, defaultValue: false },
  token: { type: Sequelize.STRING, required: true }
})

PasswordResetAttempt.beforeSave(attempt => {
  return attempt.dataValues.used
    ? null
    : bcrypt
        .hash(attempt.dataValues.token, 16)
        .then(token => (attempt.dataValues.token = token))
        .catch(e => {
          throw e
        })
})

module.exports = PasswordResetAttempt

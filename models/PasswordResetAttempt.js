const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const db = require('../lib/db')

const PasswordResetAttempt = db.define('passwordreset', {
  used: { type: Sequelize.BOOLEAN, defaultValue: false },
  token: { type: Sequelize.STRING, required: true }
})

PasswordResetAttempt.beforeSave(async attempt => {
  try {
    return attempt.used ? null : await bcrypt.hash(attempt.token, 16)
  } catch (err) {
    throw err
  }
})

module.exports = PasswordResetAttempt

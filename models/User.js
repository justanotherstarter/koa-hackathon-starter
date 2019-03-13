const Sequelize = require('sequelize')
const PasswordResetAttempt = require('./PasswordResetAttempt')
const db = require('../lib/db')

const User = db.define('user', {
  username: { type: Sequelize.STRING, required: true, unique: true },
  email: { type: Sequelize.STRING, required: true, unique: true },
  password: { type: Sequelize.STRING, required: true },
  emailVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
  emailVerificationToken: { type: Sequelize.STRING, required: true }
})

User.hasMany(PasswordResetAttempt)

module.exports = User

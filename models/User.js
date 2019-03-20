const Sequelize = require('sequelize')
const PasswordResetAttempt = require('./PasswordResetAttempt')
const bcrypt = require('bcrypt')
const db = require('../lib/db')

const User = db.define('user', {
  username: { type: Sequelize.STRING, required: true, unique: true },
  email: { type: Sequelize.STRING, required: true, unique: true },
  password: { type: Sequelize.STRING, required: true },
  emailVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
  emailVerificationToken: { type: Sequelize.STRING, required: true }
})

User.beforeSave(async user => {
  // Hash password if changed
  user.password = user._changed.password
    ? await bcrypt.hash(user.password, 14)
    : user.password
  user.emailVerificationToken =
    user._changed.emailVerificationToken && user.emailVerificationToken !== null
      ? await bcrypt.hash(user.emailVerificationToken, 14)
      : null
})

User.hasMany(PasswordResetAttempt)

module.exports = User

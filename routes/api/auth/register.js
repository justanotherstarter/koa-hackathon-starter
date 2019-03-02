const User = require('../../../models/User')
const bcrypt = require('bcrypt')
const Joi = require('joi')
const jwt = require('../../../lib/jwt')

module.exports = {
  schema: Joi.object().keys({
    fullName: Joi.string()
      .min(1)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(8)
      .max(32)
      .required()
  }),
  handler: async ctx => {
    try {
      const { fullName, email, password } = ctx.request.body

      // Check if account with the same email exists
      const uEmail = await User.findOne({ where: { email } })
      if (uEmail) {
        throw new Error(
          JSON.stringify({
            status: 400,
            message: 'An account with the same email is already registered'
          })
        )
      }

      // Add to db if everything is fine
      const u = await User.create({
        fullName,
        email,
        password: await bcrypt.hash(password, 14)
      })

      // Create token
      const token = await jwt.createToken(u.dataValues)
      if (!token) {
        // Delete from db
        await User.destroy({ where: { id: u.dataValues.id } })
        throw new Error(JSON.stringify({ status: 401, message: 'JWT Error' }))
      }

      ctx.send(ctx, 200, true, 'User created', { token })
    } catch (e) {
      const err = JSON.parse(e.message)
      ctx.throw(ctx, err.status || 500, err.message || e.message, err.error)
    }
  }
}

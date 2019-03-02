const User = require('../../../models/User')
const bcrypt = require('bcrypt')
const Joi = require('joi')

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

      ctx.body = {
        success: true,
        message: 'User created',
        user: u.dataValues
      }
    } catch (e) {
      const err = JSON.parse(e.message)
      ctx.throw(ctx, err.status || 500, err.message || e.message, err.error)
    }
  }
}

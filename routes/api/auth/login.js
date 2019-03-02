const User = require('../../../models/User')
const jwt = require('../../../lib/jwt')
const bcrypt = require('bcrypt')
const Joi = require('joi')

module.exports = {
  schema: Joi.object().keys({
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
      const { email, password } = ctx.request.body

      // Check if account  exists
      const u = await User.findOne({ where: { email } })
      if (!u) {
        throw new Error(
          JSON.stringify({
            status: 404,
            message: 'Account does not exist'
          })
        )
      }

      // Compare password
      if (!(await bcrypt.compare(password, u.dataValues.password))) {
        throw new Error(
          JSON.stringify({
            status: 401,
            message: 'Incorrect password'
          })
        )
      }

      ctx.body = {
        success: true,
        message: `Logged in as ${u.dataValues.fullName}`,
        token: await jwt.createToken(u.dataValues)
      }
    } catch (e) {
      const err = JSON.parse(e.message)
      ctx.throw(ctx, err.status || 500, err.message || e.message, err.error)
    }
  }
}

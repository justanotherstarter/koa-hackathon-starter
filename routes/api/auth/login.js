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
    const { email, password } = ctx.request.body

    let u
    try {
      // Check if account  exists
      u = await ctx.models.User.findOne({ where: { email } })
      if (!u) ctx.throw(ctx, 404, 'User not found')
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error', e)
      return
    }

    try {
      // Compare password
      if (!(await bcrypt.compare(password, u.dataValues.password))) {
        ctx.throw(ctx, 401, 'Incorrect password')
      }
    } catch (e) {
      ctx.throw(ctx, 500, 'bcrypt error', e)
      return
    }

    // Create token
    try {
      const token = jwt.createToken(u.dataValues)
      ctx.send(ctx, 200, true, `Logged in as ${u.dataValues.fullName}`, {
        token
      })
    } catch (e) {
      ctx.throw(ctx, 500, 'Unable to sign token', e)
    }
  }
}

/* eslint-disable quotes */
const Joi = require('Joi')
const bcrypt = require('bcrypt')
const jwt = require('../../../lib/jwt')

module.exports = {
  schema: Joi.object().keys({
    id: Joi.number().required(),
    token: Joi.string().required()
  }),
  handler: async ctx => {
    const { id, token } = ctx.request.body

    // Check if user exists
    let u
    try {
      u = await ctx.models.User.findOne({ where: { id } })
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error', e)
      return
    }

    if (!u) {
      ctx.throw(ctx, 404, 'User not found')
      return
    }

    // Return if email is verified
    if (u.dataValues.emailVerified) {
      ctx.throw(ctx, 400, 'Email already verified')
      return
    }

    // Verify token
    try {
      if (!(await bcrypt.compare(token, u.dataValues.emailVerificationToken))) {
        ctx.throw(ctx, 400, 'Invalid token')
        return
      }
    } catch (e) {
      ctx.throw(ctx, 500, "Couldn't verify token", e)
      return
    }

    // Update instance
    try {
      u = await u.update({ emailVerified: true })
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error', e)
      return
    }

    // Create new token
    let jwtoken
    try {
      jwtoken = await jwt.createToken(u)
    } catch (e) {
      ctx.send(ctx, 200, true, 'Email verified')
      return
    }

    ctx.send(ctx, 200, true, 'Email verified', { token: jwtoken })
  }
}

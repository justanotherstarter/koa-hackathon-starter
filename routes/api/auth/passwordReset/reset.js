/* eslint-disable quotes */
const Joi = require('joi')
const bcrypt = require('bcrypt')
const jwt = require('../../../../lib/jwt')

module.exports = {
  schema: Joi.object().keys({
    newPassword: Joi.string().required(),
    userId: Joi.number().required(),
    token: Joi.string().required()
  }),
  handler: async ctx => {
    // Check if account exists
    const { newPassword, userId, token } = ctx.request.body

    let u
    try {
      u = await ctx.models.User.findOne({
        where: { id: userId },
        include: [{ model: ctx.models.PasswordResetAttempt }]
      })
      if (!u) {
        ctx.throw(ctx, 404, 'User not found')
        return
      }
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error', e)
      return
    }

    // Check if the user has open password reset requests
    const openResets = u.dataValues.passwordresets.filter(
      attempt => !attempt.used
    )
    if (openResets.length === 0) {
      ctx.throw(ctx, 400, 'No open password reset requests')
      return
    }

    // Verify token
    try {
      if (!(await bcrypt.compare(token, openResets[0].dataValues.token))) {
        ctx.throw(ctx, 400, 'Invalid token')
        return
      }
    } catch (e) {
      console.log(e)
      ctx.throw(ctx, 500, "Couldn't verify token", e)
      return
    }

    // Update password
    try {
      await u.update({ password: newPassword })
      await openResets[0].update({ used: true, token: null })
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

    ctx.send(ctx, 200, true, 'Password reset', { token: jwtoken })
  }
}

const Joi = require('joi')
const jwt = require('../../../../lib/jwt')

module.exports = {
  schema: Joi.object().keys({
    username: Joi.string().required()
  }),
  handler: async ctx => {
    // Find user
    let user
    try {
      user = await ctx.models.User.findOne({
        where: { id: ctx.state.tokenPayload.id }
      })
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error', e)
      return
    }

    if (!user) {
      ctx.throw(ctx, 400, 'Invalid token')
      return
    }

    // Check if the user is trying to change the username to the same username
    if (ctx.request.body.username === user.dataValues.username) {
      ctx.throw(ctx, 400, 'Username already in use')
      return
    }

    // Update user
    try {
      user = await user.update(ctx.request.body, { fields: ['username'] })
    } catch (e) {
      e.name === 'SequelizeUniqueConstraintError'
        ? ctx.throw(ctx, 400, 'Username in use')
        : ctx.throw(ctx, 500, 'Database error')
      return
    }

    // Add token to blacklist
    try {
      await ctx.models.BlacklistedToken.create({ token: ctx.state.token })
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error', e)
      return
    }

    // Sign new token
    try {
      const token = await jwt.createToken(user.dataValues)
      ctx.send(ctx, 201, true, 'Username changed', { token })
    } catch (e) {
      ctx.send(ctx, 201, true, 'Username changed')
    }
  }
}

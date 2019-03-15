const Joi = require('joi')
const bcrypt = require('bcrypt')

module.exports = {
  schema: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required()
  }),
  handler: async ctx => {
    const { oldPassword, newPassword } = ctx.request.body

    // Find user
    let user
    try {
      user = await ctx.models.User.findOne({
        where: { id: ctx.state.tokenPayload.id }
      })
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error')
      return
    }

    if (!user) {
      ctx.throw(ctx, 401, 'User not found')
      return
    }

    // Verify password
    try {
      if (!(await bcrypt.compare(oldPassword, user.dataValues.password))) {
        ctx.throw(ctx, 401, 'Incorrect password')
        return
      }
    } catch (e) {
      ctx.throw(ctx, 500, 'Unable to verify password')
      return
    }

    // Update password
    try {
      user = await user.update({ password: await bcrypt.hash(newPassword, 14) })
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error')
      return
    }

    ctx.send(ctx, 200, true, 'Password changed')
  }
}

/* eslint-disable quotes */
const bcrypt = require('bcrypt')

module.exports = {
  handler: async ctx => {
    const { id, token } = ctx.query

    // Check if user exists
    let u
    try {
      u = await ctx.models.User.findOne({ where: { id } })
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error', e)
      return
    }

    // Return if email is verified
    if (u.dataValues.emailVerified) {
      ctx.throw(ctx, 400, 'Email already verified')
      return
    }

    // Verify token
    try {
      if (!bcrypt.compare(token, u.dataValues.emailVerificationToken)) {
        ctx.throw(ctx, 400, 'Invalid token')
        return
      }
    } catch (e) {
      ctx.throw(ctx, 500, "Couldn't verify token", e)
      return
    }

    // Update instance
    try {
      await u.update({ emailVerified: true, emailVerificationToken: null })
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error', e)
      return
    }

    ctx.send(ctx, 200, true, 'Email verified')
  }
}

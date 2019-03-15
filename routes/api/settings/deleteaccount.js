module.exports = {
  handler: async ctx => {
    // Remove account
    try {
      await ctx.models.User.destroy({
        where: { id: ctx.state.tokenPayload.id }
      })
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error', e)
      return
    }

    // Blacklist token
    try {
      await ctx.models.BlacklistedToken.create({ token: ctx.state.token })
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error')
      return
    }

    ctx.send(ctx, 200, true, 'Account deleted')
  }
}

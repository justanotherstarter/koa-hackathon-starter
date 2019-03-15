module.exports = {
  handler: async ctx => {
    // Add token to blacklist
    try {
      await ctx.models.BlacklistedToken.create({ token: ctx.state.token })
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error')
      return
    }

    ctx.send(ctx, 200, 'Logged out')
  }
}

module.exports = {
  handler: async ctx => {
    // Add token to blacklist
    try {
      await ctx.models.BlacklistedToken.create({ token: ctx.state.token })
    } catch (e) {
      e.name === 'SequelizeUniqueConstraintError'
        ? ctx.throw(ctx, 400, 'Token already blacklisted')
        : ctx.throw(ctx, 500, 'Database error')
      return
    }

    ctx.send(ctx, 201, 'Logged out')
  }
}

const jwt = require('jsonwebtoken')
const secret =
  process.env.JWT_SECRET ||
  require('crypto')
    .randomBytes(25)
    .toString('hex')
const config = {
  issuer: process.env.JWT_ISS || 'koa-hackathon-starter',
  subject: process.env.JWT_SUB || 'khs-auth',
  audience: process.env.JWT_AUD || 'khs-user'
}

module.exports = {
  createToken: payload => {
    try {
      return jwt.sign(payload, secret, {
        expiresIn: '18h',
        ...config
      })
    } catch (error) {
      throw error
    }
  },
  verifyToken: async (ctx, next) => {
    ctx.state.token = ctx.get('Authorization').split(' ')[1]
    if (!ctx.state.token) {
      ctx.throw(ctx, 401, 'Missing token')
      return
    }

    try {
      ctx.state.tokenPayload = jwt.verify(ctx.state.token, secret, {
        ...config,
        clockTolerance: 30
      })
    } catch (error) {
      error.name === 'TokenExpiredError'
        ? ctx.throw(ctx, 401, 'Token expired')
        : ctx.throw(ctx, 401, 'Invalid signature')
      return
    }

    // Check if token isn't blacklisted
    let blacklisted
    try {
      blacklisted = await ctx.models.BlacklistedToken.findOne({
        where: { token: ctx.state.token }
      })
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error')
      return
    }

    if (blacklisted) {
      ctx.throw(ctx, 401, 'Token is blacklisted')
      return
    }

    await next()
  }
}

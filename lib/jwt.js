const jwt = require('jsonwebtoken')
const config = {
  issuer: process.env.JWT_ISS || 'koa-hackathon-starter',
  subject: process.env.JWT_SUB || 'khs-auth',
  audience: process.env.JWT_AUD || 'khs-user',
  secret:
    process.env.JWT_SECRET ||
    require('crypto')
      .randomBytes(25)
      .toString('hex')
}

module.exports = {
  createToken: payload => {
    try {
      return [
        null,
        jwt.sign(payload, config.secret, { expiresIn: '18h', ...config })
      ]
    } catch (error) {
      return [error]
    }
  },
  verifyToken: async (ctx, next) => {
    ctx.state.token = ctx.get('Authorization').split(' ')[1]
    if (!ctx.state.token) {
      ctx.status = 401
      ctx.body = {
        success: false,
        message: 'Missing token'
      }
    }

    try {
      ctx.state.tokenPayload = jwt.decode(ctx.state.token, config.secret)
    } catch (error) {
      const err = JSON.parse(error.message)
      ctx.throw(ctx, err.status || 500, err.message || error.message, err.error)
    }

    // Validate token
    if (
      ctx.state.tokenPayload.iss != config.iss ||
      ctx.state.tokenPayload.sub != config.sub ||
      ctx.state.tokenPayload.aud != config.aud
    ) {
      throw new Error(
        JSON.encode({
          status: 401,
          message: 'Invalid token'
        })
      )
    }

    await next()
  }
}

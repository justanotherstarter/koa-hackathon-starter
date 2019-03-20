const Joi = require('joi')
const crypto = require('crypto')
const mail = require('../../../../lib/mail')
const jwt = require('../../../../lib/jwt')

module.exports = {
  schema: Joi.object().keys({
    email: Joi.string()
      .email()
      .required()
  }),
  handler: async ctx => {
    // Check if account exists
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
      ctx.throw(ctx, 400, 'User not found')
      return
    }

    // Check if the user is trying to change the email to the same email
    if (ctx.request.body.email === user.dataValues.email) {
      ctx.throw(ctx, 400, 'Email already in use')
      return
    }

    const emailVerificationToken = crypto.randomBytes(20).toString('hex')

    // Change the email
    try {
      user = await user.update({
        email: ctx.request.body.email,
        emailVerified: false,
        emailVerificationToken
      })
    } catch (e) {
      e.name === 'SequelizeUniqueConstraintError'
        ? ctx.throw(ctx, 400, 'Email already in use')
        : ctx.throw(ctx, 500, 'Unable to update email', e)
      return
    }

    // Blacklist token
    try {
      await ctx.models.BlacklistedToken.create({ token: ctx.state.token })
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error')
      return
    }

    // Send email verification email
    const emailVerificationURL = `${ctx.protocol}://${
      ctx.header.host
    }/auth/verifyemail?id=${user.dataValues.id}&token=${emailVerificationToken}`
    try {
      await mail(
        user.dataValues.email,
        'Verify your email',
        `You just changed your email for ${process.env.APP_NAME}!<br><br>

      Verify your email here: <br><a href="${emailVerificationURL}">${emailVerificationURL}</a><br><br>
      
      You might need to copy and paste the link into your browser if it doesn't work when you click on it.<br><br>

      Regards,<br>
      The ${process.env.APP_NAME} team`
      )
    } catch (e) {
      ctx.throw(ctx, 500, 'SendGrid error', e)
      return
    }

    // Send new token
    try {
      const token = await jwt.createToken(user.dataValues)
      ctx.send(ctx, 200, true, 'Email updated', { token })
    } catch (e) {
      ctx.send(ctx, 200, true, 'Email updated')
    }
  }
}

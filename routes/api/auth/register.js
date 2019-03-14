/* eslint-disable quotes */
const Joi = require('joi')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('../../../lib/jwt')
const mail = require('../../../lib/mail')

module.exports = {
  schema: Joi.object().keys({
    username: Joi.string()
      .min(1)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(8)
      .max(32)
      .required()
  }),
  handler: async ctx => {
    const { username, email, password } = ctx.request.body
    const emailVerificationToken = crypto.randomBytes(20).toString('hex')

    // Add to db and check for errors
    let u
    try {
      u = await ctx.models.User.create({
        username,
        email,
        password: await bcrypt.hash(password, 14),
        emailVerificationToken: await bcrypt.hash(emailVerificationToken, 14)
      })
    } catch (e) {
      // Check for duplicate email and username
      e.name === 'SequelizeUniqueConstraintError'
        ? ctx.throw(
            ctx,
            400,
            `An account with the same ${Object.keys(e.fields).join(
              ','
            )} is already registered`
          )
        : ctx.throw(ctx, 500, 'Database error', e)
      return
    }

    // Send email verification email
    const emailVerificationURL = `${ctx.protocol}://${
      ctx.header.host
    }/auth/verifyemail?id=${u.dataValues.id}&token=${emailVerificationToken}`
    try {
      await mail(
        u.dataValues.email,
        'Verify your email',
        `Thanks for registering for ${process.env.APP_NAME}!<br><br>

      Verify your email here: <br><a href="${emailVerificationURL}">${emailVerificationURL}</a><br><br>
      
      You might need to copy and paste the link into your browser if it doesn't work when you click on it.<br><br>

      Regards,<br>
      The ${process.env.APP_NAME} team`
      )
    } catch (e) {
      // Delete account
      try {
        await u.destroy()
      } catch (e) {
        ctx.throw(ctx, 500, "Couldn't delete account after SendGrid error", e)
        return
      }
      ctx.throw(ctx, 500, 'SendGrid error', e)
      return
    }

    // Create token
    try {
      const token = jwt.createToken(u.dataValues)
      ctx.send(ctx, 201, true, 'User created', { token })
    } catch (e) {
      ctx.send(ctx, 201, true, 'User created')
      return
    }
  }
}

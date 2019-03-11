/* eslint-disable quotes */
const bcrypt = require('bcrypt')
const Joi = require('joi')
const crypto = require('crypto')
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
    console.log(JSON.parse(JSON.stringify(ctx)))
    const { username, email, password } = ctx.request.body
    const emailVerificationToken = crypto.randomBytes(20).toString('hex')

    // Add to db and check for errors
    let u
    try {
      u = await ctx.models.User.create({
        username,
        email,
        password: await bcrypt.hash(password, 14),
        emailVerificationToken
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
    console.log({ emailVerificationToken, emailVerificationURL })
    try {
      await mail(
        u.dataValues.email,
        'Verify your email',
        `Thanks for registering for APP_NAME!<br><br>

      Verify your email here: <a href="${emailVerificationURL}">${emailVerificationURL}</a><br><br>

      Regards,
      The APP_NAME team`
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
      ctx.send(ctx, 200, true, 'User created', { token })
    } catch (e) {
      ctx.throw(ctx, 500, 'Unable to sign token', e)
      return
    }
  }
}

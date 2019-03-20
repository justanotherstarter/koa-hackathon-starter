/* eslint-disable quotes */
const Joi = require('joi')
const crypto = require('crypto')
const mail = require('../../../../lib/mail')

module.exports = {
  schema: Joi.object().keys({
    identifier: Joi.string().required()
  }),
  handler: async ctx => {
    // Check if account exists
    const { identifier } = ctx.request.body

    let u
    try {
      u = await ctx.models.User.findOne({
        where: {
          [ctx.SequelizeOp.or]: [
            { email: identifier },
            { username: identifier }
          ]
        },
        include: [{ model: ctx.models.PasswordResetAttempt }]
      })
      if (!u) {
        ctx.throw(ctx, 404, 'User not found')
        return
      }
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error', e)
      return
    }

    // Check if user's email is verified
    if (!u.dataValues.emailVerified) {
      ctx.throw(
        ctx,
        400,
        "Can't reset your password without verifying your email"
      )
      return
    }

    // Check if the user has open password reset requests
    const openResets = u.dataValues.passwordresets.filter(
      attempt => !attempt.used
    )
    if (openResets.length > 0) {
      ctx.throw(ctx, 400, 'You already have open password reset requests')
      return
    }

    // Create token
    const token = crypto.randomBytes(20).toString('hex')

    // If not, create one
    let attempt
    try {
      attempt = await ctx.models.PasswordResetAttempt.create({
        userId: u.dataValues.id,
        token
      })
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error', e)
      return
    }

    // Create url for password reset
    const passwordResetURL = `${ctx.protocol}://${
      ctx.headers.host
    }/auth/resetpassword?id=${u.dataValues.id}&token=${token}`

    // Send email
    try {
      mail(
        u.dataValues.email,
        `Password reset request for ${process.env.APP_NAME}`,
        `
        Hello ${u.dataValues.username}!<br><br>

        You requested a password reset request for ${
          process.env.APP_NAME
        }. It's okay, we all lose our passwords sometimes! You can reset your password here - <br><a href="${passwordResetURL}">${passwordResetURL}</a><br><br>

        You might need to copy and paste the link into your browser if it doesn't work when you click on it.<br><br>

        Regards,<br>
        The ${process.env.APP_NAME} team
        `
      )
    } catch (e) {
      // Delete account
      try {
        await attempt.destroy()
      } catch (e) {
        ctx.throw(ctx, 500, "Couldn't delete account after SendGrid error", e)
        return
      }
      ctx.throw(ctx, 500, 'SendGrid error', e)
      return
    }

    ctx.send(ctx, 200, true, 'Password reset requested')
    return
  }
}

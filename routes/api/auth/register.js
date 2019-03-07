/* eslint-disable quotes */
const bcrypt = require('bcrypt')
const Joi = require('joi')
const jwt = require('../../../lib/jwt')

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

    // Add to db and check for errors
    try {
      const u = await ctx.models.User.create({
        username,
        email,
        password: await bcrypt.hash(password, 14)
      })

      // Create token
      const token = jwt.createToken(u.dataValues)
      // Check if token was signed correctly
      token
        ? ctx.send(ctx, 200, true, 'User created', { token })
        : ctx.throw(ctx, 500, "Couldn't sign token (JWT Error)")
    } catch (e) {
      // Check for duplicate email and username
      e.name === 'SequelizeUniqueConstraintError'
        ? ctx.throw(
            ctx,
            500,
            `An account with the same ${Object.keys(e.fields).join(
              ','
            )} is already registered`,
            e
          )
        : ctx.throw(ctx, 500, 'Database error', e)
        return
    }
  }
}

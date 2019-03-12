/* eslint-disable quotes */
const jwt = require('../../../lib/jwt')
const bcrypt = require('bcrypt')
const Joi = require('joi')

module.exports = {
  schema: Joi.object().keys({
    identifier: Joi.string().required(),
    password: Joi.string()
      .min(8)
      .max(32)
      .required()
  }),
  handler: async ctx => {
    const { identifier, password } = ctx.request.body

    let u
    try {
      // Check if account  exists
      u = await ctx.models.User.findOne({
        where: {
          [ctx.SequelizeOp.or]: [
            { email: identifier },
            { username: identifier }
          ]
        }
      })
      if (!u) {
        ctx.throw(ctx, 404, 'User not found')
        return
      }
    } catch (e) {
      ctx.throw(ctx, 500, 'Database error', e)
      return
    }

    try {
      // Compare password
      if (!(await bcrypt.compare(password, u.dataValues.password))) {
        ctx.throw(ctx, 401, 'Incorrect password')
        return
      }
    } catch (e) {
      ctx.throw(ctx, 500, "Couldn't compare password", e)
      return
    }

    // Create token
    try {
      const token = jwt.createToken(u.dataValues)
      ctx.send(ctx, 200, true, `Logged in as ${u.dataValues.username}`, {
        token
      })
    } catch (e) {
      ctx.throw(ctx, 500, 'Unable to sign token', e)
      return
    }
  }
}

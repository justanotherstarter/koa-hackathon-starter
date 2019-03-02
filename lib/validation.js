const Joi = require('joi')

module.exports = {
  validateAgainst: schema => async (ctx, next) => {
    ctx.state.validationRes = Joi.validate(ctx.request.body, schema)
    if (ctx.state.validationRes.error) {
      ctx.throw(ctx, 400, 'Bad Request', ctx.state.validationRes.message)
      return
    }
    await next()
  }
}

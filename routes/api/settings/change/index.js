const Router = require('koa-router')
const { validateAgainst } = require('../../../../lib/validation')
const usernameHandler = require('./username')
const emailHandler = require('./email')
const passwordHandler = require('./password')
const rtr = new Router()

rtr.post(
  '/username',
  validateAgainst(usernameHandler.schema),
  usernameHandler.handler
)

rtr.post('/email', validateAgainst(emailHandler.schema), emailHandler.handler)

rtr.post(
  '/password',
  validateAgainst(passwordHandler.schema),
  passwordHandler.handler
)

module.exports = rtr

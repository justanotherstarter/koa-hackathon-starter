const Router = require('koa-router')
const { validateAgainst } = require('../../../../lib/validation')
const usernameHandler = require('./username')
const emailHandler = require('./email')
const passwordHandler = require('./password')
const rtr = new Router()

rtr.put(
  '/username',
  validateAgainst(usernameHandler.schema),
  usernameHandler.handler
)

rtr.put('/email', validateAgainst(emailHandler.schema), emailHandler.handler)

rtr.put(
  '/password',
  validateAgainst(passwordHandler.schema),
  passwordHandler.handler
)

module.exports = rtr

const Router = require('koa-router')
const { validateAgainst } = require('../../../../lib/validation')
const jwt = require('../../../../lib/jwt')
const usernameHandler = require('./username')
const emailHandler = require('./email')
const passwordHandler = require('./password')
const rtr = new Router()

rtr.put(
  '/username',
  validateAgainst(usernameHandler.schema),
  jwt.verifyToken,
  usernameHandler.handler
)

rtr.put(
  '/email',
  validateAgainst(emailHandler.schema),
  jwt.verifyToken,
  emailHandler.handler
)

rtr.put(
  '/password',
  validateAgainst(passwordHandler.schema),
  jwt.verifyToken,
  passwordHandler.handler
)

module.exports = rtr

const Router = require('koa-router')
const { validateAgainst } = require('../../../lib/validation')
const jwt = require('../../../lib/jwt')
const changeUsernameHandler = require('./usernameChange')
const changeEmailHandler = require('./emailChange')
const rtr = new Router()

rtr.post(
  '/usernamechange',
  jwt.verifyToken,
  validateAgainst(changeUsernameHandler.schema),
  changeUsernameHandler.handler
)

rtr.post(
  '/emailchange',
  jwt.verifyToken,
  validateAgainst(changeEmailHandler.schema),
  changeEmailHandler.handler
)

module.exports = rtr

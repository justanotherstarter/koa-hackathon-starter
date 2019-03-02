const Router = require('koa-router')
const { validateAgainst } = require('../../../lib/validation')
const jwt = require('../../../lib/jwt')
const registerHandler = require('./register')
const loginHandler = require('./login')
const rtr = new Router()

rtr.all('/', async ctx => {
  // ctx.throw(200, 'ell0')
  ctx.body = {
    success: true,
    message: 'koa-hackathon-starter auth'
  }
})

rtr.post(
  '/register',
  validateAgainst(registerHandler.schema),
  registerHandler.handler
)

rtr.post(
  '/login',
  jwt.verifyToken,
  validateAgainst(loginHandler.schema),
  loginHandler.handler
)

module.exports = rtr

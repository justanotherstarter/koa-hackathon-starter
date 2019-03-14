const Router = require('koa-router')
const jwt = require('../../../lib/jwt')
const changeRoutes = require('./change')
const rtr = new Router()

rtr.use(
  '/change',
  jwt.verifyToken,
  changeRoutes.routes(),
  changeRoutes.allowedMethods()
)

module.exports = rtr

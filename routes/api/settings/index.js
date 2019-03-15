const Router = require('koa-router')
const jwt = require('../../../lib/jwt')
const changeRoutes = require('./change')
const deleteHandler = require('./deleteaccount')
const rtr = new Router()

rtr.use(
  '/change',
  jwt.verifyToken,
  changeRoutes.routes(),
  changeRoutes.allowedMethods()
)

rtr.post('/deleteaccount', jwt.verifyToken, deleteHandler.handler)

module.exports = rtr

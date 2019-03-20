const Router = require('koa-router')
const jwt = require('../../../lib/jwt')
const changeRoutes = require('./change')
const deleteHandler = require('./deleteaccount')
const rtr = new Router()

rtr.delete('/', jwt.verifyToken, deleteHandler.handler)

rtr.use('/change', changeRoutes.routes(), changeRoutes.allowedMethods())

module.exports = rtr

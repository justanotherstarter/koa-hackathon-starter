const Router = require('koa-router')
const { validateAgainst } = require('../../../../lib/validation')
const request = require('./request')
const reset = require('./reset')

const rtr = new Router()

rtr.post('/request', validateAgainst(request.schema), request.handler)
rtr.post('/reset', validateAgainst(reset.schema), reset.handler)

module.exports = rtr

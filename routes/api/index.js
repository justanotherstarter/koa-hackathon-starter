const Router = require('koa-router')
const authRoutes = require('./auth')
const settingsRoutes = require('./settings')
const rtr = new Router()

rtr.use('/auth', authRoutes.routes(), authRoutes.allowedMethods())
rtr.use('/settings', settingsRoutes.routes(), settingsRoutes.allowedMethods())

rtr.get('/', async ctx =>
  ctx.send(ctx, 200, true, 'Welcome to the koa-hackathon-starter API!')
)

// Handle 404s (only for the API)
rtr.all('*', async ctx => ctx.throw(ctx, 404, 'Resource not found'))

module.exports = rtr

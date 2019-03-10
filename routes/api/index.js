const Router = require('koa-router')
const authRoutes = require('./auth')
const rtr = new Router()

rtr.use('/auth', authRoutes.routes(), authRoutes.allowedMethods())

rtr.get('/', async ctx =>
  ctx.send(ctx, 200, true, 'Welcome to koa-hackathon-starter API!')
)

// Handle 404s
rtr.all('*', async ctx => ctx.throw(ctx, 404, 'Resource not found'))

module.exports = rtr

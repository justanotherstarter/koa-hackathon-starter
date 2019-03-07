const Router = require('koa-router')
const apiRoutes = require('./api')
const fs = require('fs')
const rtr = new Router()

// Mount API routes
rtr.use('/api', apiRoutes.routes(), apiRoutes.allowedMethods())

// Serve react app
rtr.get(/(^\/[^/])*$/, async ctx => {
  ctx.set('Content-Type', 'text/html')
  ctx.body = fs.createReadStream('./static/index.html')
})

// Handle 404s
rtr.all('*', async ctx => ctx.throw(ctx, 404, 'Resource not found'))

module.exports = rtr

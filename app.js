const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const logger = require('koa-logger')
const rt = require('koa-response-time')
const static = require('koa-static')
const compress = require('koa-compress')
const helmet = require('koa-helmet')
const loggerTransporter = require('debug')('req-logger')
const routes = require('./routes')

const app = new Koa()

app.context.send = (ctx, status, success, message, extra) => {
  ctx.status = status
  ctx.body = {
    success,
    message,
    ...extra
  }
}

// Serve static assets for react app
app.use(static(__dirname + '/static', { defer: true }))

// Custom error handling
app.context.throw = (ctx, status, message, error) => {
  ctx.send(ctx, status, false, message, { error })
}

app.use(logger(str => loggerTransporter(str)))
app.use(rt())
app.use(compress())
app.use(helmet())

// Body parser
app.use(
  bodyParser({
    enableTypes: ['json'],
    onerror: (error, ctx) => ctx.throw(ctx, 400, 'Bodyparser error', error)
  })
)

// Mount routes
app.use(routes.routes(), routes.allowedMethods())

// 404 handling
app.use(async ctx => ctx.throw(ctx, 404, 'Resource not found'))

module.exports = app

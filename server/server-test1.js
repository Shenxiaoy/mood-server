const koa = require('koa')
const path = require('path')
const router = require('koa-router')()
const cors = require('koa2-cors')
const serve = require('koa-static')
const IO = require('koa-socket-2')
const ioSend = require('./routes/io-send')
const db = require('./db')
const koaBody = require('koa-body')
const app = new koa()
const io = new IO()
io.attach(app)

app.use(serve(__dirname + '/static'))
app.use(koaBody())
app.use(cors({
  origin: function (ctx) {
	return ctx.header.origin
  }
}))

router.post('/notepanel/main/message', async (ctx, next) => {
  const queryData = ctx.request.body
  // db.panelNotes.create({title: '我的便签', content: 'test', username: 'sxy'})
  // updateOne 不能够创建数据
  await db.panelNotes.updateOne({title: queryData.title}, {content: queryData.str})
  ctx.response.body = {code: 1, meg: 'success'}

})
router.get('/notepanel/main/message', async (ctx, next) => {
  await db.panelNotes.find({title: '我的便签'}, function (err, data) {
    ctx.response.body = {code: 1, str: data[0].content}
  })

})

app.use(router.routes())
  .use(router.allowedMethods())

io.on('connection', ioSend)

app.listen(9997, function () {
  console.log('post:' + 9997)
})
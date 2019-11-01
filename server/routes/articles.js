const Router  = require('koa-router')
const router = new Router()
const db = require('../db')
const jwtUtil = require('../utils/jwt')
const configData = require('./configData')

const resBody = configData.resBody

// 发表文章列表
router.get('/list', async (ctx, next) => {
  const list = await db.articleModel.find()
  ctx.response.body = {
    code: 0,
    data: {
      list: list
    }
  }
})

// 文章发表
router.post('/save', (ctx, next) => {
  const queryData = ctx.request.body
  if (queryData.content) {
    db.articleModel.create(queryData)
    ctx.response.body = {
      code: 0,
      success: '发表成功'
    }
  } else {
    ctx.response.body = {
      code: 1,
      errorMsg: '无内容'
    }
  }
})

// 登录
router.post('/login', async (ctx, next) => {
  const {username, pass} = ctx.request.body
  if (username && pass) {
    const result = await db.users.findOne({username: username})
    if (result) {
      if (result.pass === pass) {
        const _id = result._id.toString()
        const jwt = new jwtUtil(_id)
        const token = jwt.generateToken()
        ctx.cookies.set('token', token)
        ctx.response.body = {
          code: 0,
          msg: '成功'
        }
      }
      else {
        ctx.response.body = {
          code: 1,
          errorMsg: '密码错误'
        }
      }
    }
  } else {
    ctx.response.body = {
      code: 1,
      errorMsg: '请输入用户名和密码'
    }
  }

})

// 是否登录态
router.get('/selfCheck', async (ctx, next) => {
  const token = ctx.cookies.get('token')
  const origin = ctx.req.headers.origin
  const loginUrl = origin + '/#/login'
  if (!token) {
    ctx.body = resBody.error()
  }
  else {
    const result = configData.loginRealness(token)
    if (result) {
      const userInfo = await db.users.findOne({_id: result})
      const data = {
        username: userInfo.username
      }
      ctx.body = resBody.success(data, '成功是是是')
    }
    else {
      ctx.body = resBody.error()
    }
  }

})

module.exports = router
const express = require('express')
const router = express.Router()
const sha1 = require('sha1')

const checkNotLogin = require('../middlewares/check').checkNotLogin
const UserModel = require('../models/user')

// GET /signin 登录页
router.get('/', checkNotLogin, function (req, res, next) {
 //res.send('登录页')
 res.render('signin');
})

// POST /signin 用户登录
router.post('/', checkNotLogin, function (req, res, next) {
  //res.send('登录')

  const name = req.fields.name;
  const password = req.fields.password;


  //校验参数
  try{
    if (!name.length) {
      throw new Error('请填写用户名')
    }
    if (!password.length) {
      throw new Error('请填写密码')
    }
  }catch(e){
    req.flash('error',e.message);
    return res.redirect('back');
  }

  //查询数据库
  UserModel.getUserByName(name)
    .then(function(User){
      if(!User){
        req.flash('error','不存在该用户');
        return res.redirect('back');
      }

      //检查密码是否匹配
      if(sha1(password) !== User.password){
        req.flash('error','用户名或密码错误');
        return res.redirect('back');
      }

      req.flash('success','登陆成功');

      //将用户信息写入session
      delete User.password;
      req.session.user = User;

      res.redirect('/posts');
    })
    .catch(next);
})

module.exports = router
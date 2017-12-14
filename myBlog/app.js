var express = require('express');
var path = require('path');
//var logger = require('morgan');
var bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const config = require('config-lite')(__dirname);
const pkg = require('./package');
var routes = require('./routes/index');
//日志模块
const winston = require('winston');
const expressWinston = require('express-winston');

var app = express();

// 视图引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(logger('dev'));

//设置静态目录
app.use(express.static(path.join(__dirname, 'public')));

//session 中间件
app.use(session({
  name: config.session.key,
  secret: config.session.secret,
  resave: true,
  saveUninitialized: false,
  cookie:{
    maxAge : config.session.maxAge
  },
  store: new MongoStore({
    url:config.mongodb
  })
}))

//使用falsh中间件，用来显示通知
app.use(flash());

//设置全局变量
//这里变量一定要放在路由配置前，不然路由会找不到这个变量报错
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}

// 添加模板必需的三个变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})


//处理表单以及文件上传的中间件
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname,'public/img'),
  keepExtensions: true
}));


//配置路由

//这种路由是老方法，容易造成app滥用，目前express已经使用4.0，下面使用新的
//routes(app);

//正常的日志请求
app.use(expressWinston.logger({
  transports:[
    new (winston.transports.Console)({
      json:true,
      colorize:true
    }),
    new winston.transports.File({
      filename:'myLogs/success.log'
    })
  ]
}))

app.use(routes);

//错误的请求日志
app.use(expressWinston.logger({
  transports:[
    new winston.transports.Console({
      json:true,
      colorize:true
    }),
    new  winston.transports.File({
      filename:'myLogs/error.log'
    })
  ]
}))

app.use(function(err,req,res,next){
  console.error(err);
  req.flash('error',err.message);
  res.redirect('/posts');
});


module.exports = app;

var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
router.get('/',function(req,res){
  res.redirect('/posts')
});
router.use('/signup',require('./signup'));
router.use('/signin',require('./signin'));
router.use('/signout', require('./signout'));
router.use('/posts', require('./posts'));
router.use('/comments', require('./comments'));

//增加404页面
router.use(function(req,res){
  if(!res.headerSent){
    res.status(404).render('404');
  }
})
module.exports = router;


//下面是旧方法
// module.exports = function (app) {
//   app.get('/', function (req, res) {
//     res.redirect('/posts')
//   })
//   app.use('/signup', require('./signup'))
//   app.use('/signin', require('./signin'))
//   app.use('/signout', require('./signout'))
//   app.use('/posts', require('./posts'))
//   app.use('/comments', require('./comments'))
// }
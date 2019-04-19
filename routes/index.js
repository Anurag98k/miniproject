var express = require('express');
var router = express.Router();

/* GET home page. */
var view=0;
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/test', function(req, res, next) {
  if(view===0){
     view=1;
    res.render('test', { title: 0 });
  }
  else {
    res.render('test', { title: 1 });
  }
});

module.exports = router;

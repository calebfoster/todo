var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Todo App' });
  res.sendFile(path.join(__dirname, '../public', 'app.html'))
});

module.exports = router;

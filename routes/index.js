var express = require('express');
var router = express.Router();
var path = require('path');

router.get(['/', '/login', '/graphql'], function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public', 'app.html'))
});

module.exports = router;

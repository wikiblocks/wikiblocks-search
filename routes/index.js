var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	var d = new Date();
	var n = d.toString();
	res.render('index', { date: n });
});

module.exports = router;

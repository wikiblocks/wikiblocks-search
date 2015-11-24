var express = require('express');
var router = express.Router();

var handler = require('../handlers/search-handler.js');

/* POST search object */
router.post('/', function (req, res) {
	handler.handlePage(req.body, res);
});

module.exports = router;

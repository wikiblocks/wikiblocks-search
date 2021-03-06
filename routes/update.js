var express = require('express');
var router = express.Router();

var handler = require('../handlers/update-handler.js');

/* POST search object */
router.post('/', function (req, res) {
	var gist = req.body;
	
	// pass response to the middleware responsible for handling page
	handler.handleResult(gist, res);
});

module.exports = router;

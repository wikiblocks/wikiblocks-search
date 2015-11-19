var express = require('express');
var router = express.Router();

var handler = require('../handlers/gist-handler.js');

/* POST search object */
router.post('/', function (req, res) {
	var gist = req.body;

	if(!gist.gistid || !gist.username || !gist.description) {
    	return res.sendStatus(400);
	}
	// pass response to the middleware responsible for handling page
	handler.handleGist(gist, res);
});

module.exports = router;

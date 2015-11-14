var express = require('express');
var router = express.Router();

var handler = require('../handlers/search-handler.js');

/* POST search object */
router.post('/search', function (req, res) {
	var page = req.body;

	if(!page.title || !page.see_also || !page.categories) {
    	return res.sendStatus(400);
    	return;
	}
	// pass response to the middleware responsible for handling page
	handler.handlePage(page, res);
});

module.exports = router;

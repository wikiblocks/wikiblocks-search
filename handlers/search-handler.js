/**
 *	Copyright 2015, Brooks Mershon
 */
var	config = require('../config.json'),
	promise = require('bluebird'),
    monitor = require('pg-monitor'),
    extensions = require("../lib/pgp-extensions/");

// configure Promise library and add extensions
var options = {
    promiseLib: promise,
    extend: function (obj) {
        this.gist = extensions.extendGist(this);
        this.generator = extensions.extendGenerator(this);
        this.search = extensions.extendSearch(this);
    }
};

var pgp = require('pg-promise')(options);
var db = pgp(config); // database instance;

// pretty-printed database activity logging
monitor.attach(options);

function handlePage(page, response){

	if(!page.title) {
        return res.sendStatus(400);
    }

	var limit = 10,
		offset = 0;

	var t0 = new Date().getTime();

	// Promise resolves with most relevant gists
	db.search.wiki(page, limit, offset).then(function(gists){
		var result = {};
		result.start = t0;
		result.end = new Date().getTime();
		result.gists = gists;
		response.json(JSON.stringify(result, null, 2));
		//console.log("gists returned", JSON.stringify(gists, null, 2));
	})
	.catch(function(error){
		//throw error;
		response.sendStatus(500);
	});
};

module.exports = {
	handlePage: handlePage
};
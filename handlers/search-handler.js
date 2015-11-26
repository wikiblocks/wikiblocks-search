#!/usr/bin/env node

/*
	Copyright 2015, Brooks Mershon
*/
var	config = require('../config.json'),
	promise = require('bluebird'),
    monitor = require('pg-monitor'),
    extensions = require("../lib/pgp-extensions/");

// ***** Configuration and extensions
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

// monitor.attach(options); // attach to all query events;
// monitor.setTheme('matrix'); // change the default theme;

/*
	Creates a new client and new SearchEngine.

	Sends response with error status 500 or JSON results.
*/
function handlePage(page, response){

	var limit = 20,
		offset = 0;

	if(!page.title) {
    	return res.sendStatus(400);
	}


	var t0 = new Date();

	db.search.wiki(page, limit, offset).then(function(gists){
		console.log("returned gists", gists);
		var result = {};
		result.start = t0;
		result.end = new Date();
		result.gists = gists;
		response.json(JSON.stringify(result, null, 2));
	}).catch(function(error){
		response.sendStatus(500);
	});
};

module.exports = {
	handlePage: handlePage
};
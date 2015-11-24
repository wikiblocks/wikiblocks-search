#!/usr/bin/env node

/*
	Copyright 2015, Brooks Mershon
*/
var pg = require("pg"),
	config = require('../config.json'),
	annotate = require('../lib/annotate.js'),
	promise = require('bluebird'),
    monitor = require('pg-monitor'),
    nlp = require("../lib/nlp.js"),
    extensions = require("../lib/pgp-extensions/");

// ***** Configuration and extensions
var options = {
    promiseLib: promise,
    extend: function (obj) {
        // obj = this;
        this.gist = extensions.extendGist(this);
    }
};

var pgp = require('pg-promise')(options);
var db = pgp(config); // database instance;

monitor.attach(options); // attach to all query events;
monitor.setTheme('matrix'); // change the default theme;

/*
	Creates a new client and new SearchEngine.

	Sends response with error status 500 or JSON results.
*/
function handlePage(page, response){

	if(!page.title) {
    	return res.sendStatus(400);
	}
	var hooks = annotate(page);
	
	console.log(hooks);

	try {
		var t0 = new Date();

		db.search.wiki(hooks).then(function(gists){
			var result = {};
			result.start = t0;
			result.end = new Date();
			result.gists = gists;
			response.json(JSON.stringify(result, null, 2));
		}).catch(function(error){
			response.sendStatus(500);
		});
	} catch(e) {
		return response.sendStatus(500);
	}
};

module.exports = {
	handlePage: handlePage
};
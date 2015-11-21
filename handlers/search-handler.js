#!/usr/bin/env node

/*
	Copyright 2015, Brooks Mershon
*/

var pg = require("pg"),
	config = require('../config.json'),
	SearchEngines = require('../lib/search/SearchEngines.js');

/*
	Creates a new client and new SearchEngine.

	Sends response with error status 500 or JSON results.
*/
function handlePage(page, response){

	// new client for this request
	var client = new pg.Client(config);

	// new pg client with an internal queue of queries to execute
	client.connect(function(err) {
		if(err) {
			console.log(err);
			return response.sendStatus(503);
		}
	});

	// create a new SearchEngine object with the current client connected to the database
	var SearchEngine = new SearchEngines.IterativeSearchEngine(client);

	var t0 = Date.now();

	try {
		SearchEngine.getPageResults(page, function(error, gists) {

			client.end();

			if(error) {
				return response.sendStatus(500);
			}

			var results = {};
			results.gists = gists;
			results.start = t0;
			results.end = Date.now();
			return response.json(JSON.stringify(results, null, 2));
		});

	} catch(e) {
		return response.sendStatus(500);
	}
};

module.exports = {
	handlePage: handlePage
};
#!/usr/bin/env node

/*
	Copyright 2015
	Brooks Mershon, Manoj Kanagaraj, and Davis Treybig
*/

var pg = require("pg"),
	nlp = require('../lib/nlp.js'),
	config = require('../config.json'),
	SearchEngines = require('../lib/search/SearchEngines.js');

/*
	Creates a new client and new SearchEngine.

	Sends response with error status 500 or JSON results.
*/
function handlePage(page, response){

	// new pg client with an internal queue of queries to execute
	pg.connect(config, function(err, client, done) {
		
		var handleConnnectionError = function(err) {
	      // no error occurred, continue with the request
	      if(!err) return false;

	      // remove client from pool
	      if(client){
	        done(client);
	      }
	      return true;
	    };

	    if(handleConnnectionError(err)) {
	    	response.sendStatus(500);
	    	return;
	    }

		// create a new SearchEngine object with the current client connected to the database
		var SearchEngine = new SearchEngines.IterativeSearchEngine(client);

		var t0 = Date.now();

		try {
			SearchEngine.getPageResults(page, function(error, gists) {

				//return client to pool
				done(client);

				if(error) {
					response.sendStatus(500);
					return;
				}

				var results = {};
				results.gists = gists;
				results.start = t0;
				results.end = Date.now();
				response.json(JSON.stringify(results, null, 2));
			});

		} catch(e) {
			response.sendStatus(500);
		}
	});
};

module.exports = {
	handlePage: handlePage
};

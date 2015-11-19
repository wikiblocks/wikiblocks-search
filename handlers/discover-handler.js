#!/usr/bin/env node

/*
	Copyright 2015, Brooks Mershon

	Hanle gist to be inserted, updated with tags, or otherwise modified in the database.
*/

var	promise = require('bluebird'),
    monitor = require('pg-monitor'),
    config = require("../config.json"),
    nlp = require("../lib/nlp.js"),
    extensions = require("../lib/pg-extensions/");

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
	UpdateGist
*/
function handleGist(gist, response){

	var tags = nlp.tag.extract(gist.description).concat(gist.tags);

	var success = false;
	var newGist = null;

	db.gist.addGist(gist)
		.then(function(data) {
			newGist = gist;
			success = true;
		})
		.catch(function(error) {
			newGist = null;
			success = (error.code == "23505");
		})

	// transaction
	db.gist.addTags(gist.gistid, tags)
	    .then(function(data) {
	    	var added = data.map(function(d) {return d.assigntag});
	        response.json(JSON.stringify({success: success, gist: newGist, tags: added}));
	    })
	    .catch(function(error) {
	        response.json(JSON.stringify({success: false, error: error}));
	    });
};

module.exports = {
	handleGist: handleGist
};
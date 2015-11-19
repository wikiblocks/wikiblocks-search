#!/usr/bin/env node

/*
	Copyright 2015, Brooks Mershon
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

	var tags = nlp.tag.extract(gist.description);
	console.log(tags);

	db.tx(gist.gistid, function (t) {
		var Q = [];

		Q.push(db.gist.addGist(gist));
		Q.push(db.gist.addTags(gist.gistid, tags));

	    return t.batch(Q);
	})
	    .then(function(data) {
	        response.json(JSON.stringify({success: true, tags: tags}));
	    })
	    .catch(function(error) {
	        response.json(JSON.stringify({success: false}));
	    });
};

module.exports = {
	handleGist: handleGist
};
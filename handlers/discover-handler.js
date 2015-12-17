/**
 *	Copyright 2015, Brooks Mershon
 *
 *	Handle gist to be inserted, updated with tags, or otherwise modified in the database.
 */

var	promise = require('bluebird'),
    monitor = require('pg-monitor'),
    config = require("../config.json"),
    nlp = require("../lib/nlp/"),
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

function handleGist(gist, response){

	// add tags extracted from description and "known" tags
	var description = gist.description || "";
	var username = gist.username || "";
	var descriptionTags = (description.length) ? nlp.tags(gist.description) : [];
	var tags = gist.tags || [];
	var categories = gist.categories || [];
	tags = tags.concat(descriptionTags);

	if(description.length && username.length) {
		db.gist.addGist() // attempt to add new gist (might be duplicate)
		.catch(function(error) {
			// TODO
		})
		.finally(function() {
			db.tx(function(t) {
				return t.batch([
					db.gist.addTags(gist.gistid, tags),
					db.gist.addCategories(gist.gistid, categories)
				]);
			})
			.then(function() {
				response.json(JSON.stringify({success: true}));
			});
		});
	} else { // just add tags and categories
		db.tx(function(t) {
				return t.batch([
					db.gist.addTags(gist.gistid, tags),
					db.gist.addCategories(gist.gistid, categories)
				]);
		})
		.then(function() {
				response.json(JSON.stringify({success: true}));
		});
	}
	
};

module.exports = {
	handleGist: handleGist
};
#!/usr/bin/env node

/*
	Copyright 2015, Brooks Mershon
*/
var pg = require("pg"),
	config = require('../config.json'),
	SearchEngines = require('../lib/search/SearchEngines.js'),
	article = require('../article.js'),
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

	// tokenized input strings
	var annotatedPage = article.annotatePage(page);

	console.log(annocatedPage);

	var tagArray = [];

	tagArray = tagArray.concat(annotatedPage.title);
	tagArray = tagArray.concat(annotatedPage.aliases);
	tagArray = tagArray.concat(annotatedPage.see_also);
	tagArray = tagArray.concat([annotatedPage.categories]);

	// ensure each string array is unique, and not empty
	uniqueTagArray = _.unique(tagArray, function(t) { return t.join('');})
					 .filter(function(g) {return (g.length > 0);});

	try {
		db.search.hooks(uniqueTagArray).then(function(data){

		}).catch(function(error){

		})

	} catch(e) {
		return response.sendStatus(500);
	}
};

module.exports = {
	handlePage: handlePage
};
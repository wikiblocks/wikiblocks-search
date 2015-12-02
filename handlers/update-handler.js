/*
	Copyright 2015, Brooks Mershon

	Hanle gist to be inserted, updated with tags, or otherwise modified in the database.
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

/*
	Update a gist that was clicked in the search results.
*/
function handleResult(result, response){

    var gist = result.gist;
    var page = result.page;

    console.log(result);

    db.gist.addCategories(gist.gistid, page.categories)
        .then(function(data) {
            var categories = data.map(function(d) {return d.assigncategory});
            response.json(JSON.stringify({success: true, categories: added}));
        })
        .catch(function(error) {
            response.json(JSON.stringify({success: false, error: error}));
        });
};

module.exports = {
	handleResult: handleResult
};
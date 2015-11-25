/*
    (C) 2015, Brooks Mershon

    Before running tests, start with clean database and empty tables.
*/

var tape = require("tape"),
    fs = require("fs"),
    promise = require('bluebird'), // or any other Promise/A+ compatible library;
    monitor = require('pg-monitor'), // for debugging
    config = require("../config.json"),
    queries = require("./queries.json"),
    rawGists = require("./data/sample-gists-page.json"), // sample gist object from Github API call
    extensions = require("../lib/pgp-extensions/");

// ***** SAMPLE DATA *****
var gists = rawGists.map(function(d) {
    return {gistid: d.id, username: d.owner.login, description: d.description};
});

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

// ***** LOGGING *****
var wstream = fs.createWriteStream("logs/extend-test.log");

monitor.attach(options); // attach to all query events;
monitor.setTheme('matrix'); // change the default theme;

monitor.log = function(msg, info){
    wstream.write(msg + "\n");
};

var tags = ["lab", "color", "picker"];

// *** TESTS ***
tape("add new gist" + gists[2].gistid, function(test) {
    db.gist.addGist(gists[2])
        .catch(function (error) {
            test.notOk(error);
        })
        .finally(function(){
            test.end();
        });
});

tape("add tags " + JSON.stringify(tags) + " for gist " + gists[2].gistid, function(test) {
    db.gist.addTags(gists[2].gistid, tags)
        .catch(function(error) {
            test.notOk(error);
        })
        .finally(function() {
            test.end();
            pgp.end();
        });
});



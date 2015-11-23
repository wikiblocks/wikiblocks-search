/*
    (C) 2015, Brooks Mershon

    Before running tests, start with clean database and empty tables.
*/

var tape = require("tape"),
    fs = require("fs"),
    promise = require('bluebird'), // or any other Promise/A+ compatible library;
    monitor = require('pg-monitor'), // for debugging
    config = require("../config.json"),
    extensions = require("../lib/pg-extensions/");

// ***** Configuration and extensions
var options = {
    promiseLib: promise,
    extend: function (obj) {
        // obj = this;
        this.search = extensions.extendSearch(this);
    }
};

var pgp = require('pg-promise')(options);
var db = pgp(config); // database instance;

// ***** LOGGING *****
var wstream = fs.createWriteStream("logs/tags-test.log");

monitor.attach(options); // attach to all query events;
monitor.setTheme('matrix'); // change the default theme;

monitor.log = function(msg, info){
    wstream.write(msg + "\n");
};


var tags = ['convex', 'hull'];
// *** TESTS ***
tape("gists with tags" + tags, function(test) {
    db.search.hasTags(tags)
        .then(function(data) {
            console.log("gists", JSON.stringify(data,null,2));
        })
        .catch(function (error) {
            test.ok(data.length >= 1);
        })
        .finally(function(){
            test.end();
            pgp.end();
        });
});
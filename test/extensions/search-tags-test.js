/*
    (C) 2015, Brooks Mershon

    Before running tests, start with clean database and empty tables.
*/

var tape = require("tape"),
    fs = require("fs"),
    promise = require('bluebird'), // or any other Promise/A+ compatible library;
    monitor = require('pg-monitor'), // for debugging
    config = require("../../config.json"),
    extensions = require("../../lib/pgp-extensions/");

// ***** Configuration and extensions
var options = {
    promiseLib: promise,
    extend: function (obj) {
        this.gist = extensions.extendGist(this);
        this.search = extensions.extendSearch(this);
    }
};

var pgp = require('pg-promise')(options);
var db = pgp(config); // database instance;

// ***** LOGGING *****
var wstream = fs.createWriteStream("logs/search-tags-test.log");

monitor.attach(options); // attach to all query events;

monitor.log = function(msg, info){
    wstream.write(msg + "\n");
};

var tags = ['hilbert', 'curve'];

tape("exhaust tag generator for tags " + tags, function(test) {
    // iterator that asynchronously presents next best match on the given tags 
    // using a Promise object returned by next()
    var it = db.search.tags(tags);

    it.next().then(function lambda(result) {
        if(result.done) {
            test.end();
            pgp.end();
            return;
        } else {
            test.ok(result.value.tags.length, "gist " + result.value.gistid + " with " + result.value.tags + " " + result.value.frequencies);
            it.next().then(lambda);
        }
    });
});
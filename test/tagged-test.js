/*
    (C) 2015, Brooks Mershon

    Before running tests, start with clean database and empty tables.
*/

var tape = require("tape"),
    fs = require("fs"),
    promise = require('bluebird'), // or any other Promise/A+ compatible library;
    monitor = require('pg-monitor'), // for debugging
    config = require("../config.json"),
    extensions = require("../lib/pgp-extensions/");

// ***** Configuration and extensions
var options = {
    promiseLib: promise,
    extend: function (obj) {
        // obj = this;
        this.gist = extensions.extendGist(this);
        this.tagged = extensions.extendTagged();
    }
};

var pgp = require('pg-promise')(options);
var db = pgp(config); // database instance;

// ***** LOGGING *****
var wstream = fs.createWriteStream("logs/tagged-test.log");

monitor.attach(options); // attach to all query events;
monitor.setTheme('matrix'); // change the default theme;

monitor.log = function(msg, info){
    wstream.write(msg + "\n");
};

var tags = ['hilbert', 'curve'];
// *** TESTS ***
tape("db.gist.anyTags(tags) " + tags, function(test) {
    db.gist.anyTags(tags)
        .then(function(data) {
            test.ok(data.length >= 1);
        })
        .catch(function(error) {
            test.notOk(error);
        })
        .finally(function(){
            test.end();
        });
});

tape("exhaust tag generator for tags " + tags, function(test) {
    // iterator that asynchronously presents next best match on the given tags 
    // using a Promise object returned by next()
    var it = db.tagged(tags);

    it.next().then(function lambda(result) {
        if(result.done) {
            test.end();
            pgp.end();
            return;
        } else {
            test.ok(result.value.tags.length, "gist with " + result.value.tags);
            it.next().then(lambda);
        }
    });
});
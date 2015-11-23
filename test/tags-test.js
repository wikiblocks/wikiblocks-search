/*
    (C) 2015, Brooks Mershon

    Before running tests, start with clean database and empty tables.
*/

var tape = require("tape"),
    fs = require("fs"),
    promise = require('bluebird'), // or any other Promise/A+ compatible library;
    monitor = require('pg-monitor'), // for debugging
    config = require("../config.json"),
    extensions = require("../lib/pgp-extensions/"),
    tagIterator = require("../lib/search/tagIterator.js").iterator;

// ***** Configuration and extensions
var options = {
    promiseLib: promise,
    extend: function (obj) {
        // obj = this;
        this.gist = extensions.extendGist(this);
        this.tagIterator = tagIterator;
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


var tags = ['hilbert', 'curve'];
// *** TESTS ***
tape("gists with tags " + tags, function(test) {
    db.gist.withTags(tags)
        .then(function(data) {
            console.log("gists", JSON.stringify(data,null,2));
        })
        .catch(function (error) {
            test.ok(data.length >= 1);
        })
        .finally(function(){
            test.end();
        });
});

tape("exhaust hook iterator for tags " + tags, function(test) {
    var tagIterator = db.tagIterator(tags);

    tagIterator.next().then(function lambda(result) {
        if(result.done) {
            test.end();
            pgp.end();
            return;
        } else {
            console.log(result.value);
            tagIterator.next().then(lambda);
        }
    })
    
});
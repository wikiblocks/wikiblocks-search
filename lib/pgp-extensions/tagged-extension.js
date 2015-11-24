/*

    Copyright 2015, Brooks Mershon

    Extend pg-promise to expose a an generator function.

    Calling next() returns a Promise that should resolve to an object
    with properties {value, done}.

    The value (if not done) is the next "best" matched gist for the given tags.

    Promise objects support conenient error checking as well as asynchronous
    queries for more results.
*/

// helper parameterized query strings
var queries = require('./pgp-queries.js');

function extendTagged(obj) {
    return generator;
}

function generator(tags) {

    var db = this;

    // first result is the best, second is next best, ...
    var ready = null;

    function next() {
        if(ready)
            return new Promise(function(resolve) {
                resolve((ready.length) ? {value: ready.shift(), done: false} : {done: true});
            });
        else 
            return fetch().then(next);
    }

    // async query for gists with the given tags
    // sorted in descending order based on the number of matched tags
    function fetch() {
        return db.gist.anyTags(tags).then(function(data){
            // TODO sort data
            ready = data;
        });
    }
    
    return {
       next: next
    }
}


module.exports = {
    extension: extendTagged
}


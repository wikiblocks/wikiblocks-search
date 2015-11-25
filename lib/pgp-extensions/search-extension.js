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

function extendSearch(obj) {
    return {
        tags: tags_generator.bind(obj)
        //categories: categories_generator.bind(object);
    }
}

/**
 * Creates a new generator function which produces the next best match on the 
 * given tags until the generator is exhausted.
 * 
 * The next() method returns a "then-able" Promise which resolves to an object
 * with properties of value and done.
 * 
 * @param {string[]} tags - An array of tags to match
 */
function tags_generator(tags) {

    var db = this;

    var R = null;

    // returns a "thenable" Promise
    function next() {
        if(R) {
            var value = (R.length) ? {value: R.shift(), done: false} : {done: true};
            return Promise.resolve(value);
        } else {
            return fetch().then(next);
        }
    }

    // returns a "thenable" Promise 
    function fetch() {
        return db.gist.tags(tags).then(function(gists){
            // TODO sort data
            R = gists;
        });
    }
    
    return {
       next: next
    }
}

module.exports = {
    extension: extendSearch
}


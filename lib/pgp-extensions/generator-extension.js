/*

    Copyright 2015, Brooks Mershon

    Extend pg-promise to expose generator functions.
*/

// helper parameterized query strings
var queries = require('./pgp-queries.js');

function extendGenerator(obj) {
    return {
        tags: tags_generator.bind(obj)
        //categories: categories_generator.bind(object);
    }
}

/**
 * Creates a new generator function that produces the next best match on the 
 * given tags until the generator is exhausted.
 * 
 * The next() method returns a "then-able" Promise which resolves to an object
 * with properties of value and done.
 * 
 * @param {string[]} tags - An array of tags to match
 */
function tags_generator(tags) {

    var db = this;

    var R = [],
        limit = 5,
        offset = 0,
        last = limit;
        done = false;

    // returns a "thenable" Promise
    function next() {
        if(done)
            return Promise.resolve({done: true});
        else if(R.length)
            return Promise.resolve({value: R.shift(), done: false});
        else 
            return fetch().then(next);
    }

    // fetches next LIMIT results, skipping the OFFSET that we have already seen
    // returns a "thenable" Promise 
    function fetch() {

        // return dummy promise and avoid querying database
        if(last < limit) {
            done = true;
            return Promise.resolve({});
        }

        return db.gist.tags(tags, limit, offset).then(function(gists){
            if(gists.length) {
                R = gists;
                offset += gists.length;
                last = gists.length;
            }
            else {
                done = true;
            }
        });
    }
    
    return {
       next: next
    }
}

module.exports = {
    extension: extendGenerator
}


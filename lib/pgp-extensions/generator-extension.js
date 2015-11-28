/**
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
 * The next() method returns a "thenable" Promise which resolves to an object
 * with properties of "value" and "done".

 * When done is TRUE, the value property is not included.
 * 
 * @param {string[]} tags - An array of tags to match
 */
function tags_generator() {

    var that = this,
        default_offset = 0,
        limit = 5;

    function generator(tags) {

        var db = that;

        var R = [],
            offset = default_offset,
            last = limit,
            done = false;

        // see what next() would return
        function peek() {
            if(done)
                return Promise.resolve({done: true});
            else if(R.length)
                return Promise.resolve({value: R[0], done: false});
            else 
                return fetch().then(peek);
        }

        // returns a Promise that resolves to {value, done}
        function next() {
            if(done)
                return Promise.resolve({done: true});
            else if(R.length)
                return Promise.resolve({value: R.shift(), done: false});
            else 
                return fetch().then(next);
        }

        // returns Promise after fetching more results and setting internal
        // buffer to contain the <limit> results, starting at <offset>
        function fetch() {
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
            next: next,
            peek: peek
        }
    }

    // set or get size of internal buffer
    generator.limit = function(_) {
        if (!arguments.length) return limit;
        limit = _;
        return generator;
    };

    // set or get offset
    generator.offset = function(_) {
        if (!arguments.length) return offset;
        offset = _;
        return generator;
    };

    return generator;
}

module.exports = {
    extension: extendGenerator
}


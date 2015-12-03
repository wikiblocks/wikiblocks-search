/**
 *  Copyright 2015, Brooks Mershon
 *  
 *  Extend pg-promise to expose generator functions that return Promises (i.e. Bluebird, Promises/A+).
 *  
 *  "Query Generators" take arbitrary queries that may be parameterized with
 *  a text parameter, as well as an optional limit and offset.
 *  
 *  The provided query is used when a fetch is needed to bring more results
 *  from the database, and the arguments it is provided include the given
 *  text parameter and a limit offset pair.
 *  
 *  The generator's purpose is to act like a cursor into the potentially large number of results
 *  that might result from a query.
 */

// parameterized query strings
var queries = require('./pgp-queries.js');

// graft extension onto a db instance. The function becomes available on a
// namespace created for the extension (e.g., db.generator).
function extendGenerator(obj) {
    return query_generator;
}

/**
 * Creates a new generator function that produces the next best match on the 
 * given tags until the generator is exhausted.
 * 
 * The next() method returns a "thenable" Promise which resolves to an object
 * with properties of "value" and "done".
 *
 * When done is TRUE, the value property is not included.
 * 
 * @param {string[]} tags - An array of tags to match
 */
function query_generator() {

    var that = this,
        myQuery = null;
        default_offset = 0,
        limit = 5;

    // text parameter for queries
    function generator(text) {

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
            return myQuery(text, limit, offset).then(function(rows){
                if(rows.length) {
                    R = rows;
                    offset += rows.length;
                    last = rows.length;
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

    // modify type of generator
    generator.query = function(q) {
        if (!arguments.length) return myQuery;
        myQuery = q;
        return generator;
    };

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


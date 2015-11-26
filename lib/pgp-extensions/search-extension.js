/*

    Copyright 2015, Brooks Mershon

    Extend pg-promise to expose generator functions.
*/

// parameterized query strings to be used with pg-promise
var queries = require('./pgp-queries.js'),
    rank = require("../search/rank.js"),
    d3 = require('d3-arrays'),
    annotate = require('../annotate.js');

function extendSearch(obj) {
    return {
        wiki: wiki.bind(obj)
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
function wiki(article, limit, offset) {

    var db = this;

    var results = d3.map(),
        count = 0;

    var annotatedArticle = annotate.article(article);
    var hooks = annotate.hooks(annotatedArticle);

    var generators = hooks.map(function(d, i) {
        var generator = db.generator.tags();
        var tagged = generator(d.value);
        return {content: d.value, index: i, type: d.type, weight: rank.weight(d.type), generator: tagged, done: false};
    });

    function getCount() {
        return db.gist.count().then(function(result){
            count = result.count;
            return null;
        });
    }

    function promises(gens){
        var nextPromises = gens.map(function(d) {
            return d.generator.next();
        });

        console.log(nextPromises);
        return nextPromises;
    }

    function getResults(){

        return Promise.all(promises(generators)).then(function iterate(values) {

            var gists = [];

            var n = 0;
            for (var i = 0; i < values.length; i++) {

                var v = values[i];

                if(!v.done){
                    var g = v.value;
                    g.weight = generators[i].weight;
                    g.count = count;
                    g.tags = rank.annotatedTags(g);
                    g.score = rank.score(g);
                    results.set(g.gistid, g);
                    n++;
                }
            }

            if(n > 0) {
                return Promise.all(promises(generators)).then(iterate);
            } else {
                return new Promise(function(resolve, reject) {
                    resolve(results.values().sort(rank.sort));
                });
            }
        });
    }

    console.log(hooks);
    return getCount().then(getResults);

}

module.exports = {
    extension: extendSearch
}
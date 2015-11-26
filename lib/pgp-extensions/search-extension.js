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

    var results = [],
        count = 0,
        idSet = d3.set();

    var annotatedArticle = annotate.article(article);
    var hooks = annotate.hooks(annotatedArticle);

    var generators = hooks.map(function(d) {
        var g = db.generator.tags(d.value);
        return {weight: rank.weight(d.type), generator: g};
    });

    var nexts = generators.map(function(d) {
        return d.generator.next();
    });

    console.log(hooks);

    return getCount().then(getResults);

    function getCount() {
        return db.gist.count().then(function(result){
            count = result.count;
            return Promise.resolve({});
        });
    }

    function getResults (){
        return Promise.all(nexts).then(function getNexts(values) {

            var gists = [];

            for(var i = 0; i < values.length; i++) {

                var v = values[i];

                if(!v.done && !idSet.has(v.value.gistid)){

                    var g = v.value;
                    g.weight = generators[i].weight;
                    g.count = count;
                    g.tags = rank.annotatedTags(g);
                    g.score = rank.score(g);
                    gists.push(g);

                    idSet.add(g.gistid);
                }
            }

            sorted = gists.sort(rank.sort);
            
            results = results.concat(sorted);

            return new Promise(function(resolve, reject) {
                resolve(results);
            });

        });
    }
}

module.exports = {
    extension: extendSearch
}
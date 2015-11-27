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

    var gists = d3.map(),
        count = 0;

    var annotatedArticle = annotate.article(article);
    var hooks = annotate.hooks(annotatedArticle);

    var generators = hooks.map(function(d, i) {
        var tags = d.value;
        var generator = db.generator.tags()
                            .limit(5);
        return {
            hook: tags,
            type: d.type,
            weight: rank.weight(d.type),
            generator: generator(tags),
            done: false
        };
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

        return nextPromises;
    }

    function getResults(){

        return Promise.all(promises(generators)).then(function iterate(values) {

            var found = 0;
            for (var i = 0; i < values.length; i++) {

                var v = values[i];

                if(!v.done){
                    var g = v.value;
                    g.weight = generators[i].weight;
                    g.hook = generators[i].hook;
                    g.type = generators[i].type;
                    g.count = count;
                    g.tags = rank.annotatedTags(g);
                    g.score = rank.score(g);

                    if(!gists.has(g.gistid) || gists.get(g.gistid).score < g.score) {
                        gists.set(g.gistid, g);
                    }

                    found++;
                }
            }

            if(gists.size() < limit && found > 0) {
                return Promise.all(promises(generators)).then(iterate);
            } else {
                return new Promise(function(resolve, reject) {
                    var results = gists.values().sort(rank.sort).filter(function(d) {
                        // TODO
                        return true;
                    }).slice(offset);
                    resolve(results);
                });
            }
        });
    }
    return getCount().then(getResults);
}

module.exports = {
    extension: extendSearch
}
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
        threshold = .2,
        count = 0;

    var annotatedArticle = annotate.article(article);
    var hooks = annotate.hooks(annotatedArticle).map(function(d, i) {
        var tags = d.value;
        var generator = db.generator.tags().limit(5);

        return {
            tokens: tags,
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

    function peek(generator){
        return generator.peek();
    }

    function next(generator) {
        return generator.next();
    }

    function getGenerators(hooks) {
        return hooks.map(function(d) {
            return d.generator;
        });
    }

    function goodEnough(gist) {
        return gist.score > threshold;
    }

    function getResults(){

        var generators = getGenerators(hooks);

        return Promise.all(generators.map(peek)).then(function iterate(values) {

            var max = 0,
                used = -1,
                found = 0;

            for (var i = 0; i < values.length; i++) {

                var v = values[i];

                if(!v.done){
                    var g = v.value;
                    g.weight = hooks[i].weight;
                    g.tokens = hooks[i].tokens;
                    g.type = hooks[i].type;
                    g.count = count;
                    g.tags = rank.annotatedTags(g);
                    g.score = rank.score(g);

                    if(g.score > max) {
                        used = i;
                        max = g.score;
                    }

                    found += 1;
                }
            }

            if(found > 0) {
                var best = values[used].value;
                if(!gists.has(best.gistid) || (gists.has(best.gistid) && gists.get(best.gistid).score < best.score)) {
                    gists.set(best.gistid, best);
                }
            }

            if(gists.size() <= limit && found > 0) {
                return generators[used].next().then(function() {
                    return Promise.all(generators.map(peek)).then(iterate);
                })
            } else {
                return new Promise(function(resolve, reject) {
                    var results = gists.values()
                                        .sort(rank.sort)
                                        .filter(goodEnough)
                                        .slice(offset);
                    resolve(results);
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
/**
 *  Copyright 2015, Brooks Mershon
 *
 *  Main search algorithm which evaluates generators created from hooks in a Wikipedia article.
 */

var nlp = require('../nlp/'),
    rank = require('./rank.js'),
    d3 = require('d3-arrays');

function annotate(page) {
    var annotatedPage = {};
    for(property in page) {
        if(page.hasOwnProperty(property)) {
            if(property == 'categories') {
                annotatedPage[property] = page[property];
            } else {
                var strings = (Array.isArray(page[property])) ? page[property] : [page[property]];
                annotatedPage[property] = strings.map(function(d) {
                    return nlp.tags(d.toLowerCase());
                });
            }
        }
    }

    return annotatedPage;
}

// flatten article into array of hooks with property type, value
// type is {title, see also, aliases, categories}
// value is an array of tokens - either tags or categories
function hookify(article) {
    var hooks = [];
    for(property in article) {
        if(article.hasOwnProperty(property)) {
            if(property == 'categories') {
                hooks.push({type: type(property), tokens: article[property]});
            } else {
                var hookArray = article[property];
                hookArray.forEach(function(d) {
                    hooks.push({type: type(property), tokens: d});
                });
            }
        }
    }

    return hooks;
}

function type(t) {
    var T = {
        "categories": "category",
        "aliases": "alias"
    } 
    return (T[t]) ? T[t] : t;
}

/**
 * Creates a new generator function that produces the next best match on the 
 * given tags until the generator is exhausted.
 * 
 * The next() method returns a "then-able" Promise which resolves to an object
 * with properties of value and done.
 * 
 * @param {string[]} tags - An array of tags to match
 *
 * This function is bound to the pg-promise database connection in order
 * to provide access to other pg-promise extensions.
 */
function wiki(article, limit, offset) {

    var db = this;

    var gists = d3.map(),
        threshold = .4,
        count = 0;

    var annotatedArticle = annotate(article);

    var hooks = hookify(annotatedArticle).map(function(d, i) {
        var tokens = d.tokens;
        var generator = (d.type == 'category')
                        ? db.generator().query(db.gist.categories)
                        : db.generator().query(db.gist.tags);

        generator.limit(5);

        return {
            tokens: tokens,
            type: d.type,
            weight: rank.weight(d.type),
            generator: (d.type == 'category') 
                        ? generator("\'" + tokens.join("\',\'") + "\'") // exact match
                        : generator("\'" + tokens.join(" | ") + "\'"), // text search
            done: false
        };
    }).filter(function(d) {
        return d.tokens.length > 0;
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

    function getGenerators(hooks) {
        return hooks.map(function(d) {
            return d.generator;
        });
    }

    function goodEnough(gist) {
        return gist.score > threshold;
    }

    // Return a promise that resolves with an array of the best k results, where k = limit.
    function getResults(){

        var generators = getGenerators(hooks);

        return Promise.all(generators.map(peek)).then(function iterate(values) {

            var copies = values.map(function(d) {
                return (d.done) ? null : Object.assign({}, d.value);
            });

            var max = -1,
                chosen = -1,
                best = null;
                found = 0;

            for (var i = 0; i < copies.length; i++) {

                var g = copies[i];

                if(g) {
                    g.type = hooks[i].type;
                    g.count = count;
                    g.weight = hooks[i].weight;
                    g.tokens = hooks[i].tokens;

                    if(g.type == 'category') {
                        g.tags = [];
                        g.matches = rank.annotatedMatches(g);
                        g.score = g.weight;

                    } else {
                        g.categories = [];
                        g.matches = rank.annotatedMatches(g);
                        g.score = rank.score(g);
                    }

                    if(g.score >= max) {
                        chosen = i;
                        max = g.score;
                        best = g;
                    }

                    found += 1;
                }
            }

            // add better gist to results if its score is an improvement
            if(found > 0) {
                if(!gists.has(best.gistid) || (gists.has(best.gistid) && gists.get(best.gistid).score < best.score)) {
                    gists.set(best.gistid, best);
                }
            }

            if(gists.size() <= limit && found > 0) {
                return generators[chosen].next().then(function() {
                    return Promise.all(generators.map(peek)).then(iterate);
                })
            } else {
                var results = gists.values()
                                    .sort(rank.sort)
                                    .filter(goodEnough)
                                    .slice(offset);

                return Promise.resolve(results);
            }
        });
    }
    // query for the number of gists in the database, then get the results
    return getCount().then(getResults);
}

module.exports = wiki;
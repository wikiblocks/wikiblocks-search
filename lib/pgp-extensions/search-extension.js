/*

    Copyright 2015, Brooks Mershon

    Extend pg-promise to expose generator functions.
*/

// helper parameterized query strings
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

    var results = [];
    var idSet = d3.set();

    if(!article.title) {
        return res.sendStatus(400);
    }
    var annotatedArticle = annotate.article(article);
    var hooks = annotate.hooks(annotatedArticle);

    var generators = hooks.map(function(d) {
        var g = db.generator.tags(d.value);
        return {weight: rank.type(d.type), generator: g};
    });

    var promises = generators.map(function(d) {
        return d.generator.next();
    });

    console.log(hooks);

    Promise.all(promises).then(function performRound(values) {

        console.log(values);

        var gists = [];

        values.forEach(function(d) {
            if(!value.done)
                gists.push(d.value);
        });
        console.log(gists);


        // gists.map(function(d){
        //     d.rank = rank.gist(d);
        // })

        gists.forEach(function(d) {
            if(!idSet.has(d.gistid)) {
                idSet.push(d.gistid);
                results.push(d);
            }
        });

    });

    return Promise.resolve(results);

}

module.exports = {
    extension: extendSearch
}


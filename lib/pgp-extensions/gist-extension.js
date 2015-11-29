/*
    Extend pg-promise to expose
*/

var queries = require('./pgp-queries.js'),
    pgp = require('pg-promise');

function extendGist(obj) {
    return {
        addGist: function (gist) {
            return obj.none(queries.addGist, gist);
        },
        addTags: function(gistid, tags) {
            return  obj.tx(gistid, function (t) {
                        var Q = [];

                        tags.forEach(function(tag) {
                            var q = t.one(queries.assignTag, [gistid, tag]);
                            Q.push(q);
                        });

                        return this.batch(Q);
                    });
        },
        addCategories: function(){
            // TODO
        },
        tags: function(text, limit, offset) {
            return obj.any(queries.orderedTagsMatch, [text, limit, offset]);
        },
        categories: function(text, limit, offset) {
            return obj.any(queries.orderedCategoriesMatch, [text, limit, offset]);
        },
        count: function() {
            return obj.one(queries.countGists);
        }
    }
}

module.exports = {
    extension: extendGist
}


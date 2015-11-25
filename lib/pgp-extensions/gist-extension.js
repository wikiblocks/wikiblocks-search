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
        tags: function(tags, limit, offset) {
            return obj.any(queries.orderedTagsMatch, [pgp.as.csv(tags), limit, offset]);
        },
        categories: function(categories, limit, offset) {
            return obj.any(queries.hasTags, pgp.as.csv(tags));
        }
    }
}

module.exports = {
    extension: extendGist
}


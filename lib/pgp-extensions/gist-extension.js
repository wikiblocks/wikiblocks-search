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
        tags: function(tags) {
            return obj.any(queries.gistWithTags, pgp.as.csv(tags));
        },
        categories: function(categories) {
            return obj.any(queries.hasTags, pgp.as.csv(tags));
        }
    }
}

module.exports = {
    extension: extendGist
}


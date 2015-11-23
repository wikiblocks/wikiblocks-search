/*
    Extend pg-promise to expose
*/

var queries = require('./pgp-queries.js')
    pgp = require('pg-promise');

function extendGist(obj) {
    return {
        addGist: function (gist) {
            return obj.none("INSERT INTO Gist(gistid, username, description) VALUES(${gistid}, ${username}, ${description})", gist);
        },
        addTags: function(gistid, tags) {
            return obj.tx(gistid, function (t) {
                        var Q = [];

                        tags.forEach(function(tag) {
                            var q = t.one("SELECT assignTag($1, $2)", [gistid, tag]);
                            Q.push(q);
                        });

                        return this.batch(Q);
                    })
        },
        addCategories: function(){
            // TODO
        },
        withTags: function(tags) {
            return obj.any(queries.gistWithTags, pgp.as.csv(tags));
        },
        withCategories: function(categories) {
            return obj.any(queries.hasTags, pgp.as.csv(tags));
        }
    }
}

module.exports = {
    extension: extendGist
}


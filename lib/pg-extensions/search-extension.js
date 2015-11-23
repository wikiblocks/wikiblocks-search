/*
    Extend pg-promise to expose methods for finding gists with tags, categories
*/

var queries = require('./pgp-queries.js'),
    pgp = require('pg-promise');

function extendSearch(obj) {
    return {
        hasTags: function (tags) {
            return obj.any(queries.hasTags, pgp.as.csv(tags));
        }
    }
}

module.exports = {
    extension: extendSearch
}


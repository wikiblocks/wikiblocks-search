/*
    Extend pg-promise to expose methods for finding gists with tags, categories
*/

var queries = require('./pgp-queries.js'),
    pgp = require('pg-promise'),
    article = require('../article.js'),
	nlp = require('../nlp.js'),
	_ = require('lodash'),
	queries = require('./queries.js');

function extendSearch(obj) {
    return {
        hooks: hooks;
    }
}

function hooks(arr) {
	
}

module.exports = {
    extension: extendSearch
}


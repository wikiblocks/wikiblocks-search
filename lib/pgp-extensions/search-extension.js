/*
    Copyright 2015, Brooks Mershon

    Extend pg-promise to expose a search algorithm that uses generator 
    functions to find the best results given a page object, a limit, and an offset.
*/

// parameterized query strings to be used with pg-promise
var search = require('../search/');

function extendSearch(obj) {
    return {
        wiki: search.wiki.bind(obj)
    }
}

module.exports = {
    extension: extendSearch
}
/*
	Tools for extracting tags from text (descriptions, README's),
    cleaning tags, stripping punctuation, and matching.
*/


/*
    Returns words striped of punctuation from input string.
    Split on several types of delimeters, including spaces, hyphens, and colons.
*/
var natural = require('natural');
    stopwords = require('./stopwords.js');

var tokenizer = new natural.WordPunctTokenizer();

var NGrams = natural.NGrams;

var exclusions = stopwords.words;

function _extract(text) {
    var preTags = tokenizer.tokenize(text.toLowerCase());
    var tags = preTags.filter(function(t) {
        return exclusions.indexOf(t) < 0;
    });
    return tags;
}

function _nGrams(array, n) {
    return NGrams.ngrams(array, n);
}

module.exports = {
    extract: _extract,
    nGrams: _nGrams
};

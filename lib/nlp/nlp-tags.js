var natural = require('natural');
    stopwords = require('./stopwords.js');

var tokenizer = new natural.WordPunctTokenizer();

var exclusions = stopwords.words;

function tags(text) {
    var preTags = tokenizer.tokenize(text.toLowerCase());
    var tags = preTags.filter(function(t) {
        return exclusions.indexOf(t) < 0;
    });
    return tags;
}

module.exports = tags;

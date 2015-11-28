var natural = require('natural');
    stopwords = require('./stopwords.js');

var tokenizer = new natural.RegexpTokenizer({pattern: /[^-\u2013\u2014a-zA-Z0-9]/g});

var exclusions = stopwords.words;

function tags(text) {
    var preTags = tokenizer.tokenize(text.toLowerCase());
    var tags = preTags.filter(function(t) {
        return exclusions.indexOf(t) < 0;
    });
    return tags;
}

module.exports = tags;

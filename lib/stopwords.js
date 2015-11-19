/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// a list of commonly used words that have little meaning and can be excluded
// from analysis.
var words = [
    '\u2013', '\u2014',
    'about', 'after', 'all', 'also', 'am', 'an', 'and', 'another', 'any', 'are', 'as', 'at', 'be',
    'because', 'been', 'before', 'being', 'between', 'both', 'but', 'by', 'came', 'can',
    'come', 'could', 'did', 'do', 'each', 'for', 'from', 'get', 'got', 'has', 'had',
    'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how', 'if', 'in', 'into',
    'is', 'it', 'like', 'make', 'many', 'me', 'might', 'more', 'most', 'much', 'must',
    'my', 'never', 'now', 'of', 'on', 'only', 'or', 'other', 'our', 'out', 'over',
    'said', 'same', 'see', 'should', 'since', 'some', 'still', 'such', 'take', 'than',
    'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those',
    'through', 'to', 'too', 'under', 'up', 'very', 'was', 'way', 'we', 'well', 'were',
    'what', 'where', 'which', 'while', 'who', 'with', 'would', 'you', 'your',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '$', '1',
    '2', '3', '4', '5', '6', '7', '8', '9', '0', '_', 'ii', 'iii', 'iv', 'vi', "a", 
    "about", "above", "above", "across", "after", "afterwards", "again", "against", 
    "all", "almost", "alone", "along", "already", "also","although","always","am","among", 
    "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything",
    "anyway", "anywhere", "are", "around", "as",  "at", "back","be","became", "because","become",
    "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", 
    "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", 
    "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", 
    "due", "during", "each", "eg", "eight", "either", "eleven","else", "elsewhere", "empty", "enough", 
    "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", 
    "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", 
    "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", 
    "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", 
    "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", 
    "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", 
    "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", 
    "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", 
    "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", 
    "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", 
    "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", 
    "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", 
    "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", 
    "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", 
    "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those", "though", "three", 
    "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", 
    "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", 
    "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", 
    "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose",
     "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the"
];
    
// tell the world about the noise words.    
module.exports = {
    words: words
}


var nlp = require('../nlp.js');

// the db will alredy have grafted-on extensions
function tagIterator(tags){
	var db = this;

    var ready = [];

    var i = tags.length;

    function next() {
    	if(ready.length) {
    		return {value: ready.pop(), done: false};
    	}

    	fetch(i--);
    }

    function fetch(i) {

    	var grams = nlp.tag.NGrams(tags)
    	promise = db.search.hasTags(tags)
    				.then(function(data){
    					ready = data;
    				})

    	return promise;
    }
    
    return {
       next: next
    }
}
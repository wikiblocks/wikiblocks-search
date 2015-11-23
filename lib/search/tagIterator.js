/*
	Copyright 2015, Brooks Mershon

	The iterator has a next() function that returns a promise object.

	The promise resolves with value, done object.
*/

var nlp = require('../nlp.js');

// takes in an array represented the tokens from a hook to be processed
function tagIterator(tags){
	var db = this;

    var ready = null;

    function next() {
    	if(ready) {
    		return new Promise(function(resolve) {
    			var value = (ready.length) ?
			                {value: ready.shift(), done: false} :
			                {done: true};
    			resolve(value);
    		});
    	} else {
    		return fetch()
		    		.then(function() {
						return {value: ready.shift(), done: false}
					});
    	}
    }

    function fetch() {
    	return db.gist.withTags(tags)
		    	.then(function(data){
		    		ready = data;
		    	});
    }
    
    return {
       next: next
    }
}

module.exports = {
	iterator: tagIterator
}
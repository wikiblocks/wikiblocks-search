var	d3 = require('d3-arrays');

function weight(type) {
	var f = {
		"title": 1,
		"alias": .9,
		"see_also": .5,
		"category": .1,
	} 
	return (f[type]) ? f[type] : 0;
}

// returns score used for ordering results
// use properties of gist
function score(g) {
	return idfSum(g) * g.weight;
}

function annotatedTags(g) {
	var annotatedTags = g.tags.map(function(t) {
		var index = g.frequencies.indexOf(t);
		var f = g.frequencies[index];
		return {tag: t, idf: Math.log(g.count/f)};
	});

	return annotatedTags;
}

function idfSum(g) {
	return d3.sum(g.tags, function(t) {return t.idf});
}

// comparator function returns {-1, 0, 1}
function sort(a, b) {
	return -(a.score - b.score);
}

module.exports = {
	weight: weight,
	score: score,
	annotatedTags: annotatedTags
}
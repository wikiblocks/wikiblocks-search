/**
 *	Copyright 2015, Brooks Mershon
 */

var	d3 = require('d3-arrays');

function weight(type) {
	var f = {
		"title": 1,
		"alias": .9,
		"see_also": .7,
		"category": .5,
	} 
	return (f[type]) ? f[type] : 0;
}

// returns score used for ordering results
// use properties of gist
function score(g) {
	return idfNorm(g) * g.weight * (1 / Math.pow((g.tokens.length - g.matches.length + 1), 2));
}

function annotatedMatches(g) {
	var tags = g.tags.map(function(t, i) {
		var f = g.frequencies[i];
		return {type: g.type, value: t, idf: Math.log((g.count)/f)};
	});

	var categories = g.categories.map(function(t, i) {
		var f = g.frequencies[i];
		return {type: g.type, value: t, idf: Math.log((g.count)/f)};
	});

	return tags.concat(categories);
}

function idfNorm(g) {
	return d3.sum(g.matches, function(t) {return Math.pow(t.idf, 1)}) / (Math.pow(Math.log(g.count), 1) * g.matches.length);
}

// comparator function returns {-1, 0, 1}
function sort(a, b) {
	return -(a.score - b.score);
}

module.exports = {
	weight: weight,
	score: score,
	annotatedMatches: annotatedMatches,
	sort: sort
}
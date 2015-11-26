var	d3 = require('d3-arrays');

function type(type) {
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
function gist(g) {
	return d3.sum(g.tags, function(t) {return t.idf}) * g.r;
}

module.exports = {
	type: type,
	gist: gist
}
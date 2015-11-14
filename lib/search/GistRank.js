var	d3 = require('d3-arrays');

/*
	returns -1, 0, or 1
*/
function rankComparator(a, b) {
	return -(a.score - b.score);
}

// returns score used for ordering results
// use properties of gist
function score(g) {
	if(g.categories) return -1; // bottom of search results
	return Math.log(g.count/d3.sum(g.docfreqs)) * g.r;
}

module.exports = {
	rankComparator: rankComparator,
	score: score
}
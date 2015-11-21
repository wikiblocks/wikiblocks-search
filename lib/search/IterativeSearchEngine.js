/*
	Copyright 2015, Brooks Mershon
*/

var	d3 = require('d3-arrays'),
	article = require('../article.js'),
	nlp = require('../nlp.js'),
	_ = require('lodash'),
	queries = require('./queries.js');
	GistRank = require('./GistRank.js')

d3.scale = require('d3-scale');

function Engine(client) {

	var RESULTS_LIMIT = 10,
		NGRAM_LIMIT = 2; // limit to ngrams, unless there are fewer than n tokens

	function getPageResults(page, callback) {

		// tokenized input strings
		var annotatedPage = article.annotatePage(page);

		var tagArray = [];

		tagArray = tagArray.concat(annotatedPage.title);
		tagArray = tagArray.concat(annotatedPage.aliases);
		tagArray = tagArray.concat(annotatedPage.see_also);
		tagArray = tagArray.concat([annotatedPage.categories]);

		// ensure each string array is unique, and not empty
		uniqueTagArray = _.unique(tagArray, function(t) { return t.join('');})
						 .filter(function(g) {return (g.length > 0);});

		processAllHooks(uniqueTagArray, function(error, gists) {
			if (error) {
				callback(error);
				return;
			}
			var allTags = uniqueTagArray.reduce(function(a, b) {
				return a.concat(b);
			});
			var uniqueTags = _.unique(allTags);

			queries.queryGistCount.call(client, function(error, result) {
				var count = result.rows[0].count;
				getAllFrequencies(uniqueTags, function(error, frequencies) {

					// record frequencies of matched tags all gists
					gists.forEach(function(d) {
						if(d.tags) {
							d.tags = d.tags.map(function(t) {
								var index = uniqueTags.indexOf(t);
								var f = frequencies[index];
								return {tag: t, idf: Math.log(count/f)};
							});
						}
					})
					// score the results
					gists.map(function(d) {
						d.score = GistRank.score(d);
					});
					// sort the results
					gists.sort(GistRank.rankComparator);

					// no error; return gists
					callback(null, gists);
				});
			});
		});
	}

	/*
		Takes in an ordered array of tag-arrays. Each Tag Array comes from a tokenized String,
		such as the title, an alias, a see_also link, or a category.
	*/
	function processAllHooks(hooks, callback) {
		var tagArray = hooks.slice(0, -1);
		var categories = hooks.slice(-1)[0];
		var unsortedGists = [];
		var unsortedSet = d3.set();

		getStratifiedMatchesOnTags(tagArray.shift(), function gotMatches(error, gists) {
			if(error) {
				callback(error, []);
				return [];
			}
			gists.forEach(function(d) {
				if(!unsortedSet.has(d.gistid)) {
					unsortedSet.add(d.gistid);
					unsortedGists.push(d);
				}
			});
			if(tagArray.length) {
				getStratifiedMatchesOnTags(tagArray.shift(), gotMatches);
			} else {
				if(unsortedGists.length < RESULTS_LIMIT) {
					getStratifiedMatchesOnCategories(categories, function gotCategoryMatches(error, gists) {
						gists.forEach(function(d) {
							if(!unsortedSet.has(d.gistid)) {
								unsortedSet.add(d.gistid);
								unsortedGists.push(d);
							}
						});
						callback(null, unsortedGists);
					})
				} else {
					callback(null, unsortedGists);
				}
			}
		});
	}

	/*
		Match on tags using iterative approach. callback function called with error, results
		either at least RESULTS_LIMIT gists have been found, or all iterations on title tags have completed.
	*/
	function getStratifiedMatchesOnTags(tags, callback){
		var n = tags.length;
		var r = tags.length;

		var allMatches = [];
		var allGistSet = d3.set();

		getNGramMatches(tags, r, function partiallyMatched(error, gists) {
			if(error) callback(error, null);
			gists.forEach(function(d) {
				if(!allGistSet.has(d.gistid)) {
					allGistSet.add(d.gistid);
					d.r = r;
					allMatches.push(d);
				}
			});
			if(r == 1 || r == Math.min(NGRAM_LIMIT, n) || allMatches.length >= RESULTS_LIMIT) {
				callback(null, allMatches);
			} else {
				getNGramMatches(tags, --r, partiallyMatched);
			}
		})
	}

	/*
		Match on r-grams of tags
	*/
	function getNGramMatches(tags, r, callback) {
		var matches = [];
		var gistSet = d3.set(); // use set.size() to track how how many results we have
		var lastCombo;
		nlp.tag.nGrams(tags, r, function(combos) {
			queries.queryMatchesAllTags.call(client, lastCombo = combos.pop(), function matched(error, result) {
				if(error) callback(error, null);
				var gists = result.rows;
				gists.forEach(function(d) {
					if(!gistSet.has(d.gistid)) {
						gistSet.add(d.gistid);
						d.tags = lastCombo;
						d.timestamp = Date.now();
						d.r = r;
						matches.push(d);
					}
				});
				if(combos.length) {
					queries.queryMatchesAllTags.call(client, lastCombo = combos.pop(), matched);
				} else {
					callback(null, matches);
				}
			})
		})
	}

	/*
		Match on categories. Currently matches on first category for which gist has this category.

		Currently DOES NOT abort on results limit.
	*/
	function getStratifiedMatchesOnCategories(categories, callback){

		var categories = categories;

		var matches = [];
		var gistSet = d3.set();

		var last;

		queries.queryMatchesAllCategories.call(client, last = [categories.pop()], function matched(error, result) {
			
			if(error) callback(error, null);
			var gists = result.rows;

			gists.forEach(function(d) {
				if(!gistSet.has(d.gistid)) {
					gistSet.add(d.gistid);
					d.timestamp = Date.now();
					d.categories = last;
					matches.push(d);
				}
			});

			if(categories.length) {
				queries.queryMatchesAllCategories.call(client, last = [categories.pop()], matched);
			} else {
				callback(null, matches);
			}
		})
	}

	function getAllFrequencies(_tags, callback) {
		var tags = _tags.slice();

		var frequencies = [];
		queries.queryFrequency.call(client, tags.shift(), function counted(error, result) {
			if(error) callback(error, null);
			var docfreq = result.rows[0].docfreq;
			frequencies.push(docfreq);
			if(tags.length) {
				queries.queryFrequency.call(client, tags.shift(), counted);
			} else {
				callback(error, frequencies);
			}
		})
	}

	// public method
	this.getPageResults = getPageResults;
}

module.exports = {
	Engine: Engine
}
var nlp = require('./nlp.js');

function article(page) {
	var annotatedPage = {};
	for(property in page) {
		if(page.hasOwnProperty(property)) {
			if(property == 'categories') {
				var strings = page[property];
				annotatedPage[property] = strings.map(function(d) {
					return d.split(' ').join('-').toLowerCase();
				});
			} else {
				var strings = (Array.isArray(page[property])) ? page[property] : [page[property]];
				annotatedPage[property] = strings.map(function(d) {
					return nlp.tag.extract(d.toLowerCase());
				});
			}
		}
	}

	return annotatedPage;
}


// flatten article into array of hooks with property type, value
// type is {title, see also, aliases, categories}
// value is an array of tokens - either tags or categories
function hooks(article) {
	var hooks = [];
	for(property in article) {
		if(article.hasOwnProperty(property)) {
			var hookArray = article[property];
			hookArray.forEach(function(d) {
				hooks.push({type: type(property), value: d});
			});
		}
	}

	return hooks;
}

function type(t) {
	var T = {
		"categories": "category",
		"aliases": "alias"
	} 
	return (T[t]) ? T[t] : t;
}

module.exports = {
	article: article,
	hooks: hooks
};
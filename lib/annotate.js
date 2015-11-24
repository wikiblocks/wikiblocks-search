var nlp = require('./nlp.js');

function annotatePage(page) {
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

module.exports = annotatePage;
var	psql = require('../psql.js');

/*
	Match on all tags. Currently using psql INTERSECT.

	The function is intended to be called like so:

	queryMatchesAllTags.call(<active client>, <query string>, <callback>);

	The this context is therefore an active pg client
*/
function queryMatchesAllTags(tags, callback){
	
	var fullQuery = "";
    for(var i = 0; i < tags.length; i++){
	    var inner = "(SELECT DISTINCT gist.gistid, gist.username, gist.description FROM gist, Tag_Gist, tag ";
	    var whereClause = "WHERE gist.gistid = Tag_Gist.gistid ";
	    whereClause = whereClause.concat("AND Tag_Gist.tagid = tag.tagid AND ( ");
		whereClause = whereClause.concat("LOWER(tag.tag) = LOWER('" + tags[i] + "') "); // tags already lowercase
		whereClause = whereClause.concat("))");
	    var fullQuery = fullQuery.concat(inner.concat(whereClause));

	    if(i < tags.length - 1) {
	    	fullQuery = fullQuery.concat(" INTERSECT ");
	    }
    }

    // The this context is the client object. psql.query takes two parameters, string and callback
    psql.query.call(this, fullQuery, callback);
}

/*
	Match on all tags. Currently using psql INTERSECT.
*/
function queryMatchesAllCategories(categories, callback){

	var fullQuery = "";
    for(var i = 0; i < categories.length; i++){
	    var inner = "(SELECT DISTINCT gist.gistid, gist.username, gist.description FROM gist, Category_Gist, Category ";
	    var whereClause = "WHERE gist.gistid = Category_Gist.gistid ";
	    whereClause = whereClause.concat("AND Category_Gist.categoryid = Category.categoryid AND ( ");
		whereClause = whereClause.concat("LOWER(Category.category) = LOWER('" + categories[i] + "') "); // tags already lowercase
		whereClause = whereClause.concat("))");
	    var fullQuery = fullQuery.concat(inner.concat(whereClause));

	    if(i < categories.length - 1) {
	    	fullQuery = fullQuery.concat(" INTERSECT ");
	    }
    }
    
    // The this context is the client object. psql.query takes two parameters, string and callback
    psql.query.call(this, fullQuery, callback);
}

/*
	Get the document frequency for a tag: the number of times this tag is associated with some gist.
*/
function queryFrequency(tag, callback) {
	var fullQuery = "";
	var inner = "(SELECT COUNT(*) AS docfreq FROM Tag_Gist, tag ";
    var whereClause = "WHERE Tag_Gist.tagid = tag.tagid ";
    whereClause = whereClause.concat("AND ( ");
	whereClause = whereClause.concat("LOWER(tag.tag) = '" + tag + "' "); // tags already lowercase
	whereClause = whereClause.concat("))");
	var fullQuery = fullQuery.concat(inner.concat(whereClause));
	psql.query.call(this, fullQuery, callback);
}

/*
	Get the document frequency for a tag: the number of times this tag is associated with some gist.
*/
function queryGistCount(callback) {
	var fullQuery = "SELECT COUNT(*) AS count FROM Gist";
	psql.query.call(this, fullQuery, callback);
}

module.exports = {
	queryMatchesAllTags: queryMatchesAllTags,
	queryMatchesAllCategories: queryMatchesAllCategories,
	queryGistCount: queryGistCount,
	queryFrequency: queryFrequency
}
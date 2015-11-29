
/**
 *  Copyright 2015, Brooks Mershon
 *
 *	Parameterized queries for use with pg-promise.
 */

var queryTags = 		"SELECT Gist.gistid, Gist.username, Gist.description, array_agg(Tag.tag) AS tags, array_agg(Tag.freq) AS frequencies, SUM(Tag.freq) AS freq_sum " +
						"FROM Gist, Tag_Gist, Tag, to_tsvector('english', Tag.tag) blob, to_tsquery('english', $1^) query " +
						"WHERE Gist.gistid = Tag_Gist.gistid AND Tag_Gist.tagid = Tag.tagid AND blob @@ query " +
						"GROUP BY Gist.gistid " +
						"ORDER BY COUNT(*) DESC, freq_sum ASC " +
						"LIMIT $2 OFFSET $3";

var queryCategories =   "SELECT Gist.gistid, Gist.username, Gist.description, array_agg(Category.category) AS categories, array_agg(Category.freq) AS frequencies, SUM(Category.freq) AS freq_sum " +
						"FROM Gist, Category_Gist, Category " +
						"WHERE Gist.gistid = Category_Gist.gistid AND Category_Gist.categoryid = Category.categoryid AND Category.category IN ($1^) " +
						"GROUP BY Gist.gistid " +
						"ORDER BY COUNT(*) DESC, freq_sum ASC " +
						"LIMIT $2 OFFSET $3";


// TODO
var queryDescription =  "SELECT Gist.gistid, Gist.username, Gist.description, ts_rank_cd(blob, query, 0) AS ts_rank " +
						"FROM Gist, to_tsvector(Gist.description) blob, plainto_tsquery('english', $1^) query " +
						"WHERE blob @@ query " +
						"ORDER BY ts_rank DESC " +
						"LIMIT 5 OFFSET 0";

var addGist = 			"INSERT INTO Gist(gistid, username, description) VALUES(${gistid}, ${username}, ${description})";

var assignTag = 		"SELECT assignTag($1, $2)";

var assignCategory = 	"SELECT assignCategory($1, $2)";

var countGists = 		"SELECT COUNT(gistid) AS count FROM Gist";

module.exports = {
	queryDescription: queryDescription,
	queryTags: queryTags,
	queryCategories: queryCategories,
	addGist: addGist,
	assignTag: assignTag,
	assignCategory,
	countGists: countGists
}
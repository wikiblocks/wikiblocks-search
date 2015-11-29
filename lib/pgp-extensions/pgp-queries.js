
/**
 *  Copyright 2015, Brooks Mershon
 *
 *	Parameterized queries for use with pg-promise.
 */

var orderedTagsMatch = 	"SELECT Gist.gistid, Gist.username, Gist.description, array_agg(Tag.tag) AS tags, array_agg(Tag.freq) AS frequencies, SUM(Tag.freq) AS freq_sum " +
						"FROM Gist, Tag_Gist, Tag " +
						"WHERE Gist.gistid = Tag_Gist.gistid AND Tag_Gist.tagid = Tag.tagid AND Tag.tag IN ($1^) " +
						"GROUP BY Gist.gistid " +
						"ORDER BY COUNT(*) DESC, freq_sum ASC " +
						"LIMIT $2 OFFSET $3";

var orderedCategoriesMatch = 

						"SELECT Gist.gistid, Gist.username, Gist.description, array_agg(Category.category) AS categories, array_agg(Category.freq) AS frequencies, SUM(Category.freq) AS freq_sum " +
						"FROM Gist, Category_Gist, Category " +
						"WHERE Gist.gistid = Category_Gist.gistid AND Category_Gist.categoryid = Category.categoryid AND Category.category IN ($1^) " +
						"GROUP BY Gist.gistid " +
						"ORDER BY COUNT(*) DESC, freq_sum ASC " +
						"LIMIT $2 OFFSET $3";

var addGist = "INSERT INTO Gist(gistid, username, description) VALUES(${gistid}, ${username}, ${description})";

var assignTag = "SELECT assignTag($1, $2)";

var assignCategory = "SELECT assignCategory($1, $2)";

var countGists = "SELECT COUNT(gistid) AS count FROM Gist";

module.exports = {
	orderedTagsMatch: orderedTagsMatch,
	orderedCategoriesMatch: orderedCategoriesMatch,
	addGist: addGist,
	assignTag: assignTag,
	assignCategory,
	countGists: countGists
}
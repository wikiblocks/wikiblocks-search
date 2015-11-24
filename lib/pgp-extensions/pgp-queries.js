var gistWithTags = 	"SELECT Gist.gistid, Gist.username, Gist.description, array_agg(Tag.tag) AS tags " +
				"FROM gist, Tag_Gist, Tag " +
				"WHERE Gist.gistid = Tag_Gist.gistid AND Tag_Gist.tagid = Tag.tagid AND Tag.tag IN ($1^) " +
				"GROUP BY Gist.gistid ORDER BY count(*) DESC";

var addGist = "INSERT INTO Gist(gistid, username, description) VALUES(${gistid}, ${username}, ${description})";

var assignTag = "SELECT assignTag($1, $2)";

module.exports = {
	gistWithTags: gistWithTags,
	addGist: addGist,
	assignTag: assignTag
}
var orderedTagsMatch = 	"SELECT Gist.gistid, Gist.username, Gist.description, array_agg(Tag.tag) AS tags, array_agg(Tag.freq) AS frequencies, SUM(Tag.freq) AS freq_sum " +
					"FROM Gist, Tag_Gist, Tag " +
					"WHERE Gist.gistid = Tag_Gist.gistid AND Tag_Gist.tagid = Tag.tagid AND Tag.tag IN ($1^) " +
					"GROUP BY Gist.gistid " +
					"ORDER BY COUNT(*) DESC, freq_sum ASC " +
					"LIMIT $2 OFFSET $3";

var addGist = "INSERT INTO Gist(gistid, username, description) VALUES(${gistid}, ${username}, ${description})";

var assignTag = "SELECT assignTag($1, $2)";

var countGists = "SELECT COUNT(gistid) AS count FROM Gist";

module.exports = {
	orderedTagsMatch: orderedTagsMatch,
	addGist: addGist,
	assignTag: assignTag,
	countGists: countGists
}
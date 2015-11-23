var gistWithTags = 	"SELECT Gist.gistid, Gist.username, Gist.description, array_agg(Tag.tag) AS tags " +
				"FROM gist, Tag_Gist, Tag " +
				"WHERE Gist.gistid = Tag_Gist.gistid AND Tag_Gist.tagid = Tag.tagid AND Tag.tag IN ($1^) " +
				"GROUP BY Gist.gistid ORDER BY count(*) DESC";

module.exports = {
	gistWithTags: gistWithTags
}
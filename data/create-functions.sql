-- Copyright 2015, Brooks Mershon
CREATE OR REPLACE FUNCTION assignTag(text, text) RETURNS text AS
$BODY$
DECLARE that integer;
BEGIN
	IF EXISTS (SELECT Tag.tagid FROM Tag where Tag.tag = $2)
	THEN
		INSERT INTO Tag_Gist(gistid, tagid)
			SELECT $1, tagid
			FROM Tag
			WHERE tag.tag = $2;
		UPDATE Tag SET freq = freq + 1 WHERE Tag.tag = $2;
		RETURN $2;
	ELSE
		INSERT INTO Tag(tag) VALUES($2) RETURNING Tag.tagid INTO that;
		INSERT INTO Tag_Gist(gistid, tagid) VALUES($1, that);
		UPDATE Tag SET freq = freq + 1 WHERE Tag.tag = $2;
		RETURN $2;
	END IF;

	-- catch exception when Gist was already associated with this tag
	EXCEPTION 
		WHEN unique_violation THEN
		RETURN $2;
END;
$BODY$
LANGUAGE 'plpgsql';


CREATE OR REPLACE FUNCTION assignCategory(text, text) RETURNS text AS
$BODY$
DECLARE that integer;
BEGIN
	IF EXISTS (SELECT Category.categoryid FROM Category where Category.category = $2)
	THEN
		INSERT INTO Category_Gist(gistid, categoryid)
			SELECT $1, categoryid
			FROM Category
			WHERE Category.category = $2;
		UPDATE Tag SET freq = freq + 1 WHERE Category.Category = $2;
		RETURN $2;
	ELSE
		INSERT INTO Category(category) VALUES($2) RETURNING Category.categoryid INTO that;
		INSERT INTO Category_Gist(gistid, categoryid) VALUES($1, that);
		UPDATE Tag SET freq = freq + 1 WHERE Category.category = $2;
		RETURN $2;
	END IF;

	-- catch exception when Gist was already associated with this category
	EXCEPTION 
		WHEN unique_violation THEN
		RETURN $2;
END;
$BODY$
LANGUAGE 'plpgsql';
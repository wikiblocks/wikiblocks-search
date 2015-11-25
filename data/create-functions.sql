-- Copyright 2015, Mark Botros and Brooks Mershon

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
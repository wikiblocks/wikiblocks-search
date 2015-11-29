 SELECT Gist.gistid, Gist.username, Gist.description, ts_rank_cd(blob, query, 0) AS ts_rank
 FROM Gist, to_tsvector(Gist.description) blob, plainto_tsquery('english', 'convex hull') query
 WHERE blob @@ query
 ORDER BY ts_rank DESC
 LIMIT 5 OFFSET 0;
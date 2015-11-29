drop schema public cascade;
create schema public;

CREATE TABLE Gist
(gistid VARCHAR(32) NOT NULL PRIMARY KEY,
username VARCHAR(32) NOT NULL,
description VarCHAR(256) NOT NULL);

CREATE TABLE Tag
(tag VARCHAR(256) NOT NULL UNIQUE,
tagid SERIAL NOT NULL PRIMARY KEY,
freq INT NOT NULL DEFAULT 0); 

CREATE TABLE Tag_Gist
(gistid VARCHAR(64) NOT NULL REFERENCES Gist(gistid),
tagid INT NOT NULL REFERENCES Tag(tagid), 
PRIMARY KEY(gistid, tagid));

CREATE TABLE Category
(category VARCHAR(128) NOT NULL UNIQUE,
categoryid SERIAL NOT NULL PRIMARY KEY,
freq INT NOT NULL DEFAULT 0);

CREATE TABLE Tag_Category
(categoryid INT NOT NULL REFERENCES Category(categoryid),
tagid INT NOT NULL REFERENCES Tag(tagid));

CREATE TABLE Category_Gist
(gistid VARCHAR(64) NOT NULL REFERENCES Gist(gistid),
categoryid INT NOT NULL REFERENCES Category(categoryid),
PRIMARY KEY(gistid, categoryid));
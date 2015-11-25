/*
    (C) 2015, Brooks Mershon

    Before running tests, start with clean database and empty tables.
*/

var tape = require("tape"),
    fs = require("fs"),
    promise = require('bluebird'), // or any other Promise/A+ compatible library;
    monitor = require('pg-monitor'), // for debugging
    config = require("../config.json"),
    queries = require("./queries.json"),
    rawGists = require("./data/sample-gists-page.json"); // sample gist object from Github API call
    
// **** SAMPLE DATA *****
var gists = rawGists.map(function(d) {
    return {gistid: d.id, username: d.owner.login, description: d.description};
});

// ***** CONNECTION TO DATABASE *****
var options = {
    promiseLib: promise // overriding the default (ES6 Promise);
};

var pgp = require('pg-promise')(options);
var db = pgp(config); // database instance;

// ***** LOGGING *****
var wstream = fs.createWriteStream("logs/transaction-test.log");

monitor.attach(options); // attach to all query events;
monitor.setTheme('matrix'); // change the default theme;

monitor.log = function(msg, info){
    wstream.write(msg + "\n");
};

// *** TESTS ***
tape("Transaction: " + JSON.stringify(["lab", "color", "picker"]) + " ---> " + gists[2].gistid, function(test) {
    // Lab Color Picker
    var tags = ["lab", "color", "picker"];

    db.tx(gists[2].gistid, function (t) {
        var Q = [];

        var queryString = "INSERT INTO Gist(gistid, username, description) VALUES($1, $2, $3)";
        var values = [gists[2].gistid, gists[2].username, gists[2].description.trim()];

        Q.push(t.none(queryString, values));

        // ["lab", "color", "picker"]
        tags.forEach(function(tag) {
            var q = t.one("SELECT assignTag($1, $2)", [gists[2].gistid, tag]);

            Q.push(q);
        });

        // returning a promise that determines a successful transaction:
        return this.batch(Q); // all of the queries are to be resolved (gist, tag, tag, tag, ...);
    })
        .then(function(_data) {
            // use query string from JSON file...
            db.any(queries.matchTag, ['color'])
                .then(function(data) {
                    test.ok(data.length == 1, "array of gists returned with one matched gist");
                })
                .catch(function(error) {
                    test.notOk(error, "query for gists with tag " + tags[1]);
                });
        })
        .catch(function (error) {
            test.notOk(error, "transaction succeeds entirely (make sure tables are empty)");
        })
        .finally(function(){
            test.end();
            pgp.end(); //close connections and exit
        });
});




/*
    Extend pg-promise to expose
*/

function extendGist(obj) {
    return {
        addGist: function (gist) {
            return obj.none("INSERT INTO Gist(gistid, username, description) VALUES(${gistid}, ${username}, ${description})", gist);
        },
        addTags: function(gistid, tags) {
            return obj.tx(gistid, function (t) {
                        var Q = [];

                        tags.forEach(function(tag) {
                            var q = t.one("SELECT assignTag($1, $2)", [gistid, tag]);
                            Q.push(q);
                        });

                        return this.batch(Q);
                    })
        },
        addCategories: function(){
            // TODO
        }
    }
}

module.exports = {
    extension: extendGist
}


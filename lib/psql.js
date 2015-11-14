/*
	Copyright 2015, Brooks Mershon
*/


/*	
	this - pg client object
	@param {string} OR {Object {text: "", values: []}} myQuery - psql query statement
	@param {string[]} args - OPTIONAL array of arguments for query string (i.e $1, $2, ...)
	@param {function} callback - called with (error, results)
*/
function _executeQuery(myQuery, callback){
	var query = this.query(myQuery);

	query.on("row", function (row, results) {
    	results.addRow(row);
	});
	query.on("end", function(results) {
		callback(null, results);
	}); 
	query.on("error", function(error) {
		callback(error, null);
	});
}

module.exports = {
 	query: _executeQuery
};



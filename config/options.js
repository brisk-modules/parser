// enviroment state
var DEV = (process.env.NODE_ENV == "production") ? false : true;

module.exports = {
	body: true, //traditional body parser
	cookies: true, //cookie parser
	json: false, // supporting parsing of: application/json
	files: false // parsing uploaded files
}


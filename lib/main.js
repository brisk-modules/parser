var _ = require("underscore")
	Module = require("brisk").getHelper("module");

var defaults = require("../config/options");

var Main = Module.extend({
	dir : __dirname,

	// override with config file...
	config : function( options ){

		// get custom config
		options = options || {};

		return _.extend({}, defaults, {

		}, options);

	}

});


module.exports = new Main();
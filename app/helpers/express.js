var _ = require("underscore"),
	bodyParser = require("body-parser"),
	cookieParser = require('cookie-parser'),
	Parent = require("brisk").getClass("main");

helper = Parent.extend({

/*
	init: function( site ){
		// save context
		this.parser = _.bind(this.parser, this);

		if( Parent.prototype.init ) return Parent.prototype.init.call(this, site);
	},
*/

	parser: function( options ){
		// context is all wrong in this version...
		var self = this,
			//app = this.site.modules.app;
			app = this.express;
		if( options.body ){
			app.use(bodyParser.urlencoded({ extended: false }));
		}
		// parse application/json
		if( options.json ){
			app.use(bodyParser.json());
		}
		return function(req, res, next) {
			// execute custom parser if set in the options
			//if( options.custom ) return self.custom();
			next();
		}
	},

	cookieParser: cookieParser,
	//

	// Work around instead of using bodyParser
	// Source: http://stackoverflow.com/a/9920700/1247359
	custom: function(req, res, next) {
		var data='';
		req.setEncoding('utf8');
		req.on('data', function(chunk) {
			data += chunk;
		});

		req.on('end', function() {
			// convert query to object
			var query = {};
			try {
				data.replace(
					new RegExp("([^?=&]+)(=([^&]*))?", "g"),
					function($0, $1, $2, $3) {
						query[$1] = decodeURIComponent( $3.replace(/\+/g, '%20') );
					}
				);
			} catch ( e ){
				// assume no query string... just a JSON
				query = (typeof data == "string" ) ? JSON.parse( data ) : data;
			}
			// either way:
			//console.log("query", query);
			req.body = query;
			next();
		});
	},


});

module.exports = helper;
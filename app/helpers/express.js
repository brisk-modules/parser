var _ = require("underscore"),
	fs = require('fs'),
	path = require('path'),
	os = require('os'),
	bodyParser = require("body-parser"),
	cookieParser = require('cookie-parser'),
	Busboy = require("busboy"),
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
		if( options.files ){
			app.use(this.parseFiles);
		}
		return function(req, res, next) {
			// execute custom parser if set in the options
			//if( options.custom ) return self.custom();
			next();
		}
	},

	cookieParser: cookieParser,

	//
	parseFiles: function(req, res, next){
		// prerequisite(s)
		// convert query to object
		var type = req.headers['content-type'];
		// FIX
		if( type && type.indexOf("multipart/form-data") >-1 ) type = "multipart/form-data";

		if( type !== "multipart/form-data") return next();

		var busboy = new Busboy({ headers: req.headers });
		req.files = req.files || []; // container
		//
		busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
				var saveTo = path.join(os.tmpDir(), path.basename(filename));
				file.pipe(fs.createWriteStream(saveTo));
				file.on('end', function() {
						//console.log('File [' + filename + '] Finished', saveTo);
						req.files.push( saveTo );
				});
		});
		busboy.on('finish', function() {
				//res.writeHead(200, { 'Connection': 'close' });
				//res.end();
				next();
		});
		req.pipe(busboy);

	},

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
	}

});

module.exports = helper;

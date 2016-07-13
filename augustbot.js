// Init Discord.js
try {
	var Discord = require( 'discord.js' );
	var Request = require( 'request' );
} catch( e ) {
	console.log( e.stack );
	console.log( process.version );
	console.log( "Please run NPM install." );
	process.exit();
}

// Auth data
try {
	var AuthInfo = require( './auth.json' );
} catch( e ) {
	console.log( 'No authentication information found!\n' + e.stack );
	process.exit();
}

// Config settings
try {
	var Config = require( './config.json' );
} catch( e ) {
	var Config = {};
	Config.debug = true;
	Config.commandPrefix = '+';
	console.log( 'No configuration file found; using defaults.' );
}


var AugustBot = new Discord.Client();
var Commands  = {
	'ping' : {
	  description: "Replies with 'pong'; basically a debugging/troubleshooting command.",
	  process: function( bot, msg, suff ) {
	  	bot.reply( msg, "pong, bitch!" );
	  }
	},
	
	'shutdown' : {
		usage: '<timeout>',
		descsription: "Ends the server process running bot on the host server. Default timeout is 5s, otherwise provide the desired pause time in millisections.",
		process: function( bot, msg, suff ) {
			try {
				var timeout = ( suff ) ? parseInt( suff ) : 5000;
				bot.sendMessage( msg.channel, '`Shutdown` command issued by: ***' + msg.author + '***\n'
											 + 'Shutting down in ' + timeout/1000 + ' seconds...' );
				setTimeout( function(){ process.exit(); }, timeout );				
			} catch( e ) {
				handleInStride( e, msg );
			}
		}
	},
	
	'gif' : {
		usage: '<tags>',
		description: 'Get a random gif, filtered by the supplied tag(s), from the GiphyAPI',
		process: function( bot, msg, suff ) {
			var tags = suff.split( ' ' );
			if( tags.length < 1 ) bot.reply( msg, ' you must provide tags for me to find a gif' );
			try {
				var giphyApiKey = 'dc6zaTOxFJmzC', // Move to Config or something
						giphyURL    = 'http://api.giphy.com/v1/gifs/random?api_key=' + giphyApiKey + '&tag=' + tags.join( '+' );
				
				Request( giphyURL, function( error, response, body ) {
					// Giphy API retunrs json array
					var gifObj = JSON.parse( body );
					if( error || response.statusCode != 200 ) {
						console.error( 'Error accessing Giphy API: ' + body );
						console.log( error );
					} else {
						// { data: { *Gif Data }, meta: { *Response data } }
						bot.sendMessage( msg.channel, gifObj.data.url );
					}
				});
			} catch( e ) {
				handleInStride( e, msg );
			}
		}
	}
};

//AugustBot.on( 'message', function( message ){
//	if( message.content === 'ping' ) {
//		AugustBot.reply( message, 'pong' );
//	}
//});

AugustBot.on( 'disconnected', function() {
	console.log( 'Disconnected!' );
	process.exit( 1 );
});

AugustBot.on( 'message', function( message ) {
	if( message.author.id != AugustBot.user.id
	    && ( message.content[ Config.commandPrefix.length - 1 ] === Config.commandPrefix
	         || message.content.indexOf( AugustBot.user.mention() ) == 0 ) ) {
		
		console.log( message.author + ' attempting command: ' + message.content );
	
		var commandText = message.content.split( ' ' )[0].substring( 1 );
		var commandSuffix = message.content.substring( commandText.length + 1 + Config.commandPrefix.length );
		var action = Commands[ commandText ];
		
		if( action ) {
			try {
				action.process( AugustBot, message, commandSuffix );
			} catch (e) {
				if( Config.debug ) {
					AugustBot.reply( message, '`' + commandText + '` command failed to execute!\n' + e.stack );
				}
			}
		} else {
			if( Config.debug ) {
				AugustBot.reply( message, '`' + commandText + '` command not found!\n' );
			}
		}

	} else {
		if( message.author == AugustBot.user ) return;
		if( message.author != AugustBot.user && message.isMentioned( AugustBot.user ) ){
			AugustBot.reply( message, "shut the fuck up." );
		}
	}
});


AugustBot.loginWithToken( AuthInfo.token );

	function handleInStride( e, msg ) {
		if( Config.debug ) {
			AugustBot.sendMessage( msg.channel, '***Command failed!***\n'
											+ '```\n ' + e.stack + '\n```' );
		} else {
			console.error( 'Command failed!' );
			console.log( e.stack );
			AugustBot.reply( msg, 'your command failed. See console for details.' );
		}
	}
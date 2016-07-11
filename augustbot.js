// Init Discord.js
try {
	var Discord = require( 'discord.js' );
} catch( e ) {
	console.log( e.stack );
	console.log( process.version );
	console.log( "Please run NPM install." );
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
}


var AugustBot = new Discord.Client();
var commands  = {
	'ping' : {
	  description: "",
	  process: function( bot, msg, suff ) {
	  	bot.sendMessage( msg.channel, "Pong, bitch!" );
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
	         || message.content.indexOf( AugustBot.user.mention() ) == 0 ) ){
		
		console.log( message.auther + ' attempting command: ' + message.content );
	
		var commandText = message.content.split( ' ' )[0].substring( 1 );
		var commandSuffix = message.content.substring( commandText.length + 1 + Config.commandPrefix.length );
		var cmd = commands[ commandText ];

		if( cmd ) {
			try {
				AugustBot.reply( message, '`' + commandText + '` command found!' );
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
			AugustBot.reply( message, "Shut the fuck up." );
		}
	}
});


AugustBot.loginWithToken( AuthInfo.token );

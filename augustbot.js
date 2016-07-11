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


var AugustBot = new Discord.Client();

AugustBot.on( 'message', function( message ){
	if( message.content === 'ping' ) {
		AugustBot.reply( message, 'pong' );
	}
});

AugustBot.loginWithToken( AuthInfo.token );

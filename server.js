var express = require('express');
var httpProxy = require('http-proxy');
var path = require('path');

var isProduction = process.env.NODE_ENV === 'production';
var port = process.env.PORT || 3000;

var PHASE_MAP = {
    Action: 1,
    Buy: 2,
    Cleanup: 3
};

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var proxy = httpProxy.createProxyServer();

var publicPath = path.resolve(__dirname, 'public');
var roomPath = path.resolve(__dirname, 'server', 'room');
var userPath = path.resolve(__dirname, 'server', 'user');
var cardPath = path.resolve(__dirname, 'server', 'card');

var Room = require(roomPath);
var User = require(userPath);
var Card = require(cardPath);

var room = new Room(io);

var FirstGame = {
    name: 'first game',
    startDeck: {
        copper: 7,
        estate: 3
    },
    supply: {
        copper: [60, 60, 60],
        silver: [40, 40, 40],
        gold: [30, 30, 30],
        estate: [14, 21, 24],
        duchy: [8, 12, 12],
        province: [8, 12, 12],
        cellar: [10, 10, 10],
        village: [10, 10, 10],
        workshop: [10, 10, 10],
        remodel: [10, 10, 10],
        market: [10, 10, 10],
        moat: [10, 10, 10],
        woodcutter: [10, 10, 10],
        militia: [10, 10, 10],
        smithy: [10, 10, 10],
        mine: [10, 10, 10]
    }
};
Object.keys(FirstGame.supply).forEach(function(name) {
    var toSupply = FirstGame.supply[name];
    var amt = toSupply[toSupply.length - 1];
    
    var work = [];
    toSupply.unshift(work);
    
    var pile = [];
    for (var i = 0; i < amt; i++) {
        pile.unshift(new Card(name));
    }
    toSupply.unshift(pile);
});
room.newRoom(FirstGame);

// We point to our static assets
app.use(express.static(publicPath));

if (!isProduction) {

    // We require the bundler inside the if block because
    // it is only needed in a development environment. Later
    // you will see why this is a good idea
    var bundle = require('./server/bundle');
    bundle();

    // Any requests to localhost:3000/build is proxied
    // to webpack-dev-server
    app.all('/build/*', function(req, res) {
        proxy.web(req, res, {
            target: 'http://localhost:8080'
        });
    });

}

// It is important to catch any errors from the proxy or the
// server will crash. An example of this is connecting to the
// server when webpack is bundling
proxy.on('error', function(e) {
    console.log('Could not connect to proxy, please try again...');
});

server.listen(port, function() {
    console.log('Server listening at port %d', port);
});

io.on('connection', function(socket) {
    
    var user = new User(socket);
    
    // user routines
    
    socket.emit('_init', user.name);
    
    socket.on('_set_name', function(name) {
        user.setName(name) && room.updateUser(user);
    });
    
    // room routines
    
    socket.on('_join_room', function(name) {
        room.joinUser(name, user);
    });
    
    socket.on('_set_room', function(name) {
        user.joinRoom(name) && room.updateRoom(name);
    });
    
    socket.on('_recon_room', function(slot) {
        var current = user.current;
        var game = room.getGame(current);
        var userRoom = user.rooms[current];
        
        game &&
        userRoom === 'spectator' &&
        game.reconnect(user, slot) &&
        room.setPlayer(user) &&
        room.updateRoom(current);
    });
    
    socket.on('disconnect', function() {
        user.disconnect(room);
    });
    
    // game routines
    
    socket.on('_send_control', function(cntrl) {
        var current = user.current;
        var game = room.getGame(current);
        
        game && (
            (cntrl === 'Start' && game.start(user)) ||
            (cntrl === 'Restart' && game.restart(user)) ||
            (PHASE_MAP[cntrl] && game.setPhase(user, PHASE_MAP[cntrl])) ||
            (game.completeItem(user, cntrl))
        ) &&
        room.updateRoom(current);
    });
    
    socket.on('_tap_card', function(src, index) {
        var current = user.current;
        var game = room.getGame(current);
        
        game && game.tapCard(user, src, index) && room.updateRoom(current);
    });
    
});

function MultiplayerClient(url, localPlayer, world) {
    this.socket = new WebSocket(url);
    this.localPlayer = localPlayer;
    this.world = world;
    this.players = {};

    var client = this;

    this.socket.onopen = function() {
        console.log('Connected to server');
    };

    this.socket.onmessage = function(event) {
        var message = JSON.parse(event.data);
        if (message.type === 'init') {
            client.localPlayer.id = message.id;
            console.log('Player ID:', client.localPlayer.id);
        } else if (message.type === 'update') {
            client.updatePlayer(message.id, message.position);
        } else if (message.type === 'remove') {
            client.removePlayer(message.id);
        }
    };

    this.socket.onclose = function() {
        console.log('Disconnected from server');
    };
}

MultiplayerClient.prototype.sendUpdate = function() {
    if (this.localPlayer.id) {
        var data = {
            type: 'update',
            id: this.localPlayer.id,
            position: {
                x: this.localPlayer.pos.x,
                y: this.localPlayer.pos.y,
                z: this.localPlayer.pos.z,
                yaw: this.localPlayer.angles[1],
                pitch: this.localPlayer.angles[0]
            }
        };
        this.socket.send(JSON.stringify(data));
    }
};

MultiplayerClient.prototype.updatePlayer = function(id, position) {
    if (id !== this.localPlayer.id) {
        var player = this.players[id];
        if (!player) {
            player = new OtherPlayer(id);
            player.setWorld(this.world);
            this.players[id] = player;
            this.world.players[id] = player;
        }
        player.updateFromData(position);
    }
};

MultiplayerClient.prototype.removePlayer = function(id) {
    if (this.players[id]) {
        delete this.players[id];
        delete this.world.players[id];
    }
};

// Define OtherPlayer class
function OtherPlayer(id) {
    Player.call(this);
    this.id = id;
}

OtherPlayer.prototype = Object.create(Player.prototype);
OtherPlayer.prototype.constructor = OtherPlayer;

OtherPlayer.prototype.updateFromData = function(data) {
    this.pos.x = data.x;
    this.pos.y = data.y;
    this.pos.z = data.z;
    this.angles[1] = data.yaw;
    this.angles[0] = data.pitch;
};

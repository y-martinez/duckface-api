

module.exports = function(app, chatRoutes,io){
	crypto = require("crypto")
	var User = require('../models/user.js');
	var Chat = require('../models/chat.js');
	var Message = require ('../models/message.js');

	chatRoutes.get('/users/:username/chat',function(req, res){

        Chat.find({

        	user1: req.params.username,
        	isActive : true

        },
        function(err, chat) {
            console.log(chat);
            if (err)
                res.send(err);
            res.json(chat);
        });

	});

	chatRoutes.post('/users/:username1/chat',function(req,res){
		Chat.find({
			$or:[
				{user1:req.params.username1, user2:req.body.username2},
				{user1:req.body.username2, user2:req.params.username1}
			]
		},
		'room',
		function(err,room_id){
			if (err) throw err;
			
			if (room_id.length == 0){

				console.log("creando el chat");
				chat = new Chat();
				chat.user1 = req.params.username1;
				chat.user2 = req.body.username2;
				chat.isActive = true;

		        var concat = 'chat' + chat.user1 + chat.user2;
		        console.log(concat);
		    	var hash = crypto.createHash('md5').update(concat).digest('hex');
		    	console.log(hash);
		    	chat.room = hash;

		        chat.save(function(err) {
		            if (err){
		            	console.log("no se pudo crear el chat");
		            	console.log(err);
		                res.send(err);
		            }else{

		            }
		        });
			}
			res.json({room : chat.room});

		});
	});

	chatRoutes.route('/chat/:room/messages')

		.get(function(req, res){

			/*
	        Message.find({

	        	user1: req.params.username,
	        	isActive : true

	        },
	        function(err, messages) {
	            console.log(messages);
	            if (err)
	                res.send(err);
	            res.json(messages);
	        });*/

		})
		.post(function(req, res){
			var message = new Message();
			res.json({ok:'todo fino'});
	});

	var chat = io.on('connection', function (socket) {

		// When the client emits the 'load' event, reply with the 
		// number of people in this chat room

		socket.on('load',function(data){

			console.log("EPALEEEEEEEEEEE");

			var room = findClientsSocket(io,data.id);
			if(room.length === 0 ) {

				socket.emit('peopleinchat', {number: 0});
			}
			else if(room.length === 1) {

				socket.emit('peopleinchat', {
					number: 1,
					user: room[0].username,
					avatar: room[0].avatar,
					id: data
				});
			}
			else if(room.length >= 2) {

				chat.emit('tooMany', {boolean: true});
			}
		});

		// When the client emits 'login', save his name and avatar,
		// and add them to the room
		socket.on('login', function(data) {

			var room = findClientsSocket(io, data.id);
			// Only two people per room are allowed

			// Use the socket object to store data. Each client gets
			// their own unique socket object
			socket.username = data.user;
			socket.room = data.id;

			// Add the client to the room
			socket.join(data.id);

			if (room.length == 1) {

				var usernames = [];

				usernames.push(room[0].username);
				usernames.push(socket.username);

				// Send the startChat event to all the people in the
				// room, along with a list of people that are in it.

				chat.in(data.id).emit('startChat', {
					boolean: true,
					id: data.id,
					users: usernames
				});
			}
			console.log(socket);
		});

		// Somebody left the chat
		socket.on('disconnect', function() {

			// Notify the other person in the chat room
			// that his partner has left

			socket.broadcast.to(this.room).emit('leave', {
				boolean: true,
				room: this.room,
				user: this.username
			});

			// leave the room
			socket.leave(socket.room);
		});


		// Handle the sending of messages
		socket.on('msg', function(data){
			console.log("llego");
			console.log(data);
			// When the server receives a message, it sends it to the other person in the room.
			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user});
		});
	});
};

function findClientsSocket(io,roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/");    // the default namespace is "/"

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				var index = ns.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) {
					res.push(ns.connected[id]);
				}
			}
			else {
				res.push(ns.connected[id]);
			}
		}
	}
	return res;
}
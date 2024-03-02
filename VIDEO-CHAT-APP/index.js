const express = require('express');
const app = express();
const socket = require('socket.io');

const server = app.listen(3000, ()=> {
    console.log('Server is running');
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine', 'ejs');
app.set('views','./views');

app.use(express.static('public'));

const userRoute = require('./routes/UserRoute');
app.use('/',userRoute);

//socket io working with signalling server

var io = socket(server);
io.on("connection", function(socket){
    console.log("User connected: " + socket.id)

    socket.on("join", function(roomName){
        var rooms = io.sockets.adapter.rooms;    

        var room = rooms.get(roomName);
        console.log(room);


        if(room == undefined){
            socket.join(roomName);
            socket.emit("created");
        }
        else if(room.size == 1){
            socket.join(roomName);
            socket.emit("joined");
        }
        else{
            socket.emit("full");
        }
        console.log(rooms);

    });

    socket.on("ready", function(roomName){
        console.log("Ready");
        socket.broadcast.to(roomName).emit("ready")
    });

    socket.on("candidate", function(candidate, roomName){
        console.log("Candidate");
        socket.broadcast.to(roomName).emit("candidate", candidate);
    });

    socket.on("offer", function(offer, roomName){
        console.log("Offer");
        socket.broadcast.to(roomName).emit("offer", offer);
    });

    socket.on("answer", function(answer, roomName){
        console.log("Answer");
        socket.broadcast.to(roomName).emit("answer", answer);
    });


});
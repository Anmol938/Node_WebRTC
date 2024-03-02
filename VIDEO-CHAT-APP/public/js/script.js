var socket = io();

var videoChatForm = document.getElementById('video-chat-form');
var videoChatRooms = document.getElementById('video-chat-rooms');
var joinBtn = document.getElementById('join');
var roomInput = document.getElementById('roomName');
var userVideo = document.getElementById('user-video');
var peerVideo = document.getElementById('peer-video');
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var roomName  = roomInput.value;
var creator = false;

joinBtn.addEventListener("click", function(){
        if(roomInput.value == ""){
            alert("Please enter a room name");
        }
        else{
                socket.emit("join", roomName);
            }

});

socket.on("created", function(){
    creator = true;
    navigator.getUserMedia(
        {
            audio:true,
            video:{width:720, height:480}
        },
        function(stream){
            videoChatForm.style="display :none";
            userVideo.srcObject = stream;
            userVideo.onloadedmetadata = function(e){
                userVideo.play();
            }
        },
        function(error){
                alert("You cant access media");
        }
    )

});
socket.on("joined", function(){
    creator = false;
    navigator.getUserMedia(
        {
            audio:true,
            video:{width:720, height:480}
        },
        function(stream){
            videoChatForm.style="display :none";
            userVideo.srcObject = stream;
            userVideo.onloadedmetadata = function(e){
                userVideo.play();
            }
            
        },
        function(error){
                alert("You cant access media");
        }
    )
});
socket.on("full", function(){
    alert("Room is full, you can't join the room!!");
    console.log(roomName);
});





socket.on("ready", function(){});
socket.on("candidate", function(){});
socket.on("offer", function(){});
socket.on("answer", function(){});
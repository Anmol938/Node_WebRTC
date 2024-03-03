var socket = io();

var videoChatForm = document.getElementById('video-chat-form');
var videoChatRooms = document.getElementById('video-chat-rooms');
var joinBtn = document.getElementById('join');
var roomInput = document.getElementById('roomName');
var userVideo = document.getElementById('user-video');
var peerVideo = document.getElementById('peer-video');
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


//upgrading work
var divBtnGroup = document.getElementById('btn-group');



var roomName  = roomInput.value;
var creator = false;

var rtcPeerConnection;
var userStream ;

var iceServers = {
    iceServers : [
        {urls: "stun:stun2.l.google.com:19302"},
        {urls: "stun:stun.services.mozilla.com"}
    ]
};

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
            video:{width:300, height:300}
        },
        function(stream){
            userStream = stream;
            videoChatForm.style="display :none";
            divBtnGroup.style = "display:flex";
            document.getElementById('video-chat-rooms').style.display = 'flex';
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
            video:{width:300, height:300}
        },
        function(stream){
            userStream = stream;
            videoChatForm.style="display:none";
            divBtnGroup.style = "display:flex";
            document.getElementById('video-chat-rooms').style.display = 'flex';
            userVideo.srcObject = stream;
            userVideo.onloadedmetadata = function(e){
            userVideo.play();
            }
            socket.emit("ready",roomName);
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





socket.on("ready", function(){

        if(creator){
           rtcPeerConnection =  new RTCPeerConnection(iceServers);
           rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
           rtcPeerConnection.ontrack = OnTrackFunction;
           rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream);//for audio
           rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream); //for video ['audio','video']
           rtcPeerConnection.createOffer(
            function(offer){
                rtcPeerConnection.setLocalDescription(offer);
                socket.emit("offer", offer, roomName);
            },
            function(error){
                console.log(error);
            }
           ); 
        }

});

socket.on("candidate", function(candidate){
    var iceCandidate = new RTCIceCandidate(candidate)
    rtcPeerConnection.addIceCandidate(iceCandidate);
});


socket.on("offer", function(offer){
    if(!creator){
        rtcPeerConnection =  new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
        rtcPeerConnection.ontrack = OnTrackFunction;
        rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream);//for audio
        rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream); //for video ['audio','video']
        rtcPeerConnection.setRemoteDescription(offer);
        rtcPeerConnection.createAnswer(
         function(answer){
            rtcPeerConnection.setLocalDescription(answer);
             socket.emit("answer", answer, roomName);
         },
         function(error){
             console.log(error);
         }
        ); 
     }
});

socket.on("answer", function(answer){
    rtcPeerConnection.setRemoteDescription(answer);
});


function OnIceCandidateFunction(event){
    if(event.candidate){
        socket.emit("candidate",event.candidate, roomName);
    }
}

function OnTrackFunction(event){
    peerVideo.srcObject = event.streams[0];
    peerVideo.onloadedmetadata = function(e){
        peerVideo.play();
    }
}
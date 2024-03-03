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
var muteButton = document.getElementById('muteButton');
var hideCameraBtn = document.getElementById('hideCamera');
var leaveRoomButton = document.getElementById('leaveRoomButton');


var muteFlag = false;
var hideCameraFlag = false;

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

muteButton.addEventListener("click", function(){
    muteFlag = !muteFlag;
    if(muteFlag){
        userStream.getTracks()[0].enabled = false;
        muteButton.textContent="Unmute";
    }
    else{
        userStream.getTracks()[0].enabled = true;
        muteButton.textContent="mute";
    }    

});

hideCameraBtn.addEventListener("click", function(){
    hideCameraFlag = !hideCameraFlag;
    if(hideCameraFlag){
        userStream.getTracks()[1].enabled = false;
        hideCameraBtn.textContent="Show Camera";
    }
    else{
        userStream.getTracks()[1].enabled = true;
        hideCameraBtn.textContent="Hide Camera";
    }    

});

// leave room concept
leaveRoomButton.addEventListener("click", function(){
    socket.emit("leave",roomName);

    videoChatForm.style="display :block";
    divBtnGroup.style = "display:none";
    document.getElementById('video-chat-rooms').style.display = 'none';

    if(userVideo.srcObject){
        userVideo.srcObject.getTracks()[0].stop();
    userVideo.srcObject.getTracks()[1].stop();
    }
    
    if(peerVideo.srcObject){
        
    peerVideo.srcObject.getTracks()[0].stop();
    peerVideo.srcObject.getTracks()[1].stop();
    }

    if(rtcPeerConnection){
        rtcPeerConnection.ontrack = null;
        rtcPeerConnection.onicecandidate = null;
        rtcPeerConnection.close();

    }

});

socket.on("leave",function(){
    creator = true;
    
    if(peerVideo.srcObject){
        
        peerVideo.srcObject.getTracks()[0].stop();
        peerVideo.srcObject.getTracks()[1].stop();
        }
    
        if(rtcPeerConnection){
            rtcPeerConnection.ontrack = null;
            rtcPeerConnection.onicecandidate = null;
            rtcPeerConnection.close();
    
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
           console.log(userStream.getTracks());
           //console.log("sadasdddddddddddddddddddddddddddddddddddddddddddddddddd");
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
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const selfVideoBox = document.getElementById('self-video-box')
const myPeer = new Peer(undefined, {
  host: "peer-js-server-by-akki.herokuapp.com",
  port: 443,
  secure: true,
})
const user = prompt("Enter your display name:"); //ask for a username through prompt
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
// get the audio video from user's device
navigator.mediaDevices.getUserMedia({ 
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  //addVideoStream(selfVideoBox, stream)
  myVideo.srcObject = stream;
  myVideo.addEventListener("loadedmetadata", () => {
    myVideo.play();
  });
  selfVideoBox.append(myVideo);
  myPeer.on('call', call => {
    call.answer(stream) //answer a call with your audio-video
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream) //append video to grid
    })
  })

  socket.on('user-connected', (userId, userName) => {
    connectToNewUser(userId, stream)
    $("ul").append(`<br><h6 style="color: MediumSeaGreen"><i><li class="message">
    ${userName}<b>-joined the call</b></li><i></h6><br>`);
    scrollToBottom()
  })
  
let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

//listen to click event on send button
send.addEventListener("click", (e) => { 
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

//listen to pressing enter key to send chat
text.addEventListener("keydown", (e) => { 
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});
// listening for message from socket
socket.on("createMessage", (message, userName) => { 
  messages.innerHTML =                              // append message to message box
    messages.innerHTML +
    `<div class="message">
        <b><i class="bi bi-person-circle"></i><span> ${
          userName === user ? "You" : userName
        }</span>:</b>
        <span>${message}</span>
    </div>`;
  });
})

socket.on('user-disconnected', (userId, userName) => {
  if (peers[userId]){
    $("ul").append(`<br><h6 style="color: #b31b1b;">
    <i><li class="message">${userName}<b>-left the call</b></li><i></h6><br>`);
    scrollToBottom()
    peers[userId].close()
    //adjusting size of videos in grid
    let totalUsers = document.getElementsByTagName("video").length;
    if (totalUsers >=1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementById('video-grid').getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";
      document.getElementById('video-grid').getElementsByTagName("video")[index].style.height =
        100 / totalUsers + "%";
    }
  }
  }
})

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id, user)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove();
  })

  peers[userId] = call
}

//addVideoStream function to append users videos to grid
const addVideoStream = (videoEl, stream) => {
  videoEl.srcObject = stream;
  videoEl.addEventListener("loadedmetadata", () => {
    videoEl.play();
  });

  videoGrid.append(videoEl);
  let totalUsers = document.getElementById('video-grid').getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementById('video-grid').getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";
      document.getElementById('video-grid').getElementsByTagName("video")[index].style.height =
        100 / totalUsers + "%";
    }
  }
};


const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

//mic toggle function
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}
//camera toggle function
const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="bi bi-mic-fill"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="bi bi-mic-mute-fill"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="bi bi-camera-video-fill"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
    <i class="bi bi-camera-video-off-fill"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

//invite others
const inviteButton = document.querySelector('.main__invite_button');
inviteButton.addEventListener("click", (e) => {
  navigator.clipboard.writeText(window.location.href);
  alert("Invite link copied to clipboard! Send it to people you want to chat with.");
});


//screen sharing not functional currently
let myScreenStream;

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', (e) => {
  if (adapter.browserDetails.browser == 'firefox') {
    adapter.browserShim.shimGetDisplayMedia(window, 'screen');
  }
  const myVideo=document.createElement('video')
  navigator.mediaDevices.getDisplayMedia({
    video: true
  }).then(stream => {
    myScreenStream = stream;
    // selfVideoBox.srcObject = stream;
    // selfVideoBox.addEventListener("loadedmetadata", () => {
    // selfVideoBox.play();
    //addVideoStream(myVideo, stream);
    socket.emit('screen-share', stream);

    } );
    
  //const screenStream=navigator.mediaDevices.getDisplayMedia({video: true});
  //socket.emit('screen-share', stream);
})


socket.on('screenShare', (stream, userName) => {
  //connectToNewUser(userId, stream)                                  

  // if (adapter.browserDetails.browser == 'firefox') {
  //   adapter.browserShim.shimGetDisplayMedia(window, 'screen');
  // }

  // navigator.mediaDevices.getDisplayMedia({video: true})
  //       .then(handleSuccess, handleError);
    startButton.disabled = true;
    const video = document.createElement('video');
    let screenStream=stream;
    addVideoStream(video, screenStream);
    $("ul").append(`<br><h6 style="color: MediumSeaGreen;"><i><li class="message">${userName}<b>-started screen sharing</b></li><i></h6><br>`);
    
})

//raise hand

const raiseHand = document.getElementById('raiseHand');
raiseHand.addEventListener("click", (e) => {
  //emit through socket when button is clicked
  socket.emit('raise-hand');                                               
});

//listening for raiseHand event
socket.on('raiseHand', userName =>{                  
  $("ul").append(`<h6><li class="message"><i class="bi bi-person-circle"></i><span> ${
    userName === user ? "You" : userName
  }:✋</span></li></h6>`);
})


//exit button 

const exitButton = document.querySelector('.main__exit_button');

exitButton.addEventListener("click", (e) => {
  //window.close();
  //process.exit()
  //open(location, '_self').close();
  if(confirm("Are you sure?")){
  var win = window.open("leave.html", "_self");
  win.close();
  }
});

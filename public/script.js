const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: "peer-js-server-by-akki.herokuapp.com",
  port: 443,
  secure: true,
})
const user = prompt("Enter your display name");
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
    $("ul").append(`<h6 style="color:green;"><i><li class="message">${userId}<b>-joined the call</b><br/></li><i></h6>`);
    scrollToBottom()
  })
  
  // input value
  // let text = $("input");
  // let send = document.getElementById("send");
  // let messages = document.querySelector(".messages");
  // //send message on click
  // send.addEventListener("click", (e) => {
  //   if (text.value.length !== 0) {
  //     socket.emit("message", text.value);
  //     text.value = "";
  //   }
  // });
  // // send message on pressing enter key
  // $('html').keydown(function (e) {
  //   if (e.which == 13 && text.val().length !== 0) {
  //     socket.emit('message', text.val());
  //     text.val('')
  //   }
  // });
  // socket.on("createMessage", message => {
  //   $("ul").append(`<li class="message"><b>message:</b><br/>${message}</li>`);
  //   scrollToBottom()
  // })
let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});
  socket.on("createMessage", (message, userName) => {
    messages.innerHTML =
      messages.innerHTML +
      `<div class="message">
          <b><i class="far fa-user-circle"></i> <span> ${
            userName === user ? "me" : userName
          }</span> </b>
          <span>${message}</span>
      </div>`;
  });
})

socket.on('user-disconnected', userId => {
  if (peers[userId]){
    $("ul").append(`<h6 style="color:red;"><i><li class="message">${userId}<b>-left the call</b><br/></li><i></h6>`);
    scrollToBottom()
    peers[userId].close()
  }
})

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id, user)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  //$("ul").append(`<font size="2" color="green"><i><li class="message">${userName}<b>-is online</b><br/></li><i></font>`);
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

const addVideoStream = (videoEl, stream) => {
  videoEl.srcObject = stream;
  videoEl.addEventListener("loadedmetadata", () => {
    videoEl.play();
  });

  videoGrid.append(videoEl);
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";
    }
  }
};


const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


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
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

//invite others
const inviteButton = document.querySelector('.main__invite_button');
inviteButton.addEventListener("click", (e) => {
  // prompt(
  //   "Copy this link and send it to people you want to video chat with:",
  //   window.location.href
  // );
  navigator.clipboard.writeText(window.location.href);
  alert("Invite link copied to clipboard! Send it to people you want to chat with.");
});



//screen sharing

if (adapter.browserDetails.browser == 'firefox') {
  adapter.browserShim.shimGetDisplayMedia(window, 'screen');
}

function handleSuccess(stream) {
  startButton.disabled = true;
  const video = document.createElement('video');
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 1) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";
    }
  }

  // demonstrates how to detect that the user has stopped
  // sharing the screen via the browser UI.
  stream.getVideoTracks()[0].addEventListener('ended', () => {
    errorMsg('The user has ended sharing the screen');
    startButton.disabled = true;
  });
}

function handleError(error) {
  errorMsg(`getDisplayMedia error: ${error.name}`, error);
}

function errorMsg(msg, error) {
  const errorElement = document.querySelector('#errorMsg');
  errorElement.innerHTML += `<p>${msg}</p>`;
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => {
  navigator.mediaDevices.getDisplayMedia({video: true})
      .then(handleSuccess, handleError);
});

if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
  startButton.disabled = false;
} else {
  errorMsg('getDisplayMedia is not supported');
}

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
//record stream
// let mediaRecorder;
// let recordedBlobs;

// const codecPreferences = document.querySelector('#codecPreferences');

// const errorMsgElement = document.querySelector('span#errorMsg');
// const recordedVideo = document.querySelector('video#recorded');
// const recordButton = document.querySelector('button#record');
// recordButton.addEventListener('click', () => {
//   if (recordButton.textContent === 'Start Recording') {
//     startRecording();
//   } else {
//     stopRecording();
//     recordButton.textContent = 'Start Recording';
//     playButton.disabled = false;
//     downloadButton.disabled = false;
//     codecPreferences.disabled = false;
//   }
// });

// const playButton = document.querySelector('button#play');
// playButton.addEventListener('click', () => {
//   const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value.split(';', 1)[0];
//   const superBuffer = new Blob(recordedBlobs, {type: mimeType});
//   recordedVideo.src = null;
//   recordedVideo.srcObject = null;
//   recordedVideo.src = window.URL.createObjectURL(superBuffer);
//   recordedVideo.controls = true;
//   recordedVideo.play();
// });

// const downloadButton = document.querySelector('button#download');
// downloadButton.addEventListener('click', () => {
//   const blob = new Blob(recordedBlobs, {type: 'video/webm'});
//   const url = window.URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.style.display = 'none';
//   a.href = url;
//   a.download = 'test.webm';
//   document.body.appendChild(a);
//   a.click();
//   setTimeout(() => {
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);
//   }, 100);
// });

// function handleDataAvailable(event) {
//   console.log('handleDataAvailable', event);
//   if (event.data && event.data.size > 0) {
//     recordedBlobs.push(event.data);
//   }
// }

// function getSupportedMimeTypes() {
//   const possibleTypes = [
//     'video/webm;codecs=vp9,opus',
//     'video/webm;codecs=vp8,opus',
//     'video/webm;codecs=h264,opus',
//     'video/mp4;codecs=h264,aac',
//   ];
//   return possibleTypes.filter(mimeType => {
//     return MediaRecorder.isTypeSupported(mimeType);
//   });
// }

// function startRecording() {
//   recordedBlobs = [];
//   const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value;
//   const options = {mimeType};

//   try {
//     mediaRecorder = new MediaRecorder(window.stream, options);
//   } catch (e) {
//     console.error('Exception while creating MediaRecorder:', e);
//     errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
//     return;
//   }

//   console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
//   recordButton.textContent = 'Stop Recording';
//   playButton.disabled = true;
//   downloadButton.disabled = true;
//   codecPreferences.disabled = true;
//   mediaRecorder.onstop = (event) => {
//     console.log('Recorder stopped: ', event);
//     console.log('Recorded Blobs: ', recordedBlobs);
//   };
//   mediaRecorder.ondataavailable = handleDataAvailable;
//   mediaRecorder.start();
//   console.log('MediaRecorder started', mediaRecorder);
// }

// function stopRecording() {
//   mediaRecorder.stop();
// }

// function handleSuccess(stream) {
//   recordButton.disabled = false;
//   console.log('getUserMedia() got stream:', stream);
//   window.stream = stream;

//   const gumVideo = document.querySelector('video#gum');
//   gumVideo.srcObject = stream;

//   getSupportedMimeTypes().forEach(mimeType => {
//     const option = document.createElement('option');
//     option.value = mimeType;
//     option.innerText = option.value;
//     codecPreferences.appendChild(option);
//   });
//   codecPreferences.disabled = false;
// }

// async function init(constraints) {
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia(constraints);
//     handleSuccess(stream);
//   } catch (e) {
//     console.error('navigator.getUserMedia error:', e);
//     errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
//   }
// }

// document.querySelector('button#start').addEventListener('click', async () => {
//   document.querySelector('button#start').disabled = true;
//   const hasEchoCancellation = document.querySelector('#echoCancellation').checked;
//   const constraints = {
//     audio: {
//       echoCancellation: {exact: hasEchoCancellation}
//     },
//     video: {
//       width: 1280, height: 720
//     }
//   };
//   console.log('Using media constraints:', constraints);
//   await init(constraints);
// });


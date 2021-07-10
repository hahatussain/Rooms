# Rooms
MS Teams clone developed during Microsoft Engage 2021. 
Deployed at - https://rooms-engage.herokuapp.com

Working demo - https://youtu.be/_dJfUqXqVZM

# List of extra features:
1. Multiple user connectivity (WebRTC can handle upto a million users, so no real limit applicable).
2. Audio toggle-mute/unmute mic.
3. Video toggle.
4. Custom user names.
5. Text messaging with other members, with the username being your display name.
6. Notification when someone joins/leaves.
7. Invite button functionality-automatically copies room link to clipboard.
8. Raise hand functionality-send raised hand emoji with just one click, so as to not disrupt the flow of the conversation. 

# To run locally:
1. Download this repository.
2. Run npm i and then npm start in the terminal inside the project directory.
3. Open localhost:3030 to view app.

# Dependencies:
1. ejs
2. express
3. peer
4. peerjs
5. socket.io
6. uuid (to generate unique links)

# Agile methodology followed:
1. Created a signalling server. Then rendered an html document on the server.
2. Built a basic chat application using socket.io documentation, by making few additions to the html doc.
3. Added audio-video functionality, by making additions to server.js, the html doc and script.js. Followed the WebRTC documentation to implement audio-video streaming.
4. Styled the html doc by creating style.css. 
5. Add-on features like audio/video toggle, invite button, raise hand button, custom usernames and the leave button, were all made in the last phase with minimal changes made to the existing code.

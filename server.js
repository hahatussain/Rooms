const express = require("express");
const app = express();
const server = require("http").Server(app);
//app.set("view engine", "ejs");
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
server.listen(3030);
// Core Modules
const path = require("path");
const http = require("http");
// Third-Party
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "../public");

// Setup the Public Directory for static data
app.use(express.static(publicDir));

io.on("connection", (socket) => {
    console.log("New Web Socket connection.");

    // Welcoming message to user
    socket.emit("message", "Welcome!");
    // Informing other users of new user joining
    socket.broadcast.emit("message", "A new user has joined the chatroom!");

    // Send message to all users
    socket.on("sendMessage", (msg) => {
        io.emit("message", msg);
    });

    // Send location to all users
    socket.on("sendLocation", (coords) => {
        io.emit("message", `https://google.com/maps?q=${coords.latitude},${coords.longitude}`);
    })

    // Notify that a user left the chatroom
    socket.on("disconnect", () => {
        io.emit("message", "A user has left.");
    });
});

server.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});

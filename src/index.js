// Core Modules
const path = require("path");
const http = require("http");
// Third-Party
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
// Custom Scripts
const { generateMessage, generateLocation } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users")

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "../public");

// Setup the Public Directory for static data
app.use(express.static(publicDir));

io.on("connection", (socket) => {
    console.log("New Web Socket connection.");

    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        // Welcoming message to user
        socket.emit("message", generateMessage("Admin", "Welcome!"));
        // Informing other users of new user joining
        socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has join the room!`));
        // Send room data to all users
        io.to(user.room).emit("roomData",  {
            room: user.room,
            users: getUsersInRoom(user.room),
        });

        callback();
    })

    // Send message to all users
    socket.on("sendMessage", (msg, callback) => {
        const user = getUser(socket.id);
        if (user) {
            const filter = new Filter();

            if (filter.isProfane(msg)) {
                return callback("The message was Censored. Profanity is not allowed.");
            }
    
            io.to(user.room).emit("message", generateMessage(user.username, msg));
            callback();
        }        
    });

    // Send location to all users
    socket.on("sendLocation", (coords, callback) => {
        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit("locationMessage", generateLocation(user.username, coords));
            callback();
        }
    })

    // Notify that a user left the chatroom
    socket.on("disconnect", () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left the room.`));
            
            io.to(user.room).emit("roomData",  {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    });
});

server.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});

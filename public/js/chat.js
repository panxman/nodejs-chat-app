const socket = io();

socket.on("message", (msg) => {
    console.log("Message from server:", msg);
});

document.querySelector("#chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    
    const msg = e.target.elements.message.value;
    socket.emit("sendMessage", msg, (error) => {
        if (error) {
            return console.log(error);
        }

        console.log("Message Delivered");   
    });

    e.target.elements.message.value = "";
});

document.querySelector("#send-location-btn").addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.");
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }, () => {
            console.log("Location shared");
        });
    });
});

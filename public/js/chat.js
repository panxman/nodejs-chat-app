const socket = io();

// Elements
const $messageForm = document.querySelector("#chat-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location-btn");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;

socket.on("message", (message) => {
    console.log("Message from server:", message);
    const html = Mustache.render(messageTemplate, {
        message,
    });
    $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (url) => {
    console.log(url);
    const html = Mustache.render(locationTemplate, {
        url,
    });
    $messages.insertAdjacentHTML("beforeend", html);
})

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Disable submit button
    $messageFormButton.setAttribute("disabled", "disabled");
    
    const msg = $messageFormInput.value;
    socket.emit("sendMessage", msg, (error) => {
        // Enabled button again
        $messageFormButton.removeAttribute("disabled");
        if (error) {
            return console.log(error);
        }

        console.log("Message Delivered");   
    });

    $messageFormInput.value = "";
    $messageFormInput.focus();
});

$sendLocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.");
    }
    // Disable button while location is loading
    $sendLocationButton.setAttribute("disabled", "disabled");
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }, () => {
            // Re-enable button
            $sendLocationButton.removeAttribute("disabled");
            console.log("Location shared");
        });
    });
});

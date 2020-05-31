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
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Option
const { username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    // Adding +1 to the scrollOffset because of some decimal calcuations
    if (containerHeight - newMessageHeight <= scrollOffset + 1) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on("message", (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm A"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});

socket.on("locationMessage", (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format("h:mm A"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
    });
    document.querySelector("#sidebar").innerHTML = html;
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
        });
    });
});

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});

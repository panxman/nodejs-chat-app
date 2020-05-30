const generateMessage = (text) => {
    return {
        text,
        createdAt: new Date().getTime(),
    };
};

const generateLocation = (coords) => {
    return {
        url: `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
        createdAt: new Date().getTime(),
    }
}

module.exports = {
    generateMessage,
    generateLocation,
}
const users = [];

// Add new User
const addUser = ({ id, username, room }) => {
  // Clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate data
  if (!username || !room) {
    return {
      error: "Username and room are required.",
    };
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: "Username is in use for this room.",
    };
  }

  // Store user
  const user = { id, username, room }
  users.push(user);

  return { user };
};

// Remove User
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

// Get User data
const getUser = (id) => {
    return users.find((user) => user.id === id);
};

// Get users in a room
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
}

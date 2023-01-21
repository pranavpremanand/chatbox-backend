const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoute");
const mongoose = require("mongoose");
require("dotenv").config();
const { createServer } = require("http");
const { Server } = require("socket.io");

mongoose.connect(process.env.MONGO_URL);
const connection = mongoose.connection;
connection
  .on("connected", () => console.log("Database is connected successfully!"))
  .on("error", (err) => console.log("Database connection failed!", err));

app.use(
  cors({
    origin: ["https://chatboxonline.netlify.app", "http://localhost:3000"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());
// const port = "5000";
// app.listen(port, () => console.log("Server is running on port:", port));

app.use("/user", userRoute);
app.use("/user/chat", chatRoute);
app.use("/user/message", messageRoute);
app.use("/admin", adminRoute);
// app.use('*',(req,res)=>res.send('No route found!'))

//Socket setup
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    // origin: "http://localhost:3000",
    origin: ["https://chatboxonline.netlify.app", "http://localhost:3000"],
  },
});

// app.options('*',cors())
// app.use(cors())

let activeUsers = [];

io.on("connection", (socket) => {
  //add new user
  socket.on("new-user-add", (newUserId) => {
    // if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id,
      });
    }
    console.log("Connected users", activeUsers);
    io.emit("get-users", activeUsers);
  });

  //Send message
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    console.log("Sending from socket to: ", receiverId);
    console.log("Data ", data, user);
    if (user) {
      io.to(user.socketId).emit("receive-message", data);
    }
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User disconnected", activeUsers);
    io.emit("get-users", activeUsers);
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on port: ${process.env.PORT}`);
});

module.exports = app;

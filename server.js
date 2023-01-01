const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require('./routes/messageRoute')
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URL);
const connection = mongoose.connection;
connection
  .on("connected", () => console.log("Database is connected successfully!"))
  .on("error", (err) => console.log("Database connection failed!", err));

app.use(cors());
app.use(cookieParser());
app.use(express.json());
const port = "5000";
app.listen(port, () => console.log("Server is running on port:", port));

app.use("/user", userRoute);
app.use("/user/chat", chatRoute);
app.use('/user/message',messageRoute)
app.use("/admin", adminRoute);
// app.use('*',(req,res)=>res.send('No route found!'))

module.exports = app;

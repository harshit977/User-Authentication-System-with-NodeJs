require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// my routes
const userRoutes = require('./routes/user');
const protectedRoute= require('./routes/protected');

//DB Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
mongoose.Promise = global.Promise;

//My Routes
app.use("/user",userRoutes);
app.use("/home",protectedRoute);

app.use("/",(req,res)=>{                 //default route
  res.send("Welcome to User Authentication System !!");
})

const port = process.env.PORT || 8000;

//Starting a server
app.listen(port, () => {
  console.log(`App is running at port ${port} !!`);
});
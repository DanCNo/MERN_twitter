const mongoose = require("mongoose");

const express = require("express");
const app = express();
const db = require("./config/keys").mongoURI;

const users = require("./routes/api/users");
const tweets = require("./routes/api/tweets");

const bodyParser = require("body-parser");

const passport = require("./config/passport")("passport");

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log(err));

app.use(passport.initialize());

app.use("/api/users", users);
app.use("/api/tweets", tweets);

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

const port = process.env.Port || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));


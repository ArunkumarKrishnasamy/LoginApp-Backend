const express = require("express");
const app = express();

const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const URL =
  "mongodb+srv://login_app:admin123@cluster0.u4hai.mongodb.net/?retryWrites=true&w=majority";

app.get("/", async (req, res) => {
  try {
    // open the connection
    const connection = await mongoClient.connect(URL);
    // Select the DB
    let db = connection.db("practice");
    // Select the collection
    let users = await db.collection("users").find().toArray();
    // Close the connection
    await connection.close();

    console.log("mongoDB connected");
    res.json(users);
  } catch (error) {
    res.status(500).json({ Message: "Something Went Wrong" });
  }
});
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
app.post("/register", async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db("practice");
    req.body.createdBy = req.userId;
    await db.collection("users").insertOne(req.body);
    let salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hash;
    await connection.close();
    console.log("mongoDB connected");
    res.json({ message: "User Added" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/login", async (req, res) => {
  try {
    // open the connection
    let connection = await mongoClient.connect(URL);
    // select the db
    let db = connection.db("practice");
    // fetch user with email id from DB
    let user = await db.collection("users").findOne({ email: req.body.email });
    if (user) {
      // if user given password is == user password in db
      let compare = bcrypt.compareSync(req.body.password, user.password);
      if (req.body.password === user.password) {
        // Generate JWT token
        let token = jwt.sign({ email: user.email }, "thisisasecretkey");
        res.json({ token });
      } else {
        res.status(500).json({ message: "Credientials does not match" });
      }
    } else {
      res.status(401).json({ message: "No user found" });
    }
    // if no?
    // throw err user not found
    // if yes?
    await connection.close();
    // close the connection
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log("Web Server Started");
});

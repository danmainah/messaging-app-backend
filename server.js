import express from "express";
import mongoose from "mongoose";
import Cors from "cors";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
//App Config
const app = express();
const port = process.env.PORT || 9000;
const connection_url =
  "mongodb+srv://messaging-app:Gbq4Gu6yNMd4F_x@cluster0.xifweiv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const pusher = new Pusher({
  appId: "1770914",
  key: "af27ca8507d496db2ade",
  secret: "b4d221ea7866a52e1091",
  cluster: "eu",
  useTLS: true,
});
// Middleware
app.use(express.json());
app.use(Cors());
//DB Config
const db = mongoose.connection;
db.once("open", () => {
  console.log("DB Connected");
  const msgCollection = db.collection("messagingmessages");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    console.log(change);
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
      132;
    } else {
      console.log("Error trigerring Pusher");
    }
  });
});
mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//API Endpoints
app.get("/", (req, res) => res.status(200).send("Hello TheWebDev"));
app.post("/messages/new", async (req, res) => {
  const dbMessage = req.body;
  try {
    const data = await Messages.create(dbMessage);
    res.status(201).send(data);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/messages/sync", async (req, res) => {
  try {
    const data = await Messages.find();
    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Listener
app.listen(port, () => console.log(`Listening on localhost: ${port}`));

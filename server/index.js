import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";

import Connection from "./database/db.js";
import {
  getDocument,
  updateDocument,
} from "./controller/documentController.js";

dotenv.config();
const PORT = process.env.PORT || 9000;
const URL = process.env.MONGODB_URI;

const app = express();
app.use(cors());

const httpServer = createServer(app);

Connection(URL);

const io = new Server(httpServer, {
  cors: {
    origin: "https://sameepvishwakarmadocs.netlify.app", 
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`connection successfull with socket id : ${socket.id}`);

  socket.on("get-document", async (documentId) => {
    // const data = "";
    const document = await getDocument(documentId);

    socket.join(documentId);

    socket.emit("load-document", document.data); // sending data feched by database

    socket.on("send-changes", (delta) => {
      // console.log(delta);
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await updateDocument(documentId, data);
    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`server is running successfully on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Docs Editor app backend-server !!!')
})

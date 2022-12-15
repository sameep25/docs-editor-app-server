import { Server } from "socket.io";
import dotenv from "dotenv" ;

import Connection from "./database/db.js";
import { getDocument ,updateDocument } from "./controller/documentController.js";

dotenv.config() ;

const PORT = process.env.PORT  || 9000;
const URL = process.env.MONGODB_URI ;
Connection(URL);

const io = new Server(PORT, {
  cors: {
    origin: "http://localhost:3000",
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

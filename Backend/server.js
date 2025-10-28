require('dotenv').config()
const app = require("./src/app");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const generateResponse = require('./src/service/ai.service')

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "https://myaiassistent.vercel.app",
  }
});


io.on("connection", async (socket) => {
  console.log("a user connected:", socket.id);
  chatHistory = []
  
  socket.on("ai-message", async(data) => {
  console.log(data);

    chatHistory.push({
      role: 'user',
      parts: [ {text: data} ]
    })
    const response = await generateResponse(chatHistory)

     chatHistory.push({
      role: 'model',
      parts: [ {text: response} ]
    })
     socket.emit("ai-response", { response })
  

  });

});

httpServer.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

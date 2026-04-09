const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("Пользователь подключился:", socket.id);

    socket.emit("Сообщение от сервера:", "соединение установлено.")

    socket.on("disconnect", () => {
        console.log("Пользователь отключился");
    });
});

server.listen(5000, () => {
    console.log("Сервер запущен на порте: 5000");
});

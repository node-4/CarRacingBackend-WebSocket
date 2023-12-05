const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const compression = require("compression");
const serverless = require("serverless-http");
const WebSocket = require("ws");
const app = express();
const path = require("path");
app.use(compression({ threshold: 500 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const server = app.listen(process.env.PORT, () => {
        console.log(`Express server listening on port ${process.env.PORT}`);
});
const wss = new WebSocket.Server({ noServer: true });
wss.on("request", (request) => {
        const connection = request.accept('', request.origin);
        connection.on("message", (data) => {
                var type = JSON.parse(data.utf8Data);
                if (type.requestType === "guestBattle") {
                        connection.sendUTF(guestBattle({ userName: type.userName }));
                }
        });

        async function guestBattle(data) {
                if (connection.connected) {
                        let result = await chatController.guestBattle1(data);
                        if (result) {
                                var resultData = JSON.stringify(result.result);
                                console.log("server.js 658=== give response=>");
                                return connection.sendUTF(resultData);
                        }
                        setTimeout(() => {
                                guestBattle(data)
                        }, 3000);
                }
        }


















        connection.on("close", () => {
                console.log("WebSocket connection closed.");
        });
        connection.on('connectFailed', function (error) {
                console.log('Connect Error: ' + error.toString());
        });
});
server.on("upgrade", (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit("connection", ws, request);
        });
});
app.get("/", (req, res) => {
        res.send("Hello World!");
});
require('./routes/userRoutes')(app);
require('./routes/adminRoute')(app);
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_URI).then((data) => {
        console.log(`Mongodb connected with server: ${data.connection.host} : carRacing`);
});

module.exports = { handler: serverless(app) };
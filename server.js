const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const compression = require("compression");
const WebSocket = require("ws");
const serverless = require("serverless-http");

const app = express();
const server = app.listen(process.env.PORT, () => {
        console.log(`Express server listening on port ${process.env.PORT}`);
});

const wss = new WebSocket.Server({ noServer: true });
wss.on("connection", (ws, request) => {
        console.log(new Date() + ' Peer ' + request.connection.remoteAddress + ' Client has connected.');
        ws.isAlive = true;
        ws.on('pong', () => {
                ws.isAlive = true;
        });
        ws.on("message", (data) => {
                try {
                        const dataString = Buffer.isBuffer(data) ? data.toString('utf8') : data;
                        console.log("Raw Data:", dataString);
                        if (/^\s*[\[{]/.test(dataString) && /[\]}]\s*$/.test(dataString)) {
                                const type = JSON.parse(dataString);
                                console.log("Received JSON", type);
                        } else {
                                console.log("Received non-JSON data");
                        }
                } catch (error) {
                        console.error("Error parsing data:", error.message);
                }
        });
        ws.on("close", () => {
                console.log("WebSocket connection closed.");
        });
        ws.on('error', (error) => {
                console.log('WebSocket Error: ' + error.toString());
        });
});

const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
                if (ws.isAlive === false) {
                        console.log('Terminating WebSocket connection due to lack of pong response.');
                        return ws.terminate();
                }
                ws.isAlive = false;
                ws.ping('', false, true);
        });
}, 30000);
server.on("upgrade", (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit("connection", ws, request, {});
        });
});
process.on('SIGINT', () => {
        clearInterval(interval);
        wss.close(() => {
                console.log('WebSocket server closed gracefully.');
                process.exit(0);
        });
});
app.use(compression({ threshold: 500 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
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

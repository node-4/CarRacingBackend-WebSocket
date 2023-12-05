import express from "express";
import Mongoose from "mongoose";
import * as http from "http";
import * as path from "path";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import WebSocket from "websocket";
const roomModel = require('../models/room');
import userController from "../api/v1/controllers/user/controller";
import userModel from "../models/user";
import apiErrorHandler from "../helper/apiErrorHandler";
import socket from "socket.io";
import chatController from "../api/v1/controllers/chat/chatController";
const app = new express();
const server = http.createServer(app);
const io = socket(server);
const root = path.normalize(`${__dirname}/../..`);
const WebSocketServer = WebSocket.server;
const WebSocketClient = WebSocket.client;
const client = new WebSocketClient();
const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
  maxReceivedFrameSize: 64 * 1024 * 1024, // 64MiB
  maxReceivedMessageSize: 64 * 1024 * 1024, // 64MiB
  fragmentOutgoingMessages: false,
  keepalive: false,
  disableNagleAlgorithm: false,
});

class ExpressServer {
  constructor() {
    app.use(express.json({ limit: "1000mb" }));

    app.use(express.urlencoded({ extended: true, limit: "1000mb" }));

    app.use(morgan("dev"));

    app.use(
      cors({
        allowedHeaders: ["Content-Type", "token", "authorization"],
        exposedHeaders: ["token", "authorization"],
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
      })
    );
  }
  router(routes) {
    routes(app);
    return this;
  }
  configureSwagger(swaggerDefinition) {
    const options = {
      // swaggerOptions : { authAction :{JWT :{name:"JWT", schema :{ type:"apiKey", in:"header", name:"Authorization", description:""}, value:"Bearer <JWT>"}}},
      swaggerDefinition,
      apis: [
        path.resolve(`${root}/server/api/v1/controllers/**/*.js`),
        path.resolve(`${root}/api.yaml`),
      ],
    };
    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerJSDoc(options))
    );
    app.get("/postman-collection", function (req, res) {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerJSDoc(options));
    });
    return this;
  }
  handleError() {
    app.use(apiErrorHandler);

    return this;
  }
  configureDb(dbUrl) {
    return new Promise((resolve, reject) => {
      Mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, }, (err) => {
        if (err) {
          console.log(`Error in mongodb connection ${err.message}`);
          return reject(err);
        }
        console.log("Mongodb connection established");
        return resolve(this);
      }
      );
    });
  }
  listen(port) {
    server.listen(port, () => {
      console.log(`secure app is listening @port ${port}`);
    });
    return server;
  }
}



wsServer.on('request', function (request) {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }
  const connection = request.accept('', request.origin);
  console.log(new Date() + ' Peer ' + connection.remoteAddress + ' Client has connected.');

  connection.on('message', function (message) {
    var type = JSON.parse(message.utf8Data);
    console.log("type===>>", type)
    ///////////////////////////////////////////////////////////////////// Guest Battle all event start /////////////////////////////////////////////////////////////
    if (type.requestType === "guestBattle") {
      connection.sendUTF(guestBattle({ userName: type.userName }));
    }
    if (type.requestType === "startGbattle") {
      connection.sendUTF(startGbattle1({ battleId: type.battleId, userId: type.userId, pokemonId: type.pokemonId, moves: type.moves }));
    }
    if (type.requestType === "selectPokemon") {
      connection.sendUTF(selectPokemon({ userId: type.userId, pokemonId: type.pokemonId }));
    }
    if (type.requestType === "battleDetails") {
      connection.sendUTF(battleDetails({ battleId: type.battleId}));
    }
    if (type.requestType === "oneToOneChat") {
      connection.sendUTF(oneToOneChat({ senderId: type.senderId, Type: type.Type, message: type.message, battleId: type.battleId }));
    }
    if (type.requestType === "leftBattle") {
      connection.sendUTF(leftBattle({ userId: type.userId, battleId: type.battleId}));
    }
    ///////////////////////////////////////////////////////////////////// Guest Battle all event end  /////////////////////////////////////////////////////////////

    if (type.requestType === "OnlineUser") {
      console.log("535==", type.requestType);
      connection.sendUTF(OnlineUser({ userId: type.userId }));
    }
    if (type.requestType === "CreateRoom") {
      connection.sendUTF(CreateRoom({ ownerId: type.ownerId, roomName: type.roomName }));
    }
    if (type.requestType === "joinRoom") {
      connection.sendUTF(joinRoom({ member: type.member, roomId: type.roomId }));
    }
    if (type.requestType === "randomBattle") {
      connection.sendUTF(randomBattle({ member: type.member, roomId: type.roomId }));
    }
    if (type.requestType === "startBattle") {
      connection.sendUTF(startBattle({ battleId: type.battleId, userId: type.userId, pokemonId: type.pokemonId, moves: type.moves }));
    }
    if (type.requestType === "viewRoom") {
      connection.sendUTF(viewRoom({ roomId: type.roomId }));
    }
    if (type.requestType === "deleteRoom") {
      connection.sendUTF(deleteRoom({ roomId: type.roomId }));
    }
    if (type.requestType === "roomList") {
      connection.sendUTF(roomList());
    }
  });
  ///////////////////////////////////////////////////////////////////// Guest Battle all Function start /////////////////////////////////////////////////////////////
  async function guestBattle(data) {
    if (connection.connected) {
      let result = await chatController.guestBattle1(data);
      // console.log("server.js 655====>", result);
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
  async function startGbattle1(data) {
    if (connection.connected) {
      let result = await chatController.startGbattle1(data);
      // console.log("server.js 721====>", result);
      if (result) {
        var resultData = JSON.stringify(result.result);
        console.log("server.js 724== give response==>");
        connection.sendUTF(resultData);
      }
    }
  }
  async function selectPokemon(data) {
    if (connection.connected) {
      let result = await chatController.selectPokemon(data);
      console.log("server.js 732====>", result);
      if (result) {
        var resultData = JSON.stringify(result.result);
        console.log("server.js 735=== give response=>");
        connection.sendUTF(resultData);
      }
    }
  }
  async function battleDetails(data) {
    if (connection.connected) {
      let result = await chatController.battleDetails(data);
      // console.log("server.js 743====>", result);
      if (result) {
        var resultData = JSON.stringify(result);
        console.log("server.js 746=== give response====>");
        connection.sendUTF(resultData);
      }
      setTimeout(() => {
        battleDetails(data)
      }, 1000);
    }
  }
  async function oneToOneChat(data) {
    if (connection.connected) {
      let result = await chatController.oneToOneChat(data);
      console.log("server.js 710====>", result);
      if (result) {
        var resultData = JSON.stringify(result.result);
        console.log("server.js 713====>");
        connection.sendUTF(resultData);
      }
    }
  }
  async function leftBattle(data) {
    if (connection.connected) {
      let result = await chatController.leftBattle(data);
      // console.log("server.js 710====>", result);
      if (result) {
        var resultData = JSON.stringify(result.result);
        console.log("server.js 648====>");
        connection.sendUTF(resultData);
      }
    }
  }
  ///////////////////////////////////////////////////////////////////// Guest Battle all Function end  /////////////////////////////////////////////////////////////
  async function CreateRoom(data) {
    if (connection.connected) {
      let result = await chatController.createRoom(data);
      console.log("562====>", result);
      if (result) {
        var resultData = JSON.stringify(result.result);
        console.log("565====>", resultData);
        connection.sendUTF(resultData);
      }
    }
  }
  async function joinRoom(data) {
    if (connection.connected) {
      let result = await chatController.joinRoom(data);
      console.log("573====>", result);
      if (result) {
        var resultData = JSON.stringify(result.result);
        console.log("576====>", resultData);
        connection.sendUTF(resultData);
      }
    }
  }
  async function randomBattle(data) {
    if (connection.connected) {
      let result = await chatController.randomBattle(data);
      console.log("584====>", result);
      if (result) {
        var resultData = JSON.stringify(result.result);
        console.log("587====>", resultData);
        connection.sendUTF(resultData);
      }
    }
  }
  async function startBattle(data) {
    if (connection.connected) {
      let result = await chatController.startBattle(data);
      console.log("595====>", result);
      if (result) {
        var resultData = JSON.stringify(result.result);
        console.log("598====>", resultData);
        connection.sendUTF(resultData);
      }
    }
  }
  async function viewRoom(data) {
    if (connection.connected) {
      let result = await chatController.viewRoom(data);
      console.log("606====>", result);
      if (result) {
        var resultData = JSON.stringify(result.result);
        console.log("609====>", resultData);
        connection.sendUTF(resultData);
      }
    }
  }
  async function deleteRoom(data) {
    if (connection.connected) {
      let result = await chatController.deleteRoom(data);
      console.log("617====>", result);
      if (result) {
        var resultData = JSON.stringify(result.result);
        console.log("620====>", resultData);
        connection.sendUTF(resultData);
      }
    }
  }
  async function roomList() {
    if (connection.connected) {
      let result = await chatController.roomList();
      console.log("628====>", result);
      if (result) {
        var resultData = JSON.stringify(result.result);
        console.log("631====>", resultData);
        connection.sendUTF(resultData);
      }
    }
  }
  async function OnlineUser(data) {
    console.log(data);
    if (connection.connected) {
      var userResult = await userModel.findOne({ _id: data.userId });
      if (onlineUsers.length > 0) {
        // onlineUsers = JSON.stringify(onlineUsers);
        onlineUsers = JSON.parse(onlineUsers)
        console.log(onlineUsers, "===", typeof onlineUsers)

        let check = onlineUsers.findIndex((x) => x.userId === data.userId);
        console.log("check=====264====", check);
        if (check >= 0) {
          console.log("previous record", onlineUsers[check]);
          data.status = "ONLINE";
          onlineUsers[check] = data;
        } else {
          console.log("new record", check, data);
          data.status = "ONLINE";
          onlineUsers.push(data);
          console.log("after insert record", onlineUsers);
          onlineUsers = JSON.stringify(onlineUsers)
          await connection.sendUTF(onlineUsers.toString());
        }
      } else {
        var userResult = await userModel.findOne({ _id: data.userId });
        let newUser = {
          userId: data.userId,
          status: "ONLINE",
        };
        console.log("data", data);
        console.log(" new userId===>", data, newUser);
        onlineUsers.push(newUser);
        onlineUsers = JSON.stringify(onlineUsers)
        console.log(onlineUsers);
        await connection.sendUTF(onlineUsers.toString());

      }
    }
  }


  //******************************************************************************************/
  connection.on('close', function (reasonCode, description) {
    console.log(new Date() + ' Peer ' + connection.remoteAddress + ' Client has disconnected.');
  });
  connection.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
  });
});

client.on('connect', function (connection) {
  console.log(new Date() + ' WebSocket Client Connected');
  connection.sendUTF(new Date() + ' WebSocket Client Connected');
  connection.on('error', function (error) {
    console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function () {
    console.log('echo-protocol Connection Closed');
  });
});

// client.connect('ws://localhost:3032/', '');
// client.connect('ws://172.16.11.246:3032/', '');
// client.connect('ws://182.72.203.245:1886/', '');
client.connect('ws://briad-pockemon.mobiloitte.com/', '');


export default ExpressServer;

function originIsAllowed(origin) {
  return true;
}

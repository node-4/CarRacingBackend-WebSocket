const express = require("express");
const auth = require("../controller/usercontroller");
const router = express.Router();
const authJwt = require("../middleware/authJwt");
module.exports = (app) => {
        app.post("/api/v1/user/login", auth.loginUser);
        app.post("/api/v1/user/socialLogin", auth.socialLogin);
        app.post("/api/v1/user/verify/otp", auth.verifyOtplogin);
        app.get("/api/v1/user/me", authJwt.verifyToken, auth.getUserDetails)
        app.put("/api/v1/user/me", authJwt.verifyToken, auth.updateUserDetails)
        app.post("/api/v1/user/createRace", authJwt.verifyToken, auth.createRace)
        app.get("/api/v1/race/getRace", auth.getRace);
        app.get("/api/v1/race/getRaceByid/:id", auth.getRaceByid);
        app.put("/api/v1/race/raceStart/:id", auth.raceStart);
        app.put("/api/v1/race/raceCompleted/:id", authJwt.verifyToken, auth.raceCompleted);
        app.post("/api/v1/bet/bets", authJwt.verifyToken, auth.addBets);
        app.get("/api/v1/user/thisWeek", authJwt.verifyToken, auth.thisWeek)
        app.get("/api/v1/user/lastWeek", authJwt.verifyToken, auth.lastWeek)
        app.post("/api/v1/bet/updatewinningbet", authJwt.verifyToken, auth.updatewinningbet);
        app.get("/api/carwiseWinners/:date", auth.carwisewinningamountondate);
        app.get("/api/carwisewinningamountondatebyToken/:date", authJwt.verifyToken, auth.carwisewinningamountondatebyToken);
        app.get("/api/carondate", auth.carondate);
        app.get("/api/v1/Bet/getBet/:raceId", authJwt.verifyToken, auth.getBet);
}
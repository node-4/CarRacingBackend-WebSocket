const auth = require("../controller/adminController");
const authJwt = require("../middleware/authJwt");
const { upload } = require('../middleware/imageupload')
module.exports = (app) => {
        app.post("/api/v1/admin/registration", auth.registration);
        app.post("/api/v1/admin/signin", auth.signin);
        app.get("/api/v1/admin/me", authJwt.verifyToken, auth.getUserDetails)
        app.post("/api/v1/car/createCar", upload.single('image'), [authJwt.verifyToken], auth.createCar);
        app.get("/api/v1/car/allCar", auth.getCar);
        app.put("/api/v1/car/updateCar/:id", upload.single('image'), [authJwt.verifyToken], auth.updateCar);
        app.delete("/api/v1/car/removeCar/:id", [authJwt.verifyToken], auth.removeCar)
        app.post("/api/v1/track/createTrack", upload.single('image'), [authJwt.verifyToken], auth.createTrack);
        app.get("/api/v1/track/allTrack", auth.getTrack);
        app.put("/api/v1/track/updateTrack/:id", upload.single('image'), [authJwt.verifyToken], auth.updateTrack);
        app.delete("/api/v1/track/removeTrack/:id", [authJwt.verifyToken], auth.removeTrack)
        app.post("/api/v1/speed/createSpeed", [authJwt.verifyToken], auth.createSpeed);
        app.get("/api/v1/speed/getSpeed", auth.getSpeed);
        app.put("/api/v1/speed/updateSpeed/:id", [authJwt.verifyToken], auth.updateSpeed);
        app.delete("/api/v1/speed/removeSpeed/:id", [authJwt.verifyToken], auth.removeSpeed)
        app.get("/api/v1/admin/getRace", auth.getRace);
        app.get("/api/v1/admin/getBet", auth.getBet);
        // app.post("/api/v1/speed/createSpeedForAll", auth.createSpeedForAll);

}
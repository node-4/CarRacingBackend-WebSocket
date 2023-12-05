const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Car = require("../model/car");
const Track = require("../model/track");
const Speed = require("../model/speed")
const Race = require("../model/race");
const Bet = require("../model/bets");
exports.registration = async (req, res) => {
        const { phone, email } = req.body;
        try {
                req.body.email = email.split(" ").join("").toLowerCase();
                let user = await User.findOne({ $and: [{ $or: [{ email: req.body.email }, { phone: phone }] }], userType: "Admin" });
                if (!user) {
                        req.body.password = bcrypt.hashSync(req.body.password, 8);
                        req.body.userType = "Admin";
                        req.body.accountVerification = true;
                        const userCreate = await User.create(req.body);
                        return res.status(200).send({ message: "registered successfully ", data: userCreate, });
                } else {
                        return res.status(409).send({ message: "Already Exist", data: [] });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.signin = async (req, res) => {
        try {
                const { email, password } = req.body;
                const user = await User.findOne({ email: email, userType: "Admin" });
                if (!user) {
                        return res
                                .status(404)
                                .send({ message: "user not found ! not registered" });
                }
                const isValidPassword = bcrypt.compareSync(password, user.password);
                if (!isValidPassword) {
                        return res.status(401).send({ message: "Wrong password" });
                }
                const accessToken = await jwt.sign({ id: user._id }, 'node5flyweis', { expiresIn: '365d', });
                let obj = {
                        fullName: user.fullName,
                        firstName: user.fullName,
                        lastName: user.lastName,
                        mobileNumber: user.mobileNumber,
                        email: user.email,
                        userType: user.userType,
                }
                return res.status(201).send({ data: obj, accessToken: accessToken });
        } catch (error) {
                console.error(error);
                return res.status(500).send({ message: "Server error" + error.message });
        }
};
exports.getUserDetails = async (req, res) => {
        try {
                const user = await User.findById(req.user._id);
                if (!user) {
                        return res.status(404).send({ status: 404, message: "user not found ", data: {}, });
                } else {
                        return res.status(200).send({ status: 200, message: "get profile ", data: user, });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.createCar = async (req, res) => {
        try {
                let findCar = await Car.findOne({ name: req.body.name });
                if (findCar) {
                        return res.status(409).json({ message: "Car already exit.", status: 404, data: {} });
                } else {
                        if (req.file) {
                                req.body.image = req.file.path
                        } else {
                                return res.status(404).json({ message: "First Chosse an image.", status: 404, data: {} });
                        }
                        const data = { name: req.body.name, odds: req.body.odds, victory: req.body.victory, image: req.body.image };
                        const car = await Car.create(data);
                        return res.status(200).json({ message: "Car add successfully.", status: 200, data: car });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getCar = async (req, res) => {
        try {
                const car = await Car.find({});
                return res.status(201).json({ success: true, car, });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.updateCar = async (req, res) => {
        try {
                const { id } = req.params;
                const car = await Car.findById(id);
                if (!car) {
                        return res.status(404).json({ message: "Car Not Found", status: 404, data: {} });
                }
                if (req.file) {
                        car.image = req.file.path;
                } else {
                        car.image = car.image;
                }
                car.name = req.body.name;
                car.odds = req.body.odds;
                car.victory = req.body.victory;
                let update = await car.save();
                return res.status(200).json({ message: "Updated Successfully", status: 200, data: update });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.removeCar = async (req, res) => {
        const { id } = req.params;
        try {
                const car = await Car.findById(id);
                if (!car) {
                        return res.status(404).json({ message: "Car Not Found", status: 404, data: {} });
                } else {
                        await Car.findByIdAndDelete(car._id);
                        return res.status(200).json({ message: "Car Deleted Successfully !" });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.createTrack = async (req, res) => {
        try {
                let findTrack = await Track.findOne({ name: req.body.name });
                if (findTrack) {
                        return res.status(409).json({ message: "Track already exit.", status: 404, data: {} });
                } else {
                        if (req.file) {
                                req.body.image = req.file.path
                        } else {
                                return res.status(404).json({ message: "First Chosse an image.", status: 404, data: {} });
                        }
                        const data = { name: req.body.name, image: req.body.image };
                        const track = await Track.create(data);
                        return res.status(200).json({ message: "Track add successfully.", status: 200, data: track });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getTrack = async (req, res) => {
        try {
                const track = await Track.find({});
                return res.status(201).json({ success: true, track, });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.updateTrack = async (req, res) => {
        try {
                const { id } = req.params;
                const track = await Track.findById(id);
                if (!track) {
                        return res.status(404).json({ message: "Track Not Found", status: 404, data: {} });
                }
                if (req.file) {
                        track.image = req.file.path;
                } else {
                        track.image = track.image;
                }
                track.name = req.body.name;
                let update = await track.save();
                return res.status(200).json({ message: "Updated Successfully", status: 200, data: update });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.removeTrack = async (req, res) => {
        const { id } = req.params;
        try {
                const track = await Track.findById(id);
                if (!track) {
                        return res.status(404).json({ message: "Track Not Found", status: 404, data: {} });
                } else {
                        await Track.findByIdAndDelete(track._id);
                        return res.status(200).json({ message: "Track Deleted Successfully !" });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.createSpeed = async (req, res) => {
        try {
                const { carId, trackId, speed } = req.body;
                const car = await Car.findById(carId);
                if (!car) {
                        return res.status(404).send({ status: 404, message: "car not found ", data: {}, });
                }
                const track = await Track.findById(trackId);
                if (!track) {
                        return res.status(404).send({ status: 404, message: "track not found ", data: {}, });
                }
                const findSpeed = await Speed.findOne({ carId: carId, trackId: trackId });
                if (findSpeed) {
                        return res.status(409).send({ status: 409, message: "Speed already exit with this car and track id ", data: {}, });
                }
                const newSpeed = new Speed({ carId, trackId, speed, });
                await newSpeed.save();
                return res.status(200).json({ message: "Speed add successfully.", status: 200, data: newSpeed });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getSpeed = async (req, res) => {
        try {
                const { carId, trackId } = req.query;
                const filter = {};
                if (carId) {
                        filter.carId = carId;
                }
                if (trackId) {
                        filter.trackId = trackId;
                }
                const findSpeed = await Speed.find(filter).populate("carId").populate("trackId");
                if (findSpeed.length === 0) {
                        return res.status(404).send({ status: 404, message: "Speed not found", data: {} });
                }
                return res.status(200).send({ status: 200, message: "Speed found", data: findSpeed });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
        }
};
exports.updateSpeed = async (req, res) => {
        try {
                const { carId, trackId, speed } = req.body;
                const track = await Speed.findById({ _id: req.params.id });
                if (!track) {
                        return res.status(404).json({ message: "Track Not Found", status: 404, data: {} });
                }
                if (carId != (null || undefined || "")) {
                        const car = await Car.findById(carId);
                        if (!car) {
                                return res.status(404).send({ status: 404, message: "car not found ", data: {}, });
                        }
                }
                if (trackId != (null || undefined || "")) {
                        const track1 = await Track.findById(trackId);
                        if (!track1) {
                                return res.status(404).send({ status: 404, message: "track not found ", data: {}, });
                        }
                }
                const findSpeed = await Speed.findOne({ _id: { $ne: track._id }, carId: carId || track.carId, trackId: trackId || track.trackId });
                if (findSpeed) {
                        return res.status(409).send({ status: 409, message: "Speed already exit with this car and track id ", data: {}, });
                }
                track.speed = speed || track.speed;
                track.carId = carId || track.carId;
                track.trackId = trackId || track.trackId;
                let update = await track.save();
                return res.status(200).json({ message: "Updated Successfully", status: 200, data: update });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.removeSpeed = async (req, res) => {
        const { id } = req.params;
        try {
                const findSpeed = await Speed.findById(id);
                if (!findSpeed) {
                        return res.status(404).json({ message: "Speed Not Found", status: 404, data: {} });
                } else {
                        await Speed.findByIdAndDelete(track._id);
                        return res.status(200).json({ message: "Speed Deleted Successfully !" });
                }
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getRace = async (req, res) => {
        try {
                let findSpeed = await Race.find({}).populate([{ path: 'car1.car', select: 'name image victory  odds' }, { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.car', select: 'name image victory  odds' }, { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.car', select: 'name image victory  odds' }, { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },]); if (findSpeed.length === 0) {
                        return res.status(404).send({ status: 404, message: "Speed not found", data: {} });
                }
                return res.status(200).send({ status: 200, message: "Speed found", data: findSpeed });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
        }
};
exports.getBet = async (req, res) => {
        try {
                let findSpeed = await Bet.find({}).populate([
                        { path: 'car1Id', select: 'name image victory  odds' },
                        { path: 'car2Id', select: 'name image victory  odds' },
                        { path: 'car3Id', select: 'name image victory  odds' },
                        { path: 'raceId', select: 'raceId', populate: [{ path: 'car1.car', select: 'name image victory  odds' }, { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.car', select: 'name image victory  odds' }, { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.car', select: 'name image victory  odds' }, { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },] },
                        { path: 'userId', select: 'fullName firstName lastName image ' },
                ]); if (findSpeed.length === 0) {
                        return res.status(404).send({ status: 404, message: "Bets not found", data: {} });
                }
                return res.status(200).send({ status: 200, message: "Bets found", data: findSpeed });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
        }
};
// exports.createSpeedForAll = async (req, res) => {
//         try {
//                 const minSpeed = 50;
//                 const maxSpeed = 200;
//                 const cars = await Car.find();
//                 const tracks = await Track.find();
//                 for (const car of cars) {
//                         for (const track of tracks) {
//                                 const findSpeed = await Speed.findOne({ carId: car._id, trackId: track._id });
//                                 const speed = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + minSpeed;
//                                 if (findSpeed) {
//                                         findSpeed.speed = speed;
//                                         await findSpeed.save();
//                                 } else {
//                                         const newSpeed = new Speed({ carId: car._id, trackId: track._id, speed });
//                                         await newSpeed.save();
//                                 }
//                         }
//                 }

//                 return res.status(200).json({ message: "Random speed entries added/updated successfully.", status: 200 });
//         } catch (error) {
//                 return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
//         }
// };

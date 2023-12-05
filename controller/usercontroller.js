const jwt = require("jsonwebtoken");
const randomatic = require("randomatic");
const User = require("../model/userModel");
const Car = require("../model/car");
const Speed = require("../model/speed");
const Race = require("../model/race");
const Bet = require("../model/bets");
const Track = require("../model/track");
const winingSenario = require("../model/winingSenario");
exports.socialLogin = async (req, res) => {
        try {
                let userData = await User.findOne({ $or: [{ mobileNumber: req.body.mobileNumber }, { socialId: req.body.socialId }, { socialType: req.body.socialType }] });
                if (userData) {
                        let updateResult = await User.findByIdAndUpdate({ _id: userData._id }, { $set: { deviceToken: req.body.deviceToken } }, { new: true });
                        if (updateResult) {
                                const token = jwt.sign({ id: updateResult._id }, "node5flyweis");
                                let obj = {
                                        _id: updateResult._id,
                                        firstName: updateResult.firstName,
                                        lastName: updateResult.lastName,
                                        socialId: updateResult.socialId,
                                        userType: updateResult.userType,
                                        token: token
                                }
                                return res.status(200).send({ status: 200, message: "Login successfully ", data: obj, });
                        }
                } else {
                        req.body.firstName = req.body.firstName;
                        req.body.lastName = req.body.lastName;
                        req.body.mobileNumber = req.body.mobileNumber;
                        let email = req.body.email;
                        req.body.email = email.split(" ").join("").toLowerCase();
                        req.body.socialId = req.body.socialId;
                        req.body.socialType = req.body.socialType;
                        req.body.refferalCode = await reffralCode();
                        let saveUser = await User(req.body).save();
                        if (saveUser) {
                                const token = jwt.sign({ id: saveUser._id }, "node5flyweis");
                                let obj = {
                                        _id: saveUser._id,
                                        firstName: saveUser.firstName,
                                        lastName: saveUser.lastName,
                                        mobileNumber: saveUser.mobileNumber,
                                        userType: saveUser.userType,
                                        token: token
                                }
                                return res.status(200).send({ status: 200, message: "Login successfully ", data: obj, });
                        }
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.loginUser = async (req, res) => {
        try {
                const { mobileNumber } = req.body;
                let user = await User.findOne({ mobileNumber });
                if (!user) {
                        const otp = randomatic("0", 4);
                        let refferalCode = await reffralCode();
                        user = new User({ mobileNumber, otp, refferalCode });
                        await user.save();
                        const token = jwt.sign({ id: user._id }, "node5flyweis");
                        return res.status(200).send({ status: 200, message: "OTP generated and sent to the user.", data: { user, token }, });
                } else {
                        const otp = randomatic("0", 4);
                        user.otp = otp;
                        user.isVerified = false;
                        await user.save();
                        const token = jwt.sign({ id: user._id }, "node5flyweis");
                        return res.status(200).send({ status: 200, message: "OTP generated and sent to the user.", data: { user, token }, });
                }
        } catch (error) {
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
        }
};
exports.verifyOtplogin = async (req, res) => {
        try {
                const { mobileNumber, otp } = req.body;
                const user = await User.findOne({ mobileNumber });
                if (!user) {
                        return res.status(404).json({ error: "User not found" });
                }
                if (otp === user.otp) {
                        const token = jwt.sign({ id: user._id }, "node5flyweis");
                        user.otp = undefined;
                        user.isVerified = true;
                        await user.save();
                        return res.status(200).send({ status: 200, message: "OTP verification successful", data: { user, token }, });
                } else {
                        return res.status(401).send({ status: 401, message: "Invalid OTP", data: {}, });
                }
        } catch (error) {
                return res.status(500).send({ status: 500, message: "Server error" + error.message });
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
exports.updateUserDetails = async (req, res) => {
        try {
                const user = await User.findById(req.user._id);
                if (!user) {
                        return res.status(404).send({ status: 404, message: "user not found ", data: {}, });
                } else {
                        const { fullName, firstName, lastName, email, mobileNumber, address, city, state, country, pincode } = req.body;
                        uswe.fullName = fullName || user.fullName;
                        user.firstName = firstName || user.firstName;
                        user.lastName = lastName || user.lastName;
                        user.email = email || user.email;
                        user.mobileNumber = mobileNumber || user.mobileNumber;
                        user.address = address || user.address;
                        user.city = city || user.city;
                        user.state = state || user.state;
                        user.country = country || user.country;
                        user.pincode = pincode || user.pincode;
                        await user.save();
                        return res.status(200).send({ status: 200, message: "Profile updated successfully", data: user, });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.createRace1 = async (req, res) => {
        try {
                let car1, car2, car3, speed1track1Id, speed2track1Id, speed3track1Id;
                let findOne = await Race.findOne({ status: 'pending' }).populate([
                        { path: 'car1.car', select: 'name image victory  odds' },
                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                        { path: 'car2.car', select: 'name image victory  odds' },
                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                        { path: 'car3.car', select: 'name image victory  odds' },
                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                ]);
                if (findOne) {
                        return res.status(200).send({ status: 200, message: "race find successfully.", data: findOne, });
                } else {
                        let totalRace = await Race.find({}).count();
                        const cars = await Car.aggregate([{ $sample: { size: 3 } }]);
                        const track = await Track.aggregate([{ $sample: { size: 1 } }]);
                        if (cars.length > 0) {
                                for (let i = 0; i < cars.length; i++) {
                                        if (i == 0) {
                                                car1 = cars[0]._id;
                                                const speed = await Speed.findOne({ trackId: track[0]._id, carId: cars[0]._id });
                                                speed1track1Id = speed._id;
                                        } else if (i == 1) {
                                                car2 = cars[1]._id;
                                                const speed = await Speed.findOne({ trackId: track[0]._id, carId: cars[1]._id });
                                                speed2track1Id = speed._id;

                                        } else {
                                                car3 = cars[2]._id;
                                                const speed = await Speed.findOne({ trackId: track[0]._id, carId: cars[2]._id });
                                                speed3track1Id = speed._id;
                                        }
                                }
                        }
                        req.body.car1 = {
                                car: car1,
                                track1Id: speed1track1Id,
                        };
                        req.body.car2 = {
                                car: car2,
                                track1Id: speed2track1Id,
                        };
                        req.body.car3 = {
                                car: car3,
                                track1Id: speed3track1Id,
                        };
                        req.body.raceNo = (totalRace % 10) + 1;
                        req.body.raceId = await reffralCode();
                        req.body.track1Id = track._id;
                        req.body.status = 'pending';
                        const car = await Race.create(req.body);
                        let car6 = await Race.findOne({ _id: car._id }).populate([
                                { path: 'car1.car', select: 'name image victory  odds' },
                                { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                { path: 'car2.car', select: 'name image victory  odds' },
                                { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                { path: 'car3.car', select: 'name image victory  odds' },
                                { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                        ]);
                        if (car6) {
                                return res.status(200).send({ status: 200, message: "race find successfully.", data: car6, });
                        }
                }
        } catch (error) {
                console.error("Error creating race:", error);
        }
};
exports.createRace = async (req, res) => {
        try {
                let car1, car2, car3, speed1track1Id, speed2track1Id, speed3track1Id, speed1track2Id, speed1track3Id, speed2track2Id, speed2track3Id, speed3track2Id, speed3track3Id;;
                let car1noOfTrack1, car1noOfTrack2, car1noOfTrack3, car2noOfTrack1, car2noOfTrack2, car2noOfTrack3, car3noOfTrack1, car3noOfTrack2, car3noOfTrack3;
                let findOne = await Race.findOne({ status: 'pending' }).populate([{ path: 'car1.car', select: 'name image victory odds' }, { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.car', select: 'name image victory odds' }, { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.car', select: 'name image victory odds' }, { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } }, { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },]);
                if (findOne) {
                        return res.status(200).send({ status: 200, message: 'Race found successfully.', data: findOne });
                } else {
                        const firstTrack = Math.floor(Math.random() * 3) + 1;
                        let totalRace = await Race.find({}).count();
                        let raceNo = (totalRace % 10) + 1;
                        if (raceNo == 1) {
                                function generateRandomIndices(maxCount, medCount, lowCount, maxIndex) {
                                        const getRandomIndices = (count, exclude) => {
                                                const indices = [];
                                                while (indices.length < count) {
                                                        const randomIndex = Math.floor(Math.random() * maxIndex) + 1;
                                                        if (!indices.includes(randomIndex) && !exclude.includes(randomIndex)) {
                                                                indices.push(randomIndex);
                                                                exclude.push(randomIndex);
                                                        }
                                                }
                                                return indices;
                                        };

                                        const allIndices = [];
                                        return { max: getRandomIndices(maxCount, allIndices), med: getRandomIndices(medCount, allIndices), low: getRandomIndices(lowCount, allIndices) };
                                }
                                const result12 = generateRandomIndices(6, 3, 1, 10);
                                if ((result12.low.length == 1) && (result12.med.length  == 3) && (result12.max.length  == 6)) {
                                        let findWiningSenario = await winingSenario.findOne();
                                        if (findWiningSenario) {
                                                let update = await winingSenario.findByIdAndUpdate({ _id: findWiningSenario._id }, { $set: { max: result12.max, med: result12.med, low: result12.low } }, { new: true })
                                        } else {
                                                await winingSenario.create({ max: result12.max, med: result12.med, low: result12.low });
                                        }
                                }
                        }
                        const cars = await Car.aggregate([{ $sample: { size: 3 } }]);
                        const track = await Track.aggregate([{ $sample: { size: 1 } }]);
                        if (cars.length > 0) {
                                function distributeRandomlyWithoutZero(total, parts) {
                                        let distribution = Array(parts).fill(1);
                                        for (let i = 0; i < total - parts; i++) {
                                                let index;
                                                do {
                                                        index = Math.floor(Math.random() * parts);
                                                } while (distribution[index] === 0);
                                                distribution[index]++;
                                        }
                                        return distribution;
                                }
                                const distribution = distributeRandomlyWithoutZero(6, 3);
                                [car1noOfTrack1, car1noOfTrack2, car1noOfTrack3] = distribution;
                                for (let i = 0; i < cars.length; i++) {
                                        if (i === 0) {
                                                car1 = cars[0]._id;
                                                const speed = await Speed.findOne({ trackId: track[0]._id, carId: cars[0]._id });
                                                if (firstTrack == 1) {
                                                        speed1track1Id = speed._id;
                                                        speed1track2Id = null;
                                                        speed1track3Id = null;
                                                }
                                                if (firstTrack == 2) {
                                                        speed1track1Id = null;
                                                        speed1track2Id = speed._id;
                                                        speed1track3Id = null;
                                                }
                                                if (firstTrack == 3) {
                                                        speed1track1Id = null;
                                                        speed1track2Id = null;
                                                        speed1track3Id = speed._id;
                                                }
                                        } else if (i === 1) {
                                                car2 = cars[1]._id;
                                                const speed = await Speed.findOne({ trackId: track[0]._id, carId: cars[1]._id });
                                                speed2track1Id = speed._id;
                                                if (firstTrack == 1) {
                                                        speed2track1Id = speed._id;
                                                        speed2track2Id = null;
                                                        speed2track3Id = null;
                                                }
                                                if (firstTrack == 2) {
                                                        speed2track1Id = null;
                                                        speed2track2Id = speed._id;
                                                        speed2track3Id = null;
                                                }
                                                if (firstTrack == 3) {
                                                        speed2track1Id = null;
                                                        speed2track2Id = null;
                                                        speed2track3Id = speed._id;
                                                }
                                        } else {
                                                car3 = cars[2]._id;
                                                const speed = await Speed.findOne({ trackId: track[0]._id, carId: cars[2]._id });
                                                if (firstTrack == 1) {
                                                        speed3track1Id = speed._id;
                                                        speed3track2Id = null;
                                                        speed3track3Id = null;
                                                }
                                                if (firstTrack == 2) {
                                                        speed3track1Id = null;
                                                        speed3track2Id = speed._id;
                                                        speed3track3Id = null;
                                                }
                                                if (firstTrack == 3) {
                                                        speed3track1Id = null;
                                                        speed3track2Id = null;
                                                        speed3track3Id = speed._id;
                                                }
                                        }
                                }
                                req.body.car1 = {
                                        car: car1,
                                        track1Id: speed1track1Id,
                                        track2Id: speed1track2Id,
                                        track3Id: speed1track3Id,
                                        noOfTrack1: car1noOfTrack1,
                                        noOfTrack2: car1noOfTrack2,
                                        noOfTrack3: car1noOfTrack3,
                                };
                                req.body.car2 = {
                                        car: car2,
                                        track1Id: speed2track1Id,
                                        track2Id: speed2track2Id,
                                        track3Id: speed2track3Id,
                                        noOfTrack1: car1noOfTrack1,
                                        noOfTrack2: car1noOfTrack2,
                                        noOfTrack3: car1noOfTrack3,
                                };
                                req.body.car3 = {
                                        car: car3,
                                        track1Id: speed3track1Id,
                                        track2Id: speed3track2Id,
                                        track3Id: speed3track3Id,
                                        noOfTrack1: car1noOfTrack1,
                                        noOfTrack2: car1noOfTrack2,
                                        noOfTrack3: car1noOfTrack3,
                                };
                                req.body.raceNo = raceNo;
                                req.body.raceId = await reffralCode();
                                req.body.track1Id = track._id;
                                req.body.status = 'pending';
                                req.body.firstTrack = firstTrack;
                                const createdRace = await Race.create(req.body);
                                let car6 = await Race.findOne({ _id: createdRace._id }).populate([
                                        { path: 'car1.car', select: 'name image victory odds' },
                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car2.car', select: 'name image victory odds' },
                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car3.car', select: 'name image victory odds' },
                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                ]);
                                if (car6) {
                                        return res.status(200).send({ status: 200, message: 'Race created successfully.', data: car6 });
                                }
                        }
                }
        } catch (error) {
                console.error('Error creating race:', error);
                res.status(500).send({ status: 500, message: 'Internal Server Error' });
        }
};
exports.getRaceByid = async (req, res) => {
        try {
                const user = await Race.findById({ _id: req.params.id }).select('noOfuser betsAmount car1BetAmount car2BetAmount car3BetAmount');
                if (!user) {
                        return res.status(404).send({ status: 404, message: "Race  not found ", data: {}, });
                } else {
                        return res.status(200).send({ status: 200, message: "Race start", data: user, });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
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
exports.raceStart = async (req, res) => {
        try {
                const user100 = await Race.findOne({ _id: req.params.id }).populate([{ path: 'car1.car', select: 'name image victory  odds' }, { path: 'car2.car', select: 'name image victory  odds' }, { path: 'car3.car', select: 'name image victory  odds' },]);;
                const user = await Race.findOne({ _id: req.params.id });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "Race not found", data: {} });
                } else {
                        let car1Name = user100.car1.car.name, car2Name = user100.car2.car.name, car3Name = user100.car3.car.name;
                        console.log(car1Name, car2Name, car3Name);
                        if (user.status == 'pending') {
                                let speed1track1Id, speed1track2Id, speed1track3Id, speed2track1Id, speed2track2Id, speed2track3Id, speed3track1Id, speed3track2Id, speed3track3Id;
                                const betAmounts = [user.car1BetAmount, user.car2BetAmount, user.car3BetAmount];
                                const maxBetAmount = Math.max(...betAmounts);
                                const minBetAmount = Math.min(...betAmounts);
                                const mediumBetAmount = betAmounts.reduce((acc, val) => acc + val, 0) - maxBetAmount - minBetAmount;
                                const maxBetEnum = findEnum(maxBetAmount, betAmounts);
                                const mediumBetEnum = findEnum(mediumBetAmount, betAmounts);
                                const minBetEnum = findEnum(minBetAmount, betAmounts);
                                function findEnum(amount, amounts) {
                                        const index = amounts.indexOf(amount);
                                        return ["I", "II", "III"][index];
                                }
                                let findWiningSenario = await winingSenario.findOne();
                                if (findWiningSenario.max.includes(user.raceNo)) {
                                        console.log("max");
                                        if (maxBetAmount === user.car1BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car1.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed1track1Id = user.car1.track1Id;
                                                        speed1track2Id = speed2[0]._id;
                                                        speed1track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed1track1Id = speed2[0]._id;
                                                        speed1track2Id = user.car1.track2Id;
                                                        speed1track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed1track1Id = speed2[0]._id;
                                                        speed1track2Id = speed2[1]._id;
                                                        speed1track3Id = user.car1.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed2track1Id = user.car2.track1Id;
                                                                if (i == 0) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed2track2Id = user.car2.track2Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed2track3Id = user.car2.track3Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed3track1Id = user.car3.track1Id;
                                                                if (i == 0) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed3track2Id = user.car3.track2Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed3track3Id = user.car3.track3Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "max",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        } else if (maxBetAmount === user.car2BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car2.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed2track1Id = user.car2.track1Id;
                                                        speed2track2Id = speed2[0]._id;
                                                        speed2track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed2track1Id = speed2[0]._id;
                                                        speed2track2Id = user.car2.track2Id;
                                                        speed2track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed2track1Id = speed2[0]._id;
                                                        speed2track2Id = speed2[1]._id;
                                                        speed2track3Id = user.car2.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed1track1Id = user.car1.track1Id;
                                                                if (i == 0) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed1track2Id = user.car1.track2Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed1track3Id = user.car1.track3Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed3track1Id = user.car3.track1Id;
                                                                if (i == 0) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed3track2Id = user.car3.track2Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed3track3Id = user.car3.track3Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "max",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        } else if (maxBetAmount === user.car3BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car3.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed3track1Id = user.car3.track1Id;
                                                        speed3track2Id = speed2[0]._id;
                                                        speed3track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed3track1Id = speed2[0]._id;
                                                        speed3track2Id = user.car3.track2Id;
                                                        speed3track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed3track1Id = speed2[0]._id;
                                                        speed3track2Id = speed2[1]._id;
                                                        speed3track3Id = user.car3.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed1track1Id = user.car1.track1Id;
                                                                if (i == 0) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed1track2Id = user.car1.track2Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed1track3Id = user.car1.track3Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed2track1Id = user.car2.track1Id;
                                                                if (i == 0) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed2track2Id = user.car2.track2Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed2track3Id = user.car2.track3Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "max",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        }
                                }
                                if (findWiningSenario.med.includes(user.raceNo)) {
                                        console.log("med");
                                        if (mediumBetAmount === user.car1BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car1.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed1track1Id = user.car1.track1Id;
                                                        speed1track2Id = speed2[0]._id;
                                                        speed1track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed1track1Id = speed2[0]._id;
                                                        speed1track2Id = user.car1.track2Id;
                                                        speed1track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed1track1Id = speed2[0]._id;
                                                        speed1track2Id = speed2[1]._id;
                                                        speed1track3Id = user.car1.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed2track1Id = user.car2.track1Id;
                                                                if (i == 0) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed2track2Id = user.car2.track2Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed2track3Id = user.car2.track3Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed3track1Id = user.car3.track1Id;
                                                                if (i == 0) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed3track2Id = user.car3.track2Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed3track3Id = user.car3.track3Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "med",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        } else if (mediumBetAmount === user.car2BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car2.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed2track1Id = user.car2.track1Id;
                                                        speed2track2Id = speed2[0]._id;
                                                        speed2track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed2track1Id = speed2[0]._id;
                                                        speed2track2Id = user.car2.track2Id;
                                                        speed2track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed2track1Id = speed2[0]._id;
                                                        speed2track2Id = speed2[1]._id;
                                                        speed2track3Id = user.car2.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed1track1Id = user.car1.track1Id;
                                                                if (i == 0) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed1track2Id = user.car1.track2Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed1track3Id = user.car1.track3Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed3track1Id = user.car3.track1Id;
                                                                if (i == 0) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed3track2Id = user.car3.track2Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed3track3Id = user.car3.track3Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "med",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        } else if (mediumBetAmount === user.car3BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car3.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed3track1Id = user.car3.track1Id;
                                                        speed3track2Id = speed2[0]._id;
                                                        speed3track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed3track1Id = speed2[0]._id;
                                                        speed3track2Id = user.car3.track2Id;
                                                        speed3track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed3track1Id = speed2[0]._id;
                                                        speed3track2Id = speed2[1]._id;
                                                        speed3track3Id = user.car3.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed1track1Id = user.car1.track1Id;
                                                                if (i == 0) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed1track2Id = user.car1.track2Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed1track3Id = user.car1.track3Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed2track1Id = user.car2.track1Id;
                                                                if (i == 0) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed2track2Id = user.car2.track2Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed2track3Id = user.car2.track3Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "med",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        }
                                }
                                if (findWiningSenario.low.includes(user.raceNo)) {
                                        console.log("low");
                                        if (minBetAmount === user.car1BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car1.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed1track1Id = user.car1.track1Id;
                                                        speed1track2Id = speed2[0]._id;
                                                        speed1track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed1track1Id = speed2[0]._id;
                                                        speed1track2Id = user.car1.track2Id;
                                                        speed1track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed1track1Id = speed2[0]._id;
                                                        speed1track2Id = speed2[1]._id;
                                                        speed1track3Id = user.car1.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed2track1Id = user.car2.track1Id;
                                                                if (i == 0) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed2track2Id = user.car2.track2Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed2track3Id = user.car2.track3Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed3track1Id = user.car3.track1Id;
                                                                if (i == 0) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed3track2Id = user.car3.track2Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed3track3Id = user.car3.track3Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "low",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        } else if (minBetAmount === user.car2BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car2.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed2track1Id = user.car2.track1Id;
                                                        speed2track2Id = speed2[0]._id;
                                                        speed2track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed2track1Id = speed2[0]._id;
                                                        speed2track2Id = user.car2.track2Id;
                                                        speed2track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed2track1Id = speed2[0]._id;
                                                        speed2track2Id = speed2[1]._id;
                                                        speed2track3Id = user.car2.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed1track1Id = user.car1.track1Id;
                                                                if (i == 0) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed1track2Id = user.car1.track2Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed1track3Id = user.car1.track3Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed3track1Id = user.car3.track1Id;
                                                                if (i == 0) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed3track2Id = user.car3.track2Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed3track3Id = user.car3.track3Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "low",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        } else if (minBetAmount === user.car3BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car3.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed3track1Id = user.car3.track1Id;
                                                        speed3track2Id = speed2[0]._id;
                                                        speed3track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed3track1Id = speed2[0]._id;
                                                        speed3track2Id = user.car3.track2Id;
                                                        speed3track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed3track1Id = speed2[0]._id;
                                                        speed3track2Id = speed2[1]._id;
                                                        speed3track3Id = user.car3.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed1track1Id = user.car1.track1Id;
                                                                if (i == 0) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed1track2Id = user.car1.track2Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed1track3Id = user.car1.track3Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed2track1Id = user.car2.track1Id;
                                                                if (i == 0) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed2track2Id = user.car2.track2Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed2track3Id = user.car2.track3Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "low",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        }
                                }
                                return;
                                if (user.raceNo == 10) {
                                    
                                }
                                if ((user.raceNo == 1) || (user.raceNo == 3) || (user.raceNo == 5) || (user.raceNo == 7) || (user.raceNo == 8) || (user.raceNo == 9)) {
                                        if (maxBetAmount === user.car1BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car1.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed1track1Id = user.car1.track1Id;
                                                        speed1track2Id = speed2[0]._id;
                                                        speed1track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed1track1Id = speed2[0]._id;
                                                        speed1track2Id = user.car1.track2Id;
                                                        speed1track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed1track1Id = speed2[0]._id;
                                                        speed1track2Id = speed2[1]._id;
                                                        speed1track3Id = user.car1.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed2track1Id = user.car2.track1Id;
                                                                if (i == 0) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed2track2Id = user.car2.track2Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed2track3Id = user.car2.track3Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed3track1Id = user.car3.track1Id;
                                                                if (i == 0) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed3track2Id = user.car3.track2Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed3track3Id = user.car3.track3Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "max",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        } else if (maxBetAmount === user.car2BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car2.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed2track1Id = user.car2.track1Id;
                                                        speed2track2Id = speed2[0]._id;
                                                        speed2track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed2track1Id = speed2[0]._id;
                                                        speed2track2Id = user.car2.track2Id;
                                                        speed2track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed2track1Id = speed2[0]._id;
                                                        speed2track2Id = speed2[1]._id;
                                                        speed2track3Id = user.car2.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed1track1Id = user.car1.track1Id;
                                                                if (i == 0) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed1track2Id = user.car1.track2Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed1track3Id = user.car1.track3Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed3track1Id = user.car3.track1Id;
                                                                if (i == 0) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed3track2Id = user.car3.track2Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed3track3Id = user.car3.track3Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "max",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        } else if (maxBetAmount === user.car3BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car3.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed3track1Id = user.car3.track1Id;
                                                        speed3track2Id = speed2[0]._id;
                                                        speed3track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed3track1Id = speed2[0]._id;
                                                        speed3track2Id = user.car3.track2Id;
                                                        speed3track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed3track1Id = speed2[0]._id;
                                                        speed3track2Id = speed2[1]._id;
                                                        speed3track3Id = user.car3.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed1track1Id = user.car1.track1Id;
                                                                if (i == 0) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed1track2Id = user.car1.track2Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed1track3Id = user.car1.track3Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed2track1Id = user.car2.track1Id;
                                                                if (i == 0) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed2track2Id = user.car2.track2Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed2track3Id = user.car2.track3Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "max",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        }
                                }
                                if ((user.raceNo == 2) || (user.raceNo == 4) || (user.raceNo == 6)) {
                                        if (mediumBetAmount === user.car1BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car1.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed1track1Id = user.car1.track1Id;
                                                        speed1track2Id = speed2[0]._id;
                                                        speed1track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed1track1Id = speed2[0]._id;
                                                        speed1track2Id = user.car1.track2Id;
                                                        speed1track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed1track1Id = speed2[0]._id;
                                                        speed1track2Id = speed2[1]._id;
                                                        speed1track3Id = user.car1.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed2track1Id = user.car2.track1Id;
                                                                if (i == 0) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed2track2Id = user.car2.track2Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed2track3Id = user.car2.track3Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed3track1Id = user.car3.track1Id;
                                                                if (i == 0) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed3track2Id = user.car3.track2Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed3track3Id = user.car3.track3Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "med",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        } else if (mediumBetAmount === user.car2BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car2.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed2track1Id = user.car2.track1Id;
                                                        speed2track2Id = speed2[0]._id;
                                                        speed2track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed2track1Id = speed2[0]._id;
                                                        speed2track2Id = user.car2.track2Id;
                                                        speed2track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed2track1Id = speed2[0]._id;
                                                        speed2track2Id = speed2[1]._id;
                                                        speed2track3Id = user.car2.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed1track1Id = user.car1.track1Id;
                                                                if (i == 0) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed1track2Id = user.car1.track2Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed1track3Id = user.car1.track3Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car3.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed3track1Id = user.car3.track1Id;
                                                                if (i == 0) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed3track2Id = user.car3.track2Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed3track3Id = user.car3.track3Id;
                                                                if (i == 0) {
                                                                        speed3track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed3track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "med",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        } else if (mediumBetAmount === user.car3BetAmount) {
                                                const speed2 = await Speed.find({ carId: user.car3.car }).sort({ speed: -1 }).limit(2);
                                                if (user.firstTrack == 1) {
                                                        speed3track1Id = user.car3.track1Id;
                                                        speed3track2Id = speed2[0]._id;
                                                        speed3track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 2) {
                                                        speed3track1Id = speed2[0]._id;
                                                        speed3track2Id = user.car3.track2Id;
                                                        speed3track3Id = speed2[1]._id;
                                                }
                                                if (user.firstTrack == 3) {
                                                        speed3track1Id = speed2[0]._id;
                                                        speed3track2Id = speed2[1]._id;
                                                        speed3track3Id = user.car3.track3Id;
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car1.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed1track1Id = user.car1.track1Id;
                                                                if (i == 0) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed1track2Id = user.car1.track2Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed1track3Id = user.car1.track3Id;
                                                                if (i == 0) {
                                                                        speed1track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed1track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                for (let i = 0; i < speed2.length; i++) {
                                                        const speed1 = await Speed.findOne({ carId: user.car2.car, trackId: speed2[i].trackId }).sort({ speed: 1 }).limit(2);
                                                        if (user.firstTrack == 1) {
                                                                speed2track1Id = user.car2.track1Id;
                                                                if (i == 0) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 2) {
                                                                speed2track2Id = user.car2.track2Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track3Id = speed1._id;
                                                                }
                                                        }
                                                        if (user.firstTrack == 3) {
                                                                speed2track3Id = user.car2.track3Id;
                                                                if (i == 0) {
                                                                        speed2track1Id = speed1._id;
                                                                }
                                                                if (i == 1) {
                                                                        speed2track2Id = speed1._id;
                                                                }
                                                        }
                                                }
                                                if (minBetEnum == "I") {
                                                        winCar = car1Name;
                                                } else if (minBetEnum == "II") {
                                                        winCar = car2Name;
                                                } else {
                                                        winCar = car3Name;
                                                }
                                                let obj = {
                                                        car1: {
                                                                car: user.car1.car,
                                                                track1Id: speed1track1Id,
                                                                track2Id: speed1track2Id,
                                                                track3Id: speed1track3Id,
                                                                noOfTrack1: user.car1.noOfTrack1,
                                                                noOfTrack2: user.car1.noOfTrack2,
                                                                noOfTrack3: user.car1.noOfTrack3,
                                                        },
                                                        car2: {
                                                                car: user.car2.car,
                                                                track1Id: speed2track1Id,
                                                                track2Id: speed2track2Id,
                                                                track3Id: speed2track3Id,
                                                                noOfTrack1: user.car2.noOfTrack1,
                                                                noOfTrack2: user.car2.noOfTrack2,
                                                                noOfTrack3: user.car2.noOfTrack3,
                                                        },
                                                        car3: {
                                                                car: user.car3.car,
                                                                track1Id: speed3track1Id,
                                                                track2Id: speed3track2Id,
                                                                track3Id: speed3track3Id,
                                                                noOfTrack1: user.car3.noOfTrack1,
                                                                noOfTrack2: user.car3.noOfTrack2,
                                                                noOfTrack3: user.car3.noOfTrack3,
                                                        },
                                                        status: "started",
                                                        maximum: maxBetEnum,
                                                        medium: mediumBetEnum,
                                                        lowest: minBetEnum,
                                                        win: "med",
                                                        winCar: winCar
                                                }
                                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { $set: obj }, { new: true });
                                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                                        { path: 'car1.car', select: 'name image victory  odds' },
                                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.car', select: 'name image victory  odds' },
                                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.car', select: 'name image victory  odds' },
                                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                                ]);
                                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                                        }
                                }
                        }
                        if (user.status == 'started') {
                                let findOne1 = await Race.findOne({ _id: req.params.id }).populate([
                                        { path: 'car1.car', select: 'name image victory  odds' },
                                        { path: 'car1.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car1.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car1.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car2.car', select: 'name image victory  odds' },
                                        { path: 'car2.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car2.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car2.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car3.car', select: 'name image victory  odds' },
                                        { path: 'car3.track1Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car3.track2Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                        { path: 'car3.track3Id', select: 'speed trackId', populate: { path: 'trackId', select: 'name image' } },
                                ]);
                                return res.status(200).send({ status: 200, message: "car 1", data: findOne1 });
                        }

                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.raceCompleted1 = async (req, res) => {
        try {
                const user = await Race.findById({ _id: req.params.id });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "Race  not found ", data: {}, });
                } else {
                        let update = await Race.findByIdAndUpdate({ _id: user._id }, { status: "completed" }, { new: true })
                        return res.status(200).send({ status: 200, message: "Race complete", data: update, });
                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.raceCompleted = async (req, res) => {
        try {
                const user = await Race.findById({ _id: req.params.id });
                if (!user) {
                        return res.status(404).send({ status: 404, message: "Race  not found ", data: {}, });
                } else {
                        let findBet = await Bet.find({ raceId: user._id, userId: req.user._id }).populate([{ path: 'car1Id', select: 'name image victory  odds' }, { path: 'car2Id', select: 'name image victory  odds' }, { path: 'car3Id', select: 'name image victory  odds' },]);
                        if (user.win == "max") {
                                let winningCar = user.maximum
                                for (let i = 0; i < findBet.length; i++) {
                                        if (findBet[i].betOn == "I") {
                                                if (findBet[i].betOn == winningCar) {
                                                        findBet[i].status = "win";
                                                        findBet[i].winAmount = findBet[i].betAmount * findBet[i].car1Id.odds;
                                                        findBet[i].save();
                                                } else {
                                                        findBet[i].status = "loss";
                                                        findBet[i].winAmount = 0;
                                                        findBet[i].save();
                                                }
                                        }
                                        else if (findBet[i].betOn == "II") {
                                                if (findBet[i].betOn == winningCar) {
                                                        findBet[i].status = "win";
                                                        findBet[i].winAmount = findBet[i].betAmount * findBet[i].car2Id.odds;
                                                        findBet[i].save();
                                                } else {
                                                        findBet[i].status = "loss";
                                                        findBet[i].winAmount = 0;
                                                        findBet[i].save();
                                                }
                                        } else {
                                                if (findBet[i].betOn == winningCar) {
                                                        findBet[i].status = "win";
                                                        findBet[i].winAmount = findBet[i].betAmount * findBet[i].car3Id.odds;
                                                        findBet[i].save();
                                                } else {
                                                        findBet[i].status = "loss";
                                                        findBet[i].winAmount = 0;
                                                        findBet[i].save();
                                                }
                                        }
                                        console.log(findBet[i]);
                                }
                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { status: "completed" }, { new: true })
                                return res.status(200).send({ status: 200, message: "Race complete", data: update, });
                        }
                        if (user.win == "med") {
                                let winningCar = user.medium
                                for (let i = 0; i < findBet.length; i++) {
                                        if (findBet[i].betOn == "I") {
                                                if (findBet[i].betOn == winningCar) {
                                                        findBet[i].status = "win";
                                                        findBet[i].winAmount = findBet[i].betAmount * findBet[i].car1Id.odds;
                                                        findBet[i].save();
                                                } else {
                                                        findBet[i].status = "loss";
                                                        findBet[i].winAmount = 0;
                                                        findBet[i].save();
                                                }
                                        }
                                        else if (findBet[i].betOn == "II") {
                                                if (findBet[i].betOn == winningCar) {
                                                        findBet[i].status = "win";
                                                        findBet[i].winAmount = findBet[i].betAmount * findBet[i].car2Id.odds;
                                                        findBet[i].save();
                                                } else {
                                                        findBet[i].status = "loss";
                                                        findBet[i].winAmount = 0;
                                                        findBet[i].save();
                                                }
                                        } else {
                                                if (findBet[i].betOn == winningCar) {
                                                        findBet[i].status = "win";
                                                        findBet[i].winAmount = findBet[i].betAmount * findBet[i].car3Id.odds;
                                                        findBet[i].save();
                                                } else {
                                                        findBet[i].status = "loss";
                                                        findBet[i].winAmount = 0;
                                                        findBet[i].save();
                                                }
                                        }
                                        console.log(findBet[i]);
                                }
                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { status: "completed" }, { new: true })
                                return res.status(200).send({ status: 200, message: "Race complete", data: update, });
                        }
                        if (user.win == "low") {
                                let winningCar = user.lowest
                                for (let i = 0; i < findBet.length; i++) {
                                        if (findBet[i].betOn == "I") {
                                                if (findBet[i].betOn == winningCar) {
                                                        findBet[i].status = "win";
                                                        findBet[i].winAmount = findBet[i].betAmount * findBet[i].car1Id.odds;
                                                        findBet[i].save();
                                                } else {
                                                        findBet[i].status = "loss";
                                                        findBet[i].winAmount = 0;
                                                        findBet[i].save();
                                                }
                                        }
                                        else if (findBet[i].betOn == "II") {
                                                if (findBet[i].betOn == winningCar) {
                                                        findBet[i].status = "win";
                                                        findBet[i].winAmount = findBet[i].betAmount * findBet[i].car2Id.odds;
                                                        findBet[i].save();
                                                } else {
                                                        findBet[i].status = "loss";
                                                        findBet[i].winAmount = 0;
                                                        findBet[i].save();
                                                }
                                        } else {
                                                if (findBet[i].betOn == winningCar) {
                                                        findBet[i].status = "win";
                                                        findBet[i].winAmount = findBet[i].betAmount * findBet[i].car3Id.odds;
                                                        findBet[i].save();
                                                } else {
                                                        findBet[i].status = "loss";
                                                        findBet[i].winAmount = 0;
                                                        findBet[i].save();
                                                }
                                        }
                                }
                                let update = await Race.findByIdAndUpdate({ _id: user._id }, { status: "completed" }, { new: true })
                                return res.status(200).send({ status: 200, message: "Race complete", data: update, });
                        }

                }
        } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
        }
};
exports.addBets = async (req, res) => {
        try {
                let { raceId, carId, selectedCar, betAmount } = req.body;
                if (!raceId || !selectedCar || !betAmount) {
                        return res.status(400).json({ error: 'Missing required fields' });
                }
                let userId = req.user._id;
                let race, newBet;
                let car1Id, car2Id, car3Id, betOn, existingBet;
                if (selectedCar == "car1") {
                        existingBet = await Bet.findOne({ userId, raceId, car1Id: carId });
                        car1Id = carId; car2Id = null; car3Id = null; betOn = "I";
                } else if (selectedCar == "car2") {
                        existingBet = await Bet.findOne({ userId, raceId, car2Id: carId });
                        car2Id = carId; car1Id = null; car3Id = null; betOn = "II";
                } else {
                        existingBet = await Bet.findOne({ userId, raceId, car3Id: carId });
                        car3Id = carId; car2Id = null; car1Id = null; betOn = "III";
                }
                console.log(existingBet);
                if (!existingBet) {
                        const obj = { userId, raceId, car1Id: car1Id, car2Id: car2Id, car3Id: car3Id, betAmount, betOn: betOn, };
                        newBet = new Bet(obj);
                        await newBet.save();
                        race = await Race.findOneAndUpdate(
                                { _id: raceId },
                                {
                                        $inc: {
                                                noOfuser: 1,
                                                betsAmount: betAmount,
                                                [`${selectedCar}BetAmount`]: betAmount,
                                        },
                                },
                                { new: true }
                        );
                } else {
                        let previousBetAmount = betAmount - existingBet.betAmount;
                        existingBet.betAmount = betAmount;
                        await existingBet.save();
                        let findRace = await Race.findOne({ _id: raceId, },);
                        if (selectedCar == "car1") {
                                race = await Race.findOneAndUpdate({ _id: raceId, }, { $set: { betsAmount: findRace.betsAmount + previousBetAmount, car1BetAmount: findRace.car1BetAmount + previousBetAmount, }, }, { new: true });
                        } else if (selectedCar == "car2") {
                                race = await Race.findOneAndUpdate({ _id: raceId, }, { $set: { betsAmount: findRace.betsAmount + previousBetAmount, car2BetAmount: findRace.car2BetAmount + previousBetAmount, }, }, { new: true });
                        } else {
                                race = await Race.findOneAndUpdate({ _id: raceId, }, { $set: { betsAmount: findRace.betsAmount + previousBetAmount, car3BetAmount: findRace.car3BetAmount + previousBetAmount, }, }, { new: true });
                        }
                }
                return res.status(200).json({
                        status: 200,
                        message: 'Bet added successfully',
                        data: { bet: existingBet || newBet, race },
                });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Internal server error', data: error.message });
        }
};
exports.getBet = async (req, res) => {
        try {
                let findSpeed = await Bet.find({ userId: req.user._id, raceId: req.params.raceId });
                if (findSpeed.length === 0) {
                        return res.status(404).send({ status: 404, message: "Bets not found", data: {} });
                }
                return res.status(200).send({ status: 200, message: "Bets found", data: findSpeed });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "Internal server error", data: error.message });
        }
};
exports.thisWeek = async (req, res) => {
        try {
                const userId = req.user._id;
                const currentDate = new Date();
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(currentDate.getDate() - 7);
                const result = await Bet.aggregate([
                        {
                                $match: {
                                        userId: userId,
                                        createdAt: {
                                                $gte: sevenDaysAgo,
                                                $lte: currentDate,
                                        },
                                        status: 'win',
                                },
                        },
                        {
                                $lookup: {
                                        from: 'users',
                                        localField: 'userId',
                                        foreignField: '_id',
                                        as: 'user',
                                },
                        },
                        {
                                $unwind: '$user', // Unwind the user array
                        },
                        {
                                $group: {
                                        _id: {
                                                year: { $year: '$createdAt' },
                                                month: { $month: '$createdAt' },
                                                day: { $dayOfMonth: '$createdAt' },
                                        },
                                        totalWinAmount: { $sum: '$winAmount' },
                                        user: { $first: '$user' }, // Use $first to keep only the first user document
                                },
                        },
                        {
                                $project: {
                                        _id: 0, // Exclude the _id field
                                        date: '$_id',
                                        totalWinAmount: 1,
                                        user: {
                                                image: '$user.image',
                                                firstName: '$user.firstName',
                                        },
                                },
                        },
                        {
                                $sort: { 'date.year': 1, 'date.month': 1, 'date.day': 1 },
                        },
                ]);

                return res.status(200).json({ status: 200, message: 'Bet successfully', data: result });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Internal server error', data: error.message });
        }
};
exports.lastWeek = async (req, res) => {
        try {
                const userId = req.user._id;
                const currentDate = new Date();
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(currentDate.getDate() - 14);
                const result = await Bet.aggregate([
                        {
                                $match: {
                                        userId: userId,
                                        createdAt: {
                                                $gte: sevenDaysAgo,
                                                $lte: currentDate,
                                        },
                                        status: 'win',
                                },
                        },
                        {
                                $lookup: {
                                        from: 'users',
                                        localField: 'userId',
                                        foreignField: '_id',
                                        as: 'user',
                                },
                        },
                        {
                                $unwind: '$user', // Unwind the user array
                        },
                        {
                                $group: {
                                        _id: {
                                                year: { $year: '$createdAt' },
                                                month: { $month: '$createdAt' },
                                                day: { $dayOfMonth: '$createdAt' },
                                        },
                                        totalWinAmount: { $sum: '$winAmount' },
                                        user: { $first: '$user' }, // Use $first to keep only the first user document
                                },
                        },
                        {
                                $project: {
                                        _id: 0, // Exclude the _id field
                                        date: '$_id',
                                        totalWinAmount: 1,
                                        user: {
                                                image: '$user.image',
                                                firstName: '$user.firstName',
                                        },
                                },
                        },
                        {
                                $sort: { 'date.year': 1, 'date.month': 1, 'date.day': 1 },
                        },
                ]);

                return res.status(200).json({ status: 200, message: 'Bet successfully', data: result });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Internal server error', data: error.message });
        }
};
exports.updatewinningbet = async (req, res) => {
        try {
                const betId = req.body.betId;
                const newWinningAmount = req.body.newWinningAmount; // Assuming you pass the new winning amount in the request body
                const updatedBet = await Bet.findByIdAndUpdate(betId, { $set: { winAmount: newWinningAmount, status: "win" } }, { new: true });
                if (!updatedBet) {
                        return res.status(404).json({ status: 404, message: 'Bet not found' });
                }
                return res.status(200).json({ status: 200, message: 'Winning amount updated successfully', data: updatedBet });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Internal server error', data: error.message });
        }
};
exports.carwisewinningamountondate = async (req, res) => {
        try {
                const dateParam = req.params.date;
                const selectedDate = new Date(dateParam);
                if (isNaN(selectedDate.getTime())) {
                        return res.status(400).json({ status: 400, message: 'Invalid date format' });
                }
                const nextDate = new Date(selectedDate);
                nextDate.setDate(selectedDate.getDate() + 1);
                const result = await Bet.aggregate([
                        {
                                $match: {
                                        createdAt: {
                                                $gte: selectedDate,
                                                $lt: nextDate,
                                        },
                                        status: 'win',
                                },
                        },
                        {
                                $group: {
                                        _id: '$car2Id',
                                        totalWinners: { $addToSet: '$userId' },
                                        totalWinAmount: { $sum: '$winAmount' },
                                },
                        },
                        {
                                $lookup: {
                                        from: 'cars',
                                        localField: '_id',
                                        foreignField: '_id',
                                        as: 'carDetails',
                                },
                        },
                        {
                                $unwind: '$carDetails',
                        },
                        {
                                $project: {
                                        _id: 0,
                                        carId: '$_id',
                                        carName: '$carDetails.name',
                                        carImage: '$carDetails.image',
                                        totalWinners: { $size: '$totalWinners' },
                                        totalWinAmount: 1,
                                },
                        },
                ]);

                return res.status(200).json({ status: 200, message: 'Data retrieved successfully', data: result });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Internal server error', data: error.message });
        }
};
exports.carwisewinningamountondatebyToken = async (req, res) => {
        try {
                const dateParam = req.params.date;
                const selectedDate = new Date(dateParam);
                if (isNaN(selectedDate.getTime())) {
                        return res.status(400).json({ status: 400, message: 'Invalid date format' });
                }
                const userId = req.user._id;
                const nextDate = new Date(selectedDate);
                nextDate.setDate(selectedDate.getDate() + 1);
                const result = await Bet.aggregate([
                        {
                                $match: {
                                        userId: userId,
                                        createdAt: {
                                                $gte: selectedDate,
                                                $lt: nextDate,
                                        },
                                        status: 'win',
                                },
                        },
                        {
                                $group: {
                                        _id: '$car2Id',
                                        totalWinners: { $addToSet: '$userId' },
                                        totalWinAmount: { $sum: '$winAmount' },
                                },
                        },
                        {
                                $lookup: {
                                        from: 'cars',
                                        localField: '_id',
                                        foreignField: '_id',
                                        as: 'carDetails',
                                },
                        },
                        {
                                $unwind: '$carDetails',
                        },
                        {
                                $project: {
                                        _id: 0,
                                        carId: '$_id',
                                        carName: '$carDetails.name',
                                        carImage: '$carDetails.image',
                                        totalWinners: { $size: '$totalWinners' },
                                        totalWinAmount: 1,
                                },
                        },
                ]);

                return res.status(200).json({ status: 200, message: 'Data retrieved successfully', data: result });
        } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 500, message: 'Internal server error', data: error.message });
        }
};
exports.carondate = async (req, res) => {
        try {
                let carId = req.query.carId;
                let date = req.query.date;
                const carFields = ['car1Id', 'car2Id', 'car3Id'];
                const carQuery = carFields.reduce((acc, field) => {
                        acc.$or.push({ [field]: carId });
                        return acc;
                }, { $or: [], createdAt: { $gte: new Date(date + "T00:00:00.000Z"), $lte: new Date(date + "T23:59:59.999Z") }, status: "win" });
                const carQuery1 = carFields.reduce((acc, field) => {
                        acc.$or.push({ [field]: carId });
                        return acc;
                }, { $or: [], createdAt: { $gte: new Date(date + "T00:00:00.000Z"), $lte: new Date(date + "T23:59:59.999Z") } });
                const betStatistics = await Bet.find(carQuery).populate('userId', 'firstName image');
                const betStatistics1 = await Bet.find(carQuery1)
                const totalWinnerUsers = betStatistics.length;
                const totalWinningAmount = betStatistics.reduce((total, bet) => total + bet.winAmount, 0);
                const car = await Car.findById(carId);
                if (!car) {
                        return res.status(404).send({ status: 404, message: "car not found ", data: {}, });
                }
                const result = {
                        car: car,
                        totalUser: betStatistics1.length,
                        totalWinnerUsers,
                        totalWinningAmount,
                        betStatistics
                };

                res.json(result);
        } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Internal Server Error" });
        }
};

const reffralCode = async () => {
        var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let OTP = '';
        for (let i = 0; i < 9; i++) {
                OTP += digits[Math.floor(Math.random() * 36)];
        }
        return OTP;
}
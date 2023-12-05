const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
        {
                raceId: {
                        type: String,
                },
                raceNo: {
                        type: Number,
                },
                car1: {
                        car: {
                                type: schema.Types.ObjectId,
                                ref: "car"
                        },
                        track1Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        track2Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        track3Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        noOfTrack1: {
                                type: Number,
                        },
                        noOfTrack2: {
                                type: Number,
                        },
                        noOfTrack3: {
                                type: Number,
                        },
                },
                car2: {
                        car: {
                                type: schema.Types.ObjectId,
                                ref: "car"
                        },
                        track1Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        track2Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        track3Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        noOfTrack1: {
                                type: Number,
                        },
                        noOfTrack2: {
                                type: Number,
                        },
                        noOfTrack3: {
                                type: Number,
                        },
                },
                car3: {
                        car: {
                                type: schema.Types.ObjectId,
                                ref: "car"
                        },
                        track1Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        track2Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        track3Id: {
                                type: schema.Types.ObjectId,
                                ref: "speed"
                        },
                        noOfTrack1: {
                                type: Number,
                        },
                        noOfTrack2: {
                                type: Number,
                        },
                        noOfTrack3: {
                                type: Number,
                        },
                },
                firstTrack: {
                        type: Number,
                        min: 1,
                        max: 3
                },
                noOfuser: {
                        type: Number,
                        default: 0
                },
                betsAmount: {
                        type: Number,
                        default: 0
                },
                car1BetAmount: {
                        type: Number,
                        default: 0
                },
                car2BetAmount: {
                        type: Number,
                        default: 0
                },
                car3BetAmount: {
                        type: Number,
                        default: 0
                },
                winCar: {
                        type: String,
                },
                maximum: {
                        type: String,
                        enum: ["I", "II", "III"]
                },
                medium: {
                        type: String,
                        enum: ["I", "II", "III"]
                },
                lowest: {
                        type: String,
                        enum: ["I", "II", "III"]
                },
                win: {
                        type: String,
                        enum: ["max", "med", "low"]
                },
                status: {
                        type: String,
                        enum: ["pending", "started", "completed"],
                        default: "pending"
                },
        },
        { timestamps: true }
);
module.exports = mongoose.model("race", userSchema);

const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
        {
                userId: {
                        type: schema.Types.ObjectId,
                        ref: "user"
                },
                raceId: {
                        type: schema.Types.ObjectId,
                        ref: "race"
                },
                car1Id: {
                        type: schema.Types.ObjectId,
                        ref: "car"
                },
                car2Id: {
                        type: schema.Types.ObjectId,
                        ref: "car"
                },
                car3Id: {
                        type: schema.Types.ObjectId,
                        ref: "car"
                },
                betAmount: {
                        type: Number,
                        default: 0
                },
                winAmount: {
                        type: Number,
                        default: 0,
                },
                status: {
                        type: String,
                        enum: ["win", "loss", "pending"],
                        default: "pending"
                },
                betOn: {
                        type: String,
                        enum: ["I", "II", "III"]
                },
        },
        { timestamps: true }
);
module.exports = mongoose.model("bet", userSchema);

const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
        {
                carId: {
                        type: schema.Types.ObjectId,
                        ref: "car"
                },
                trackId: {
                        type: schema.Types.ObjectId,
                        ref: "track"
                },
                speed: {
                        type: Number,
                },
        },
        { timestamps: true }
);
module.exports = mongoose.model("speed", userSchema);

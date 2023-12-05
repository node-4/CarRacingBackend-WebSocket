const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
        {
                name: {
                        type: String,
                },
                victory: {
                        type: Number,
                },
                odds: {
                        type: Number,
                },
                image: {
                        type: String,
                },
        },
        { timestamps: true }
);
module.exports = mongoose.model("car", userSchema);

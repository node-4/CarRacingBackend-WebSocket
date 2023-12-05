const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
        {
                name: {
                        type: String,
                },
                image: {
                        type: String,
                },
        },
        { timestamps: true }
);
module.exports = mongoose.model("track", userSchema);

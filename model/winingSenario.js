const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
    {
        max: {
            type: Array
        },
        med: {
            type: Array
        },
        low: {
            type: Array
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("winingSenario", userSchema);

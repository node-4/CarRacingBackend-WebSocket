const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
        {
                fullName: {
                        type: String,
                },
                firstName: {
                        type: String,
                },
                lastName: {
                        type: String,
                },
                language: {
                        type: String,
                },
                image: {
                        type: String,
                },
                gender: {
                        type: String,
                },
                phone: {
                        type: String,
                },
                email: {
                        type: String,
                        minLength: 10,
                },
                password: {
                        type: String,
                },
                otp: {
                        type: String,
                },
                otpExpiration: {
                        type: Date,
                },
                userType: {
                        type: String,
                        enum: ["User", "Admin"],
                        default: "User"
                },
                refferalCode: { type: String, },
                refferUserId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
                joinUser: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
                accountVerification: {
                        type: Boolean,
                        default: false,
                },
                wallet: {
                        type: Number,
                        default: 0,
                },
        },
        { timestamps: true }
);
module.exports = mongoose.model("user", userSchema);

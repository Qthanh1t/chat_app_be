const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String, require: true},
    email:    {type: String, require: true, unique: true},
    password: {type: String, require: true},
    avatar:   {type: String, default: ""},
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
},{timestamps: true});

module.exports = mongoose.model("User", userSchema);
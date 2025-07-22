const mongoose = require('mongoose');

const friendRequestSchema = mongoose.Schema({
    from: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
    to: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
    status: {type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending'},
    createAt: {type: Date, default: Date.now}
})

module.exports = mongoose.model('FriendRequest', friendRequestSchema);
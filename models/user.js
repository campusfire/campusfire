const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    _id:{
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
    },
    user_key: { type: String, default: null },
    nb_like: { type: Number, default: 0 },
    nb_dislike: { type: Number, default: 0 },
    nb_post: { type: Number, default: 0 },
    connection_time: Date,
    disconnection_time: Date,
});

module.exports = mongoose.model('User', userSchema);

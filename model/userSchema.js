const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = new Schema( {
    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('users', usersSchema);
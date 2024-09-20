const mongoose = require('mongoose');

const contactus = new mongoose.Schema({

    name: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    phone_no: {
        type: String,
        required: false,
    },
    message: {
        type: String,
        required: false
    }
},
    { timestamps: true });

const contactusModel = mongoose.model("contactus", contactus);
module.exports = contactusModel;
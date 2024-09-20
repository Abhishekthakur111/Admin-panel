const mongoose = require('mongoose');
const category = require('../models/category');


const service = mongoose.Schema({

    cat_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'category',
        required:" true"
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: false,
    },
    status: {
        type: String,
        enum: ['0', '1'],
        default: '1',
    }

} ,{timestamps: true});

const serviceModel = mongoose.model("service", service);
module.exports = serviceModel;
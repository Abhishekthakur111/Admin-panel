const mongoose = require('mongoose');


const user = require('../models/user'); 
const category = require('../models/category');
const Service = require('../models/servicelist'); 



const bookingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true,
    },
      service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service', 
        required: true,
    },
    amount: {
        type: Number, 
        required: false,
    },
    no_of_booking: {
        type: Number, 
        required: false,
    },
    description: { 
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ['0', '1'],
        default: '1',
    },
    location: {
        type: String,
        required: false,
    },
   
    booking_code: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const BookingModel = mongoose.model('Booking', bookingSchema); 

module.exports = BookingModel;

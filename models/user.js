const mongoose = require('mongoose');

const user = new mongoose.Schema({

    role:{
        type:String,
        enum: ['0', '1','2','3'],
       required: false,
    },
    name:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        required: true,
    },
    password:{
        type:String,
        required: false,
    },
    image:{
        type:String,
        required:false,
    },
    address:{
        type:String,
        required: false,
    },
    phone_no:{
        type: String,
        required: false,
    },
    status:{
        type: String,
        enum:['0', '1'],
        default: '1'
    }

},
{timestamps: true});

const userModel = mongoose.model("user", user);
module.exports = userModel;
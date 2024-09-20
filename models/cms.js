const mongoose = require('mongoose');

const cms = new mongoose.Schema({

    role:{
        type:String,
        enum: ['1', '2','3'],
       required: false,
    },
    title:{
        type:String,
        required: false,
    },
     content :{
        type:String,
        required: true,
    },
},
{timestamps: true});

const cmsModel = mongoose.model("cms", cms);
module.exports = cmsModel;
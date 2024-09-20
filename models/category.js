const mongoose = require('mongoose');

const category = new mongoose.Schema({    
    category_name:{
        type:String,
        required: false,
    },
     image :{
        type:String,
        required: false,
    },
    status:{
        type:String,
        enum:[ '0','1'],
        default: '1',
    }
},
{timestamps: true});

const categoryModel = mongoose.model("category", category);
module.exports = categoryModel;
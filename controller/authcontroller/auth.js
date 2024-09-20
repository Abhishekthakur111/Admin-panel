const { Validator } = require('node-input-validator');
const helper = require('../../helper/helper');
const bcrypt = require ('bcrypt');
const user = require('../../models/user');

module.exports = {
    createuser:async(req,res)=>{
        try {
            const v = new Validator(req.body, {
              email: "required|email",
              password: "required|string|minLength:6",
              role: "required|integer",
            });
      
            let errorsResponse = await helper.checkValidation(v);
            if (errorsResponse) {
              return helper.error(res, errorsResponse);
            }
      
            const find_email = await user.findOne({ email: req.body.email });
            if (find_email) {
              return helper.error(res, "User already exists with that email");
            } 
         
         
            if (req.files && req.files.image) {
                let images = await helper.fileUpload(req.files.image);
                req.body.image = images;
              }
      
             const hashedpassword = await bcrypt.hash(req.body.password, 10)
              let data = await user.create({
                role: req.body.role,
                name: req.body.name,
                email: req.body.email,
                password: hashedpassword,
                address: req.body.address,
                phone_no: req.body.phone_no,
                image: req.body.image,
              });
              return helper.success(res, "User Created Successfully", { data});
            }
           catch (error) {
            console.error("Error creating user:", error);
            return helper.error(res, "Internal server error");
          }
    }
}

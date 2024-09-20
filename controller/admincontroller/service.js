const helper = require('../../helper/helper');
const servicelist = require('../../models/servicelist');
const category = require('../../models/category');
const { Validator } = require('node-input-validator');

module.exports = {
    createservice: async (req, res) => {
        try {
            const v = new Validator(req.body, {
                name: "required",
                price: 'string',
                image: "string", 
                cat_id:"required"  
            });
            let errorsResponse = await helper.checkValidation(v);
            if (errorsResponse) {
                return helper.error(res, errorsResponse);
            }
            if (req.files && req.files.image) {
                let images = await helper.fileUpload(req.files.image);
                req.body.image = images;
            }
            const data = await servicelist.create({
                name: req.body.name,
                price: req.body.price,
                image: req.body.image,
                cat_id: req.body.cat_id
            });
            
             req.flash("success","Add service successfully");
          res.redirect('/servicelist');
        } catch (error) {
           console.error("Error creating service:", error);
            return helper.error(res, "Internal server error");
        }
    },
    getservice:async(req,res)=>{
        try {
         if (!req.session.admin) return res.redirect("/login");
          const service = await servicelist.find({})
          .populate('cat_id')
          .exec();
          console.log(service,'///////////////////////');

          res.render("service/servicelist", {
            title: "Services",
            service,
            session: req.session.admin,
          });
          
          
         } catch (error) {
            console.error("Error view:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
    service_status: async (req, res) => {
        try {
            const { _id } = req.body;
            if (!_id) {
                return res.status(400).json({ success: false, message: "Missing _id" });
            }
            const userDoc = await servicelist.findById(_id);
            if (!userDoc) {
                return res.status(404).json({ success: false, message: " not found" });
            }
        
            const updatedUser = await servicelist.findByIdAndUpdate(
                _id,
                { $set: { status: req.body.status } },
                { new: true } 
            );
            res.json({ 
                success: true, 
                data: updatedUser });
        } catch (error) {
            console.error("Error updating status:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
    service_delete: async (req, res) => {
        try {
            const catId = req.params._id;
            if (!catId) {
                return res.status(400).json({ success: false, message: " ID is required" });
            }
            const catDoc = await servicelist.findById(catId);
            if (!catDoc) {
                return res.status(404).json({ success: false, message: " not found" });
            }
            await servicelist.findByIdAndDelete(catId);
    
            res.json({ success: true, message: " deleted successfully" });
        } catch (error) {
            console.error("Error deleting cat:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }, 
    serviceview: async(req,res)=>{
        try {
          const data = await servicelist.findOne(

            {_id:req.params._id})
            .populate('cat_id')
            .exec();
        
          res.render("service/serviceview", {
            title: "Details",
            data,
            session: req.session.admin,
          });
        } catch (error) {
          console.error("Error view", error);
          res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
    serviceadd:async(req,res) => {
        try {
            if (!req.session.admin) return res.redirect("/login");

            const data = await category.find({raw:true});
            res.render('service/serviceadd',{
              session:req.session.admin,
              title:"Add Service",
              data
            });
          } catch (error) {
            console.error("Error view", error);
            res.status(500).json({ success: false, message: "Internal server error" });
          }
    }
}

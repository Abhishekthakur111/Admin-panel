const { response } = require('express');
const helper = require('../../helper/helper');
const category = require('../../models/category');


module.exports = {
    createcategory:async(req,res)=>{
        try {
           

        if (req.files && req.files.image) {
            const imagePath = await helper.fileUpload(req.files.image);
            req.body.image = imagePath;
        }
        const data = await category.create({
            category_name: req.body.category_name,
            image: req.body.image,
        });
        req.flash("success"," Category add successfully");
        res.redirect('/categorylist');

       
        } catch (error) {
            console.log(error,'error creating category');
            res.status(500).json({success:'false', message:'error creatng category'});
        }
    },
    categorylist:async(req,res)=>{
        try {
            if(!req.session.admin) return res.redirect('/login');
            const data = await category.find({});
            res.render('category/categorylist',{
                data,
                session:req.session.admin,
                title: 'Categories'
            }) 
        } catch (error) {
            console.log(error,'error  get category');
            res.status(500).json({success:'false', message:'error  category'});
        }
    },
    categoryview:async(req,res)=>{
        try {
           if(!req.session.admin) return res.redirect('/login');
           const data = await category.findOne({
            _id:req.params._id,
           });
           res.render('category/categoryview.ejs',{
            session:req.session.admin,
            data,
            title:'Details'
           });
        } catch (error) {
            console.log(error,'error  view category');
            res.status(500).json({success:'false', message:'error  view category'});
        }
    },
    cat_status: async (req, res) => {
        try {
            const { _id } = req.body;
            if (!_id) {
                return res.status(400).json({ success: false, message: "Missing _id" });
            }
            const userDoc = await category.findById(_id);
            if (!userDoc) {
                return res.status(404).json({ success: false, message: " not found" });
            }
        
            const updatedUser = await category.findByIdAndUpdate(
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
    cat_delete: async (req, res) => {
        try {
            const catId = req.params._id;
            if (!catId) {
                return res.status(400).json({ success: false, message: " ID is required" });
            }
            const catDoc = await category.findById(catId);
            if (!catDoc) {
                return res.status(404).json({ success: false, message: " not found" });
            }
            await category.findByIdAndDelete(catId);
    
            res.json({ success: true, message: " deleted successfully" });
        } catch (error) {
            console.error("Error deleting cat:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }, 
    addcategory:async(req,res)=>{
        try {
          if (!req.session.admin) return res.redirect("/login");
          res.render('category/categoryadd.ejs',{
            session:req.session.admin,
            title:"Add Category",
          });
        } catch (error) {
          console.error("Error view", error);
          res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
} 
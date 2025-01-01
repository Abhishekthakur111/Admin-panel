const user = require("../../models/user");
const bcrypt = require('bcrypt');
const helper = require('../../helper/helper');
const Category = require('../../models/category');
const Service = require('../../models/servicelist');
const Booking = require('../../models/booking');

module.exports = {
    dashboard: async (req, res) => {
        try {
            const data = await user.countDocuments({ role: '1' });
            const provider = await Category.countDocuments({});
            const worker = await Service.countDocuments({});
            const booking = await Booking.countDocuments({});
            const usersByMonth = await user.aggregate([
                { $match: { role: '1' } },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            const chartData = Array(12).fill(0);
            usersByMonth.forEach(item => {
                chartData[item._id - 1] = item.count;
            });
           
            res.render('dashboard', {
                session: req.session.admin,
                title: 'Dashboard',
                data,
                provider,
                worker,
                chartData,
                booking
                
            });
        } catch (error) {
            console.error(error, 'Error in dashboard');
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    login: async (req, res) => {
        try {
            res.render('login');
        } catch (error) {
            console.log(error, 'error');
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    loginpost: async (req, res) => {
        try {
            const {  password } = req.body;

            const find_user = await user.findOne({ email: req.body.email, role:'0'
             });
            if (!find_user) {
                req.flash("error", "");
            }
            const storedHash = find_user.password;
            const is_password = await bcrypt.compare(password, storedHash);
            if (!is_password) {
                req.flash("error", "Password is invalid");
                return res.redirect('/login');
            }
            if (is_password) {
                if (find_user.role == 0) {
                    req.session.admin = find_user;
                    req.flash("success", " login succesfully ");
                    return res.redirect('/dashboard');
                    
                } else {
                    req.flash("error", "invalid crentials");
                    return res.redirect('/login'); 
                }

            }
        }
        catch (error) {
            console.error('Error during login:', error);
            req.flash("error", "Email is Invalid");
            return res.redirect('/login'); 
        }
    },
    profile: async (req, res) => {
        try {
          const userId = req.session.admin._id;
          const profile = await user.findById(userId).select('name email phone_no image address'); 
         res.render('admin/profile.ejs',{
            session:req.session.admin,
            profile,
            title:'profile',
         })
        } catch (error) {
            res.redirect('back');
            return helper.error(res, "Error fetching profile.", { error: error.message });
        }
    },
    edit_profile: async (req, res) => {
        try {
            let updateData = { ...req.body }; 
            if (req.files && req.files.image) {
                let folder = "admin";
                 let imagePath = await helper.fileUpload(req.files.image, folder);
                updateData.image = imagePath; 
            };           
            await user.findByIdAndUpdate(req.session.admin._id, updateData, { new: true }); 
            const updatedUser = await user.findById(req.session.admin._id);
            req.session.admin = updatedUser;
            req.flash("success", "Profile updated successfully");
            res.redirect("/profile");
        } catch (error) {
            console.error("Error updating profile:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    password: async(req,res)=>{
        try {   
            res.render('admin/password.ejs',{
                session: req.session.admin,
                title: "Change Password",
            })
        } catch (error) {
            console.error("Error", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }, 
    updatepassword: async (req, res) => {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        try {
            if (!oldPassword || !newPassword || !confirmPassword) {
                req.flash("error", "All fields are required");
                return res.redirect("back");
            }
            if (newPassword !== confirmPassword) {
                req.flash("error", "New password and confirm password do not match");
                return res.redirect("back");
            }
            const currentUser = await user.findById(req.session.admin._id);
            if (!currentUser) {
                req.flash("error", "User not found");
                return res.redirect("back");
            }
            const isMatch = await bcrypt.compare(oldPassword, currentUser.password);
            if (!isMatch) {
                req.flash("error", "Old password is incorrect");
                return res.redirect("back");
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            currentUser.password = hashedPassword;
            await currentUser.save();
            req.session.admin.password = hashedPassword;
            req.flash("success", "Password updated successfully");
            return res.redirect('/login');
        } catch (error) {
            req.flash("error", "Internal server error");
            return res.redirect("back");
        }
    }, 
    logout:async(req,res)=>{
            try {
                delete  req.session.admin 
                res.redirect('/login')
            } catch (error) {
                return helper.error(res, error);
            }
    },
    user_list: async (req, res) => {  
            try { 
              const data = await user.find({
                  role: "1",
                raw: true,
              });
              res.render("admin/userlist", {
                title: "Users",
                data,
                session: req.session.admin,
              });
            } catch (error) {
                req.flash('error', `Error fetching userlist: ${error.message}`);
                res.redirect('back');
            }
    },
    user_status: async (req, res) => {
            try {
                const { _id } = req.body;
                const userDoc = await user.findById(_id);
                const updatedUser = await user.findByIdAndUpdate(
                    _id,
                    { $set: { status: req.body.status} },
                    { new: true } 
                );
                res.json({ 
                    success: true, 
                    data: updatedUser });
            } catch (error) {
                req.flash('error', `Error updating status: ${error.message}`);
                res.redirect('back');
            }
    },    
    view: async (req, res) => {
        try {
            const userId = req.params._id;
            const userDoc = await user.findOne({ _id: userId });
            res.render("admin/view.ejs", {
                session: req.session.admin,
                view: userDoc,
                title: "User Detail"
            });
        } catch (error) {
         throw error
        }
    },
    user_delete: async (req, res) => {
        try {
            const userId = req.params._id;
            const userDoc = await user.findById(userId);
            await user.findByIdAndDelete(userId);
            res.json({ success: true, message: "User deleted successfully" });
        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },     
    map:async(req,res)=>{
        try {
            res.render('map/leafmap',{
                session:req.session.admin,
                title:"Map"
            })
        } catch (error) {
            console.error("Error ", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },
}
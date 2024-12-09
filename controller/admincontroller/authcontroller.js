const user = require("../../models/user");
const bcrypt = require('bcrypt');
const helper = require('../../helper/helper');
const Category = require('../../models/category');
const Service = require('../../models/servicelist');
const Booking = require('../../models/booking');

module.exports = {
    dashboard: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect('/login');
    
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
          console.error("Error fetching profile:", error);
          return res.status(500).json({ message: "An error occurred while fetching profile" });
        }
    },
    edit_profile: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect("/login");
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
            if (!req.session.admin) return res.redirect("/login");
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
                if (!req.session.admin) return res.redirect("/login");
    
               
                if (!oldPassword || !newPassword || !confirmPassword) {
                    return res.status(400).json({ message: 'All fields are required' });
                }
                if (newPassword !== confirmPassword) {
                    return res.status(400).json({ message: 'New password and confirm password do not match' });
                }
                const currentUser = await user.findById(req.session.admin._id);
                if (!currentUser) {
                    return res.status(404).json({ message: 'User not found' });
                }
                const isMatch = await bcrypt.compare(oldPassword, currentUser.password);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Old password is incorrect' });
                }
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                currentUser.password = hashedPassword;
                await currentUser.save();
                req.session.admin.password = hashedPassword;
                req.flash("success", "Password updated successfully");
                res.redirect('/login');
            } catch (error) {
                console.error('Error updating password:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
    },
    logout:async(req,res)=>{
            try {
                req.session.destroy();
                res.redirect('/login')
            } catch (error) {
                return helper.error(res, error);
            }
    },
    user_list: async (req, res) => {  
            try {
              if (!req.session.admin) return res.redirect("/login");
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
              console.error("Error fetching user list:", error);
              res.status(500).json({ message: "Internal server error" });
            }
    },
    user_status: async (req, res) => {
            try {
                const { _id } = req.body;
                if (!_id) {
                    return res.status(400).json({ success: false, message: "Missing _id" });
                }
                const userDoc = await user.findById(_id);
                if (!userDoc) {
                    return res.status(404).json({ success: false, message: "User not found" });
                }
               
                const updatedUser = await user.findByIdAndUpdate(
                    _id,
                    { $set: { status: req.body.status} },
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
    view: async (req, res) => {
        try {
            if (!req.session.admin) return res.redirect("/login");
    
            const userId = req.params._id;
            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }
            const userDoc = await user.findOne({ _id: userId, role: [ '1', '2', '3'] });
            let title = '';
            if (userDoc) {
                switch (userDoc.role) {
                    case '1':
                        title = 'User Detail';
                        break;
                    case '2':
                        title = 'Provider Detail';
                        break;
                    case '3':
                        title = 'Worker Detail';
                        break;
                    default:
                        title = 'User Details';
                        break;
                }
            } else {
                return res.status(404).json({ message: "User not found" });
            }
    
            res.render("admin/view.ejs", {
                session: req.session.admin,
                view: userDoc,
                title: title
            });
        } catch (error) {
            console.error("Error fetching user view:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    user_delete: async (req, res) => {
        try {
            const userId = req.params._id;
            if (!userId) {
                return res.status(400).json({ success: false, message: "User ID is required" });
            }
            const userDoc = await user.findById(userId);
            if (!userDoc) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            await user.findByIdAndDelete(userId);
    
            res.json({ success: true, message: "User deleted successfully" });
        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    },     
    map:async(req,res)=>{
        try {
            if(!req.session.admin) return res.redirect('/login');
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